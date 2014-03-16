function mouseoverColumn(d, i) {

    d3.selectAll(".connection, .combination rect, .setSize")
    //    .style("opacity", .3)
    .style("stroke", "white")

    d3.selectAll(".connection.diagonal").filter(function (dd, ii) {
        return ii == i;
    })
        .style("opacity", 1)
        .style("stroke", "black")

    d3.selectAll(".combination").selectAll("rect").filter(function (dd, ii) {
        return ii == i;
    })
        .style("opacity", 1)
        .style("stroke", "black")

    d3.selectAll(".connection.vertical").filter(function (dd, ii) {
        return ii == i;
    })
        .style("opacity", 1)
        .style("stroke", "black")

    d3.selectAll(".setSize").filter(function (dd, ii) {
        return ii == i;
    })
        .style("opacity", 1)
        .style("stroke", "black")
}

function mouseoutColumn(d, i) {

    d3.selectAll(".connection, .combination rect, .setSize")
        .style("opacity", 1)
        .style("stroke", "white")

}

function mouseoverRow(d, i) {

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
        .style("stroke",
            function(dd){
                if (d.id == dd.id) return "black";
                else null;
            })
}

function mouseoutRow(d, i) {

    // plot Venn diagram without highlighting
    venn.plot();

    d3.selectAll(".row .backgroundRect")
        .style("stroke",null)
}

function mouseoverCell(d, i) {

    mouseoverColumn(d, i);
    mouseoverRow(d3.select(this).node().parentNode.parentNode.__data__, 1)

}

function mouseoutCell(d, i) {

    mouseoutColumn(d, i);
    mouseoutRow(d, 1)

}