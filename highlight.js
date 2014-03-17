function mouseoverColumn(combinedSets) {

//    console.log(d,i);

    d3.selectAll(".connection, .combination rect, .setSize")
    //    .style("opacity", .3)
    .style("stroke", "none")

    d3.selectAll(".connection.diagonal").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
        .style("stroke", "black")

    d3.selectAll(".combination").selectAll("rect").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
        .style("stroke", "black")

    d3.selectAll(".connection.vertical").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
        .style("stroke", "black")

    d3.selectAll(".setSize").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
        .style("stroke", "black")
}

function mouseoutColumn() {

    d3.selectAll(".connection, .combination rect, .setSize")
        .style("opacity", 1)
        .style("stroke", "none")

}

function mouseoverRow(d,i){
    mouseoverRowImpl(d, d.data.combinedSets);
}

function mouseoverRowImpl(d, combinedSets) {


    // plot Venn diagram with highlighting of selected subset
    if ( d.data.type === 'SUBSET_TYPE') {
        if ( usedSets.length === 2 || usedSets.length === 3 ) {
            venn.plot( [ d.data ], usedSets.length );
        }
    }

    if ( d.data.type === 'GROUP_TYPE') {
        if ( usedSets.length === 2 || usedSets.length === 3 ) {
            venn.plot( d.data.subSets, usedSets.length );
        }
    }

    d3.selectAll(".row .backgroundRect")
        .style({
        "stroke":function(dd){
                    if (d.id == dd.id) return "black";
                    else null;
                 },
        "fill-opacity":function(dd){
                   if (d.id == dd.id) return .7;
                    else return 0.001;
                }

        })



    // highlight all columns

    ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        opacity:function(dd,i){return combinedSets[i]}
    })


//    mouseoverColumn(d.data.combinedSets)
    mouseoverColumn(combinedSets)

}

function mouseoutRow() {

    // plot Venn diagram without highlighting
    venn.plot();

    d3.selectAll(".row .backgroundRect")
        .style({"stroke":null,
            "fill-opacity":0
        })

    ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        opacity:0,
        stroke:"none"
    })
    mouseoutColumn();
}

function mouseoverCell(rowData, columnIndex) {
    console.log("this:",d3.select(this).node());
//    console.log("cell:",d, d3.select(this).node().parentNode.parentNode.__data__.data);
//    mouseoverColumn(d, i);

    var combinedSets = rowData.data.combinedSets.map(function(d,i){
        if (i==columnIndex) return 1;
        else return d;
    })


    mouseoverRowImpl(rowData, combinedSets)

    var columnBackgrounds = ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        stroke:function(dd,i){if (i==columnIndex) return 1; else return "none"}
    })
//    columnBackgrounds.filter(function(d,i){return i==columnIndex})
//        .style({
//            opacity:1
//        })

}

function mouseoutCell() {

    mouseoutRow()

}