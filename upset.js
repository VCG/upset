/**
 * author: Alexander Lex - alex@seas.harvard.edu Inspired by
 */

var sets = [];
var subsets = [];
var labels = [];
var combinations = 0;
var depth = 0;

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
//    console.log(this.setSize);
}


//
function dataLoad(data) {

//    console.log(data);

    var rows = d3.csv.parseRows(data);
    labels = rows[0];
    depth = labels.length - 1;
//    console.log("depth " + depth);
    var setID = 1;
    for (var i = 1; i < rows.length; i++) {
        var combinedSets = Array.apply(null, new Array(rows.length - 1)).map(Number.prototype.valueOf, 0);
        combinedSets[i - 1] = 1;
        var setName = rows[i].shift();
        var set = new Set(setID, setName, combinedSets, rows[i]);
        setID = setID << 1;
        sets.push(set);
    }

    combinations = Math.pow(2, sets.length) - 1;
//    console.log(combinations);

    for (var i = 1; i <= combinations; i++) {
        makeSubSet(i)
    }

    // sort by size of set overlap
    subsets.sort(function (a, b) {
        return b.setSize - a.setSize;
    });

    // sort by number of combinations
    //    subsets.sort(function (a, b) {
//        return a.nrCombinedSets - b.nrCombinedSets;
//    });
    plot(sets);

    plot(subsets);
}

function calcSubSets(startIndex) {
    for (var i = startIndex + 1; i < sets.length; i++) {
        var setIndices = [];
        setIndices.push([startIndex, i]);
        makeSubSet(sets)
    }
}

function makeSubSet(setMask) {
    var originalSetMask = setMask;

    var combinedSets = Array.apply(null, new Array(sets.length)).map(Number.prototype.valueOf, 0);
    var bitMask = 1;

    var combinedData = Array.apply(null, new Array(depth)).map(Number.prototype.valueOf, 1);
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
//    console.log(originalSetMask.toString(2));
//    console.log(combinedSets);
//    console.log(subSet.setSize);
//    console.log(combinedData);
}

d3.text("data/mutations/gbm_mutated_top5.csv", "text/csv", dataLoad);
//d3.text("data/test/test.csv", "text/csv", dataLoad);

function plot(plottingSets) {
//    console.log(plottingSets);


    var cellDistance = 20;
    var cellSize = 18;
    var textHeight = 60;
    var textSpacing = 3;

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
    var sizeScale = d3.scale.linear().domain([0, depth]).range(0, 400);

    var svg = d3.select("body").append("svg").attr("width", w)
        .attr("height", h);

    svg.selectAll(".setLabel")
        .data(sets)
        .enter()
        .append("text").text(
        function (d) {
            return d.setName.substring(0, truncateAfter);
        }).attr({
            class: "setLabel",
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


    svg.selectAll('.row')
        .append('rect')
        .attr({
            class: 'setSize',
            x: function (d) {
                return (cellDistance) * d.combinedSets.length;
            },
            width: function (d) {
                return d.setSize;
//                console.log( sizeScale(d.setSize));
//                return  sizeScale(d.setSize);
            },
            height: cellSize
        });

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


}

