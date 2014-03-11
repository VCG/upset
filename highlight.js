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

    d3.selectAll(".row .backgroundRect")
        .style("stroke",null)


    d3.selectAll(".row .backgroundRect").filter(function (dd, ii) {
        return d.id == dd.id
        })
        .style("stroke", "black")


}

function mouseoutRow(d, i) {

    d3.selectAll(".row .backgroundRect")
        .style("stroke",null)
}

function mouseoverCell(d, i) {

    mouseoverColumn(d, i);
    console.log("row:",d3.selectAll(".row").data().indexOf(d3.select(this).node().parentNode.parentNode.__data__));
    mouseoverRow(d3.select(this).node().parentNode.parentNode.__data__, 1)

}

function mouseoutCell(d, i) {

    mouseoutColumn(d, i);
    mouseoutRow(d, 1)

}