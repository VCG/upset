/**
 * author: Alexander Lex - alex@seas.harvard.edu Inspired by
 */

var sets = [];
var subsets = [];
var labels = [];
var combinations = 0;
var depth = 0;

/** The list of available datasets */
var dataSets;


d3.json("datasets.json", function (error, json) {
    if (error) return console.warn(error);
    dataSets = json;
    console.log(dataSets);
    load()
});


function load() {

    console.log(dataSets);
    var select = d3.select("#header").append("select");
    select.on("change", change)
        .selectAll("option").data(dataSets).enter().append("option")
        .attr("value", function (d) {
            return d.file;
        })
        .attr("id", "dataSetSelector")
        .text(function (d) {
            return d.text;
        })

    loadDataset(dataSets[0].file);
}

function loadDataset(dataFile) {
    d3.text(dataFile, "text/csv", dataLoad);
}

function change() {
    sets.length = 0;
    subsets.length = 0;
    labels.length = 0;
    loadDataset(this.options[this.selectedIndex].value);
}


function SetIntersection() {
    this.expectedValue;
}
SetIntersection.prototype.Set = function () {
    this.size *= 2;
}

function Set(setID, setName, combinedSets, setData) {
    /** The binary representation of the set */
    this.setID = setID;
    /** The name of the set */
    this.setName = setName;
    /** An array of all the sets that are combined in this set. The array contains a 1 if a set at the corresponding position in the sets array is combined. */
    this.combinedSets = combinedSets;

    /** The number of combined subsets */
    this.nrCombinedSets = 0;

    /** Array of length depth where each element that is in this subset is set to 1 */
    this.setData = setData;
    /** The number of elements in this (sub)set */
    this.setSize = 0;

    for (var i = 0; i < this.combinedSets.length; i++) {
        if (this.combinedSets[i] != 0) {
            this.nrCombinedSets++;
        }
    }

    if (this.setData != null) {
        for (var i = 0; i < this.setData.length; i++) {
            if (this.setData[i] != 0)
                this.setSize++;
        }
    }

}


//d3.text("data/test/test.csv", "text/csv", dataLoad);
//d3.text("data/fruit/fruit.csv", "text/csv", dataLoad);
//d3.text("data/movies/movies_simplified.csv", "text/plain", dataLoad);

//
function dataLoad(data) {
    var dsv = d3.dsv(";", "text/plain");
    var rows = dsv.parseRows(data).map(function (row) {
        return row.map(function (value) {
            var intValue = parseInt(value, 10)
            if (isNaN(intValue))
                return value;
            return intValue;
        });
    });
    // the raw set arrays
    var rawSets = [];
    // the names of the sets are in the columns
    var setNames = rows.shift();
    // we drop the first cell - this should be empty
    setNames.shift();

    // initialize the raw set arrays
    for (var setCount = 0; setCount < setNames.length; setCount++) {
        rawSets.push(new Array());
    }

    for (var i = 0; i < rows.length; i++) {
        labels.push(rows[i][0]);
        for (var setCount = 0; setCount < setNames.length; setCount++) {
            rawSets[setCount].push(rows[i][setCount + 1]);
        }
    }

    depth = labels.length;

    var setID = 1;
    for (var i = 0; i < rawSets.length; i++) {
        var combinedSets = Array.apply(null, new Array(rawSets.length)).map(Number.prototype.valueOf, 0);
        combinedSets[i] = 1;
        var setName = setNames[i];
        var set = new Set(setID, setName, combinedSets, rawSets[i]);
        setID = setID << 1;
        sets.push(set);
    }

    combinations = Math.pow(2, sets.length) - 1;

    for (var i = 1; i <= combinations; i++) {
        makeSubSet(i)
    }

    // sort by size of set overlap
    subsets.sort(function (a, b) {
        return b.setSize - a.setSize;
    });


    plot(sets);

    plot(subsets);
}


function makeSubSet(setMask) {
    var originalSetMask = setMask;

    var combinedSets = Array.apply(null, new Array(sets.length)).map(Number.prototype.valueOf, 0);
    var bitMask = 1;

    var combinedData = Array.apply(null, new Array(depth)).map(Number.prototype.valueOf, 1);

    var isEmpty = true;
    for (var setIndex = sets.length - 1; setIndex >= 0; setIndex--) {
        var data = sets[setIndex].setData;
        if ((setMask & bitMask) == 1) {
            combinedSets[setIndex] = 1;
            for (i = 0; i < data.length; i++) {
                if (!(combinedData[i] == 1 && data[i] == 1)) {
                    combinedData[i] = 0;
                }
            }

        }
        // remove the element from the combined data if it's also in another set
        else {
            for (i = 0; i < data.length; i++) {
                if ((combinedData[i] == 1 && data[i] == 1)) {
                    combinedData[i] = 0;
                }
            }
        }
        setMask = setMask >> 1;
    }

    var subSet = new Set(originalSetMask, 'Bla', combinedSets, combinedData);
    subsets.push(subSet);
}


function plot(plottingSets) {

    var cellDistance = 20;
    var cellSize = 18;
    var textHeight = 60;
    var textSpacing = 3;

    var xStartSetSizes = cellDistance * sets.length + 5;
    var setSizeWidth = 300;

    var labelTopPadding = 15;

    var paddingTop = 30;
    var paddingSide = 20;

    var truncateAfter = 25;

    var w = 700;
    var h = combinations * cellDistance + textHeight;

// var yScale = d3.scale.ordinal().domain(d3.range(data.length))
// .rangeRoundBands([ 0, h ], 0.3);

//    var yScale = d3.scale.ordinal().rangeRoundBands([ paddingTop, h ], .1);
//    var xScale = d3.scale.linear().domain([ 0, d3.max(data, function (d) {
//        return d.academic;
//    }) ]).range([ 0, w - textWidth - paddingSide ]);

//    yScale.domain(data.map(function (d) {
//        return d.schoolname;
//    }));


//    var xAxis = d3.svg.axis().scale(xScale).orient("top");

    var grays = ["#636363", "#f0f0f0"];
    // scale for the set participation
    var setScale = d3.scale.ordinal().domain(0, 1).range(grays);
    // scale for the size of the plottingSets

    console.log("Max" + d3.max(plottingSets, function (d) {
        return d.setSize;
    }));

    d3.select("#vis").select("svg").remove();
    var svg = d3.select("#vis").append("svg").attr("width", w)
        .attr("height", h);


    // ------------ the set labels -------------------

    svg.selectAll(".setLabel")
        .data(sets)
        .enter()
        .append("text").text(
        function (d) {
            return d.setName.substring(0, truncateAfter);
        }).attr({
            class: "setLabel",
            id: function (d) {
                return d.setName.substring(0, truncateAfter);
            },
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (textHeight - textSpacing) + ')rotate(270)';

            }

        });

    var grp = svg.selectAll('.row')
        .data(plottingSets)
        .enter()
        .append('g')
        .attr({transform: function (d, i) {
            return 'translate(0, ' + (textHeight + cellDistance * (i)) + ')';
        },
            class: 'row'});

    // ------------ the combination matrix ----------------------

    grp.selectAll('.row')
        .append('g')
        .attr({class: 'combination'
        })


    grp.selectAll('.combination').data(function (d) {
        return d.combinedSets
    }).enter()
        .append('rect')
        .attr('x', function (d, i) {
            return (cellDistance) * i;
        })
        .attr({width: cellSize,
            height: cellSize})
        .style("fill", function (d) {
            if (d == 0)
                return '#f0f0f0';
            else
                return '#636363';
            //return setScale(d);
        });

    // ------------------- set size bars --------------------

//    svg.append('rect').attr({
//        height: '100',
//    width: 100
//    })


    svg.append('rect')
        .attr({
            class: 'labelBackground',
            id: 'subsetSizeLabel',
            transform: 'translate(' + xStartSetSizes + ',' + labelTopPadding + ')',
            height: '20',
            width: setSizeWidth

        });

    svg.append('text').text('Subset Size')
        .attr({
            class: 'setSizeLabel',
            transform: 'translate(' + (xStartSetSizes + setSizeWidth / 2) + ',' + (labelTopPadding + 10) + ')'
        });


    var subSetSizeScale = d3.scale.linear().domain([0, d3.max(plottingSets, function (d) {
        return d.setSize;
    })]).range([0, setSizeWidth]);

    var subSetSizeAxis = d3.svg.axis().scale(subSetSizeScale).orient("top").ticks(4);

    svg.append("g").attr()
        .attr({class: "axis",
            transform: "translate(" + xStartSetSizes + "," + (textHeight - 5) + ")"
        })
        .call(subSetSizeAxis);

    svg.selectAll('.row')
        .append('rect')
        .attr({
            class: 'setSize',
            transform: "translate(" + xStartSetSizes + ", 0)", // " + (textHeight - 5) + ")"
            width: function (d) {
//                console.log(d.setSize);
//                console.log("Scale" + subSetSizeScale(5));
                return subSetSizeScale(d.setSize);
                //return d.setSize;
//                console.log( sizeScale(d.setSize));
//                return  sizeScale(d.setSize);
            },
            height: cellSize
        });


    d3.selectAll(".setLabel").on(
        "click",
        function (d) {
//            console.log("test" + d.setName);
            plottingSets.pop();
            // sort by number of combinations
            plottingSets.sort(function (a, b) {
                return a.nrCombinedSets - b.nrCombinedSets;
            });
//            console.log(plottingSets);


//            yScale.domain(data.map(function (d) {
//                return d.schoolname;
//            }));

            var what = svg.selectAll(".row").data(plottingSets);
            what.exit().remove();
            what.transition().duration(1000)
                .attr({transform: function (d, i) {
                    console.log(d.setID);
                    return 'translate(0, ' + (textHeight + cellDistance * (i)) + ')';
                }});
        });
}

//    svg.selectAll('.setSize').data(plottingSets).enter()
//        .append('rect')
//        .attr({
//            class: 'setSize',
//            x: function (d) {
//                console.log(d);
//                return (cellDistance) * d.combinedSets.length;
//
//            },
//            y: function (d, i) {
//                return cellDistance * i;
//            },
//            width: function (d) {
//
//                return  d.setSize;
//            },
//            height: cellSize
//        });

//// background color
//    svg.append("rect").attr({
//        id: "base",
//        width: w,
//        height: h,
//        fill: "#eeeeee"
//    });
//
//    svg.append("g").attr("class", "axis").attr("transform",
//            "translate(" + textWidth + ", " + (paddingTop - 5) + ")").attr(
//            "class", "x axis").call(xAxis);
//
//    var rectangles = svg.selectAll(".bar").data(plottingSets).enter().append("rect")
//        .attr({
//            class: "bar",
//            width: function (d) {
//
//                return xScale(d.academic);
//            },
//            height: yScale.rangeBand,
//            y: function (d) {
//                return yScale(d.schoolname);
//            },
//            x: textWidth
//        });
//
//    svg.selectAll(".barLabel").data(data).enter().append("text").text(
//        function (d) {
//            return d.schoolname.substring(0, truncateAfter);
//        }).attr({
//            class: "barLabel",
//            y: function (d) {
//                return yScale(d.schoolname) + 15;
//            },
//            x: paddingSide,
//            height: yScale.rangeBand,
//            'text-anchor': 'left'
//        });
//
//    d3.select("#update-list").on(
//        "click",
//        function () {
//
//            data.sort(function (a, b) {
//                return b.academic - a.academic;
//            });
//
//            console.log(data, function (d) {
//                d.academic
//            });
//
//            yScale.domain(data.map(function (d) {
//                return d.schoolname;
//            }));
//
//            svg.selectAll(".barLabel").transition().duration(1000).attr(
//                "y", function (d) {
//                    return yScale(d.schoolname) + 15;
//                });
//
//            svg.selectAll(".bar").transition().duration(1000).attr("y",
//                function (d) {
//                    return yScale(d.schoolname);
//                });


