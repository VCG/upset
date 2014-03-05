

function mouseoverColumn(d, i) {

  d3.selectAll(".connection, .combination rect, .setSize")
    .style("opacity", .3)
  
  d3.selectAll(".connection.diagonal").filter(function(dd, ii) { return ii == i;})
    .style("opacity", 1)

  d3.selectAll(".combination").selectAll("rect").filter(function(dd, ii) { return ii == i; })
    .style("opacity", 1)      

  d3.selectAll(".connection.vertical").filter(function(dd, ii) { return ii == i;})
    .style("opacity", 1)

  d3.selectAll(".setSize").filter(function(dd, ii) { return ii == i;})
    .style("opacity", 1)

}

function mouseoutColumn(d, i) {

 	d3.selectAll(".connection, .combination rect, .setSize").style("opacity", 1)      

}

function mouseoverRow(d, i) {

}

function mouseoutRow(d, i) {

}

function mouseoverCell(d, i) {


}

function mouseoutRow(d, i) {

}