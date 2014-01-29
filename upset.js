/**
 * author: Alexander Lex - alex@seas.harvard.edu Inspired by
 */

var sets = [];
var subsets = [];
var labels = [];

function SetIntersection() {
    this.expectedValue;
}
SetIntersection.prototype.Set = function () {
    this.size *= 2;
}

function Set(setName, setID, setData) {
    this.setName = setName;
    this.setID = setID;
    this.setData = setData;
    this.setSize = 0;
    for (var i = 0; i < this.setData.length; i++) {
        if (this.setData[i] != 0)
            this.setSize++;
    }

}


//
function dataLoad(data) {

//    console.log(data);

    var rows = d3.csv.parseRows(data);
    labels = rows[0];
    for (var i = 1; i < rows.length; i++) {
        var setID = Array.apply(null, new Array(rows.length - 1)).map(Number.prototype.valueOf, 0);
        setID[i - 1] = 1;
        var setName = rows[i].shift();
        var set = new Set(setName, setID, rows[i]);
        sets.push(set);

    }
    plot();
}

d3.text("data/mutations/gbm_mutated_top5.csv", "text/csv", dataLoad);
//d3.csv.parseRows("data/mutations/gbm_mutated_top5.csv", dataLoad);

function plot() {
//    console.log(sets);


    var cellDistance = 20;
    var cellSize = 18;
    var textHeight = 60;

    var paddingTop = 30;
    var paddingSide = 20;

    var truncateAfter = 25;

    var w = 700;
    var h = 500;

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
    // scale for the size of the sets
    var sizeScale = d3.scale.linear().domain([0, d3.max(sets, function (d) {
        return d.setSize;
    })]).range(0, 200);

    var svg = d3.select("body").append("svg").attr("width", w)
        .attr("height", h);

    var grp = svg.selectAll('.row')
        .data(sets)
        .enter()
        .append('g')
        .attr({transform: function (d, i) {
            return 'translate(0, ' + (textHeight + cellDistance * i) + ')';
        },
            class: 'row'});

    grp.selectAll('.row')
        .append('g')
        .attr({class: 'combination'
        })

    grp.selectAll('.combination').data(function (d) {
        return d.setID
    }).enter()
        .append('rect')
        .attr('x', function (d, i) {
            return (cellDistance) * i;
        })
        .attr({width: cellSize,
            height: cellSize})
        .style("fill", function (d) {
            return setScale(d);
        });


    svg.selectAll('.row')
        .append('rect')
        .attr({
            class: 'setSize',
            x: function (d) {
                console.log('test');
                console.log(d);
                return (cellDistance) * d.setID.length;
            },
            width: function (d) {
                return  d.setSize;
            },
            height: cellSize
        });

//    svg.selectAll('.setSize').data(sets).enter()
//        .append('rect')
//        .attr({
//            class: 'setSize',
//            x: function (d) {
//                console.log(d);
//                return (cellDistance) * d.setID.length;
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
//    var rectangles = svg.selectAll(".bar").data(sets).enter().append("rect")
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

