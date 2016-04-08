
function mouseoverColumn(d,i){
    var combinedSets = usedSets.map(function(dd,ii){
        return (dd.id== d.id)?1:0
    })
    mouseoverColumnImpl(combinedSets);


}

function mouseoverColumnImpl(combinedSets) {

    d3.selectAll(".connection, .combination rect, .setSize")
    //    .style("opacity", .3)
    .style("stroke", "white")

    d3.selectAll(".connection.diagonal").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
        .style("stroke", "black")


//    d3.selectAll(".combination").selectAll("rect").filter(function (dd, ii) {
//        return combinedSets[ii];
////        return dd.id== d.id;
//    })
//        .style("opacity", 1)
//        .style("stroke", ctx.backHighlightColor)

//    d3.selectAll(".setSize").filter(function (dd, ii) {
//        return combinedSets[ii];
////        return dd.id== d.id;
//    })
//        .style("opacity", 1)
//        .style("stroke", "black")

    d3.selectAll(".setSizeBackground").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
        .style("fill", ctx.backHighlightColor)

    d3.selectAll(".connection.vertical").filter(function (dd, ii) {
        return combinedSets[ii];
//        return dd.id== d.id;
    })
        .style("opacity", 1)
//        .style("stroke", "black")
        .style("fill",ctx.backHighlightColor)



    ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        opacity:function(dd,i){
            var value = combinedSets[i];
            switch (value){
                case 2:
                    return 0; break;
                default:
                    return value;

            }
        }
    })

}

function mouseoutColumn() {

    d3.selectAll(".connection, .combination rect")
        .style("opacity", 1)
        .style("stroke", "none")

    d3.selectAll((".setSizeBackground")).style({
        "stroke": "none",
        "fill":ctx.grays[0]
    })

    ctx.tableHeaderNode.selectAll(".connection")
        .style("fill", ctx.grays[0])

    ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        opacity:0,
        stroke:"none"
    })

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





//    mouseoverColumn(d.data.combinedSets)
    mouseoverColumnImpl(combinedSets)

}

function mouseoutRow() {

    // plot Venn diagram without highlighting
    venn.plot(null, usedSets.length );

    d3.selectAll(".row .backgroundRect")
        .style({"stroke":null,
            "fill-opacity":0
        })
    mouseoutColumn();
}

function mouseoverCell(rowData, columnIndex) {

    var combinedSets = rowData.data.combinedSets.map(function(d,i){
        if (i==columnIndex) return 1;
        else return d;
    })



    mouseoverRowImpl(rowData, combinedSets)

    var columnBackgrounds = ctx.columnBackgroundNode.selectAll(".columnBackground").style({
        stroke:function(dd,i){if (i==columnIndex) return 1; else return "none"}
    })

    d3.selectAll(".setSize").style({
        stroke:function(dd,i){if (i==columnIndex) return "black"; else return "white"}
    })
//        .style("opacity", 1)
//        .style("fill", ctx.backHighlightColor)
//



    d3.selectAll(".connection.vertical")
        .style("stroke",function(d,i){
            return (i==columnIndex)?"black":"none";
        })



//    columnBackgrounds.filter(function(d,i){return i==columnIndex})
//        .style({
//            opacity:1
//        })

}

function mouseoutCell() {

    mouseoutRow()

}
