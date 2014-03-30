function plotSetSelection() {
    var cellDistance = 20;
    var cellSize = 18;
    var w = 120;
    var headerHeight = 40;
    var setHeight = sets.length * cellDistance
    var h = setHeight + headerHeight;

    var truncateAfter = 25;

    d3.select('#setSelect').select('svg').remove();
    var svg = d3.select('#setSelect').append('svg').attr('width', w)
        .attr('height', h);

    svg.append('text').text('Choose Sets').attr({
        transform: 'translate(0, 20)'
    });

    var setRowScale = d3.scale.ordinal().rangeRoundBands([ headerHeight, h ], 0);
    setRowScale.domain(sets.map(function (d) {
        return d.id;
    }));

    var setGrp = svg.selectAll('.setRow')
        .data(sets)
        .enter()
        .append('g')
        .attr({transform: function (d, i) {
            return 'translate(0, ' + setRowScale(d.id) + ')';
            //  return 'translate(0, ' + ( cellDistance * (i)) + ')';
        },
            class: 'setRow'});

    setGrp.append('rect').attr({
        class: 'setSelectBackground',
        width: w,
        height: cellSize,
        fill: function (d) {
            if (d.isSelected)
                return '#d3d3d3';
            else
                return '#ffffff';
        }


//            transform: function (d, i) {
//                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
//            }

    }).on('click', setClicked);

    setGrp.append('text').text(
        function (d) {
            return d.elementName.substring(0, truncateAfter);
        }).attr({
            class: 'groupLabel',
            id: function (d) {
                return d.elementName.substring(0, truncateAfter);
            },

            y: cellSize - 3,
            x: 3,
            'font-size': cellSize - 4

//            transform: function (d, i) {
//                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
//            }

        }).on('click', setClicked);

    function setClicked(d) {
        updateSetContainment(d);        
    }
}

function plotSetOverview() {

    var majorPadding = 5;
    var minorPadding = 2;
    var cellDistance = 20;
    var cellSize = cellDistance;// - minorPadding;
    var setCellDistance = 12;
    var setCellSize = 10;
    var textHeight = 60;

    d3.selectAll(".visOverview").remove();

    var overview = d3.select('#vis').select('svg').append("g").attr({
        class: "visOverview",
        "transform": "translate(" + 0 + "," + 0 + ")"
    })


function orderChange() {
  if(!this.checked)
    return;

  var sortFn;

  if (this.value === "name") {
    sortFn = sortName;
    ctx.setOrder = "name";
  }  else {
    sortFn = sortSize;
    ctx.setOrder = "size";
  }

  d3.selectAll(".unusedSets .unusedSetSizeBackground")
    .sort(sortFn)
    .transition().duration(500).delay(function(d, i) {
      return i * 500 / unusedSets.length;
    })
    .attr("transform", function (d, i) {
       return 'translate(' + (cellDistance * (i )) + ', 20)'
    })
  d3.selectAll(".unusedSets .unusedSetSize")
    .sort(sortFn)
    .transition().duration(500).delay(function(d, i) {
      return i * 500 / unusedSets.length;
    })
    .attr("transform", function (d, i) {
        return 'translate(' + (cellDistance * i) + ', ' + ( textHeight - minorPadding - setSizeScale(d.setSize) + 20) + ')'
    })

  d3.selectAll(".unusedSets .setLabel")
    .sort(sortFn)
    .transition().duration(500).delay(function(d, i) {
      return i * 500 / unusedSets.length;
    })
    .attr("transform", function (d, i) {
        return 'translate(' + (cellDistance * (i + 1) + 5) + ', 20) rotate(90)'
    })
    
   d3.selectAll(".unusedSets .bulkCheck").remove();

    unusedSets.sort(sortFn).filter(function(d, ii) {

      d3.select(".unusedSets")
        .append("foreignObject")
        .datum([d])
        .attr("width", 100)
        .attr("height", 100)
        .attr("class", "bulkCheck")
        .attr("y", 0)
        .attr("x", function(d, i) {
          return cellDistance * (ii);
        })
        .html("<form><input type=checkbox value=setcheck id="+ii+" /></form>")

    })

}

    overview.on('mouseover', function(d, i) {

      // Remove current transitions
      d3.selectAll(".bulkCheck").transition();

        var sortFn;

        if (ctx.setOrder === "name") {
          sortFn = sortName;
        }  else {
          sortFn = sortSize;
        }

      if(d3.selectAll(".bulkCheck")[0].length>5)
        return;

        usedSets.filter(function(d, ii) {

          d3.select(".usedSets")
            .append("foreignObject")
            .datum([d])
            .attr("width", 100)
            .attr("height", 100)
            .attr("class", "bulkCheck")
            .attr("y", 40)
            .attr("x", function(d, i) {
              return cellDistance * (ii);
            })
            .html("<form><input type=checkbox value=setcheck id=setcheck_"+ii+" checked/></form>")

        })

        var unusedSetsCheck = unusedSets.sort(sortFn).filter(function(d, ii) {

          d3.select(".unusedSets")
            .append("foreignObject")
            .datum([d])
            .attr("width", 100)
            .attr("height", 100)
            .attr("class", "bulkCheck unusedSets")
            .attr("y", 0)
            .attr("x", function(d, i) {
              return cellDistance * (ii);
            })
            .html("<form><input type=checkbox value=setcheck id="+ii+" /></form>")

        })

         d3.select("#vis").select("svg")
            .append("foreignObject")
            .attr("width", 100)
            .attr("height", 100)
            .attr("class", "bulkCheck")
            .attr("y", 20)
            .attr("x", function(d, i) {
              return 0;//ctx.w- usedSets.length*cellDistance-100;
            })
            .html("<form><input type=button value=update /></form>")
            .on("click", setClickedByBulk);

         d3.select("#vis").select("svg")
            .append("foreignObject")
            .attr("width", 100)
            .attr("height", 100)
            .attr("class", "bulkCheck")
            .attr("y", 20)
            .attr("x", function(d, i) {
              return 60;//ctx.w- usedSets.length*cellDistance-100;
            })
            .html("<form><input type=button value='all' /></form>")
            .on("click", function() {
              d3.selectAll("input[value=setcheck]").property("checked", true);
            });

         d3.select("#vis").select("svg")
            .append("foreignObject")
            .attr("width", 100)
            .attr("height", 100)
            .attr("class", "bulkCheck")
            .attr("y", 20)
            .attr("x", function(d, i) {
              return 95;//ctx.w- usedSets.length*cellDistance-100;
            })
            .html("<form><input type=button value='none' /></form>")
            .on("click", function() {
              d3.selectAll("input[value=setcheck]").property("checked", false);
            });

         d3.select("#vis").select("svg")
            .append("foreignObject")
            .attr("width", 200)
            .attr("height", 100)
            .attr("class", "bulkCheck")
            .attr("y", 20)
            .attr("x", function(d, i) {
              return 145;//ctx.w- usedSets.length*cellDistance-100;
            })
            .html("<form style='font-size:12px'>Order by: <input type=radio name='order' value='size' "+ (ctx.setOrder == 'size' ? 'checked' : '') +"/> Size <input type=radio name='order' value='name' "+ (ctx.setOrder == 'name' ? 'checked' : '') +"/> Name</form>")
            .on("click", function() {
              d3.select(this).selectAll("input").each(orderChange);
            });

           d3.selectAll(".bulkCheck").on("mouseenter", function() {
            // Remove current transitions
            d3.selectAll(".bulkCheck").transition();
          })

        })
        .on('mouseout', function(d, i) {
            mouseoutColumn(d, i);
            d3.selectAll(".bulkCheck").transition().duration(1500).remove();
        })

    var formLabels = overview.append("g").attr("class", "usedSets");

    var usedSetsLabels = overview.append("g").attr("class", "usedSets").selectAll('.setLabel')
        .data(usedSets)
        .enter();

    // ------------------- set size bars --------------------

    // scale for the size of the subSets, also used for the sets
    var setSizeScale = d3.scale.linear().domain([0, d3.max(sets, function (d) {
        return d.setSize;
    })]).nice().range([0, textHeight]);

    usedSetsLabels
        .append('rect')
        .attr({
            class: 'setSizeBackground',
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i )) + ', 60)'
            }, // ' + (textHeight - 5) + ')'
            height: (textHeight+1),
            width: cellSize//setRowScale.rangeBand()
        })
        .on('click', setClicked)
        .on('mouseover', function(d, i) {
            mouseoverColumn(d, i);

        })
        .on('mouseout', function(d, i) {
            mouseoutColumn(d, i);
        })


    // background bar
    usedSetsLabels
        .append('rect')
        .attr({
            class: 'setSize',
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i )+1) + ', ' + (textHeight-(setSizeScale(d.setSize))+60) + ')'//( textHeight - minorPadding - setSizeScale(d.setSize) + 60)
            }, // ' + (textHeight - 5) + ')'
            height: function (d) {
                return setSizeScale(d.setSize);
            },
            width: cellSize-2//setRowScale.rangeBand()
        })
      //  .attr("transform", "skewX(45)")
        .on('mouseover', mouseoverColumn)
        .on('mouseout', mouseoutColumn)
        .on('click', setClicked)

    var unusedSets = sets.filter(function(n) {
        return usedSets.indexOf(n) == -1
    });

    var truncateAfter = 10;

    var xScale = d3.scale.ordinal()
        .domain(d3.range(unusedSets.length))
        .rangeRoundBands([0, unusedSets.length+cellSize], 0.05); 

    var sortSize = function (a, b) {
      return b.setSize - a.setSize;
    };

    var sortName = function (a, b) {
      return d3.ascending(a.elementName, b.elementName);
    };

    var sortFn;

    if (ctx.setOrder === "name") {
      sortFn = sortName;
    }  else {
      sortFn = sortSize;
    }


        
    var unusedSetsLabels =  overview.append("foreignObject")
        .attr("width", 710)
        .attr("height", textHeight+20)
        .attr("x", usedSets.length*cellSize)
        .attr("y", 40)
      .append("xhtml:div")
        .style("overflow-x", "auto")
        .append("svg")
        .attr({
            height: textHeight+20,
            width: unusedSets.length*cellSize
        })
        .append("g")
        //.attr("transform", "translate(-50)")
        .attr("class", "unusedSets")
        .selectAll('.unusedSetsLabels')
        .data(unusedSets)
        .enter();

    unusedSetsLabels
            .append('rect')
            .sort(sortFn)
            .attr({
                class: 'unusedSetSizeBackground',
                transform: function (d, i) {
                    return 'translate(' + (cellDistance * (i )) + ', 20)'
                },
                height: textHeight-2,
                width: cellSize
            })
            .on('click', setClicked)


    // background bar
    unusedSetsLabels
        .append('rect')
        .sort(sortFn)
        .attr({
            class: 'unusedSetSize',
            transform: function (d, i) {
                return 'translate(' + (cellDistance * i) + ', ' + ( textHeight - minorPadding - setSizeScale(d.setSize) + 21) + ')'
            }, // ' + (textHeight - 5) + ')'
            height: function (d) {
                return setSizeScale(d.setSize);
            },
            width: cellSize
        })
       // .on('mouseover', mouseoverColumn)
       // .on('mouseout', mouseoutColumn)
        .on('click', setClicked)

    unusedSetsLabels
        .append('text').text(function (d) {
          
          //var tmpText = d3.select("svg").append("text").attr("id", "tmpText").text(d.elementName.substring(0, truncateAfter))
          //var str = Utilities.truncate(tmpText, 70)
          //tmpText.remove();
          var str = d.elementName.substring(0, truncateAfter)
          if(str.length<d.elementName.length)
            str = str.trim() + "...";

            return str;
          })
        .sort(sortFn)
        .attr({
            class: 'setLabel',
         // Not sure we need this..
         //   id: function (d) {
         //       return d.elementName.substring(0, truncateAfter);
         //   },
                transform: function (d, i) {
                    return 'translate(' + (cellDistance * (i + 1) + 5) + ', 20) rotate(90)'
                },
            y: cellSize - 3,
            x: 3,
            height: textHeight-4,
            'text-anchor': 'start'

//            transform: function (d, i) {
//                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
//            }
      })
      .on('click', setClicked)
      .append("svg:title")
      .text(function(d, i) { return d.elementName + " (" +d.setSize+ ")"; });

    function setClicked(d, i) {
        updateSetContainment(d, true);        
               d3.selectAll(".bulkCheck").transition().remove();
    }

    function setClickedByBulk() {


      var nb_update = 0;
      var list_update = [];

      // Browse all the checkboxes
      d3.selectAll("input[value=setcheck]").filter(function() {
        var d = d3.select(d3.select(this)[0][0].parentNode.parentNode).datum();
        if(d3.select(this).property("checked") != d[0].isSelected)
          list_update.push(d[0])
      })


       d3.selectAll(".bulkCheck").transition().remove();

      list_update.map(function(d, i) { updateSetContainment(d, i==list_update.length-1); });

    }
}
