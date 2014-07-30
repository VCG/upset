function plotSetOverview() {

    var initialize = false;
    var animate = false;

    if (arguments[0]){
        console.log(arguments[0]);
        initialize = arguments[0].initialize || false;

        if (initialize){
            ctx.setSelection.mode = "none"
        }
//        animate = arguments[0].animate || false;
//        mode = arguments[0].mode || "none";
    }

    console.log("plotSetOverview");

    var majorPadding = 5;
    var minorPadding = 2;
    var cellDistance = 20;
    var cellSize = cellDistance;// - minorPadding;
    var setCellDistance = 12;
    var setCellSize = 10;
    var textHeight = 60;
    var truncateAfter = 7;
    var distanceUsedUnused = 30;
    var paddingForPaginationRight = 115;
    var paddingForPaginationRightExtra = (ctx.setSelection.mode==="none")?0:100;
    const paginationLinespace = 14;



    d3.selectAll(".visOverview").remove();


    // --- INIT the SVG structure (d3 version)

    var headerSVG = d3.select('#headerVis').select('svg');
    var setSelectionGroup = headerSVG.selectAll(".setSelection").data([1]);
    setSelectionGroup.enter().append("g").attr({
        class: "setSelection",
        "transform": "translate(" + 0 + "," + 0 + ")"
    })

    var usedSetsVis = setSelectionGroup.selectAll(".usedSets").data([1]);
    usedSetsVis.enter().append("g").attr("class", "usedSets");



    // ----------------------------
    ///-- Render the __used Sets
    // ----------------------------

    var usedSetsLabels = usedSetsVis
        .selectAll('.setLabel')
        .data(usedSets, function(d){return d.elementName;})

    usedSetsLabels.exit().remove();

    var usedSetsLabelsEnter = usedSetsLabels.enter().append("g").attr("class","setLabel").attr({
        transform: function (d, i) {
            return 'translate(' + (cellDistance * (i )) + ', 0)'
        },
        opacity:.1

    });


    // scale for the size of the subSets, also used for the sets
    var setSizeScale = d3.scale.linear().domain([0, d3.max(sets, function (d) {
        return d.setSize;
    })]).nice().range([0, textHeight]);

    usedSetsLabelsEnter
        .append('rect')
        .attr({
            class: 'setSizeBackground',
            height: (textHeight+1),
            width: cellSize//setRowScale.rangeBand()
        })
        .on('click', setClicked)
        .on('mouseover', function(d, i) {
            mouseoverColumn(d, i);

        })
        .on('mouseout', function(d, i) {
            mouseoutColumn(d, i);
        });

    // background bar
    usedSetsLabelsEnter
        .append('rect')
        .attr({
            class: 'setSize',
            x:1,
            width: cellSize-2//setRowScale.rangeBand()
        })
      //  .attr("transform", "skewX(45)")
        .on('mouseover', mouseoverColumn)
        .on('mouseout', mouseoutColumn)
        .on('click', setClicked)


    // *** update sizes (might happen when changing datasets)
    d3.selectAll(".usedSets .setSize").transition().duration(1000).attr({
        y:function(d){return (textHeight-(setSizeScale(d.setSize)));},
        height: function (d) {
            return setSizeScale(d.setSize);
        }
    });

    usedSetsLabelsEnter.transition().duration(400).delay(400).attr({
        opacity:1
    })

    // *** update group position
    usedSetsLabels
//        .transition()
        .attr({
        transform: function (d, i) {
            return 'translate(' + (cellDistance * (i )) + ', 0)'
        }
    })



    // ----------------------------
    ///-- Render the unused Sets
    // ----------------------------


    // calculate widths
    var unusedLabelOffset = usedSets.length*cellSize + distanceUsedUnused;

    var svgWidth = headerSVG.attr("width");
    var maxWidthUnused = svgWidth - unusedLabelOffset - paddingForPaginationRight - paddingForPaginationRightExtra;



    var unusedSets = sets.filter(function(n) {
        return usedSets.indexOf(n) == -1
    });

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

    unusedSets.sort(sortFn);

    var unusedSetsGroup = setSelectionGroup.selectAll(".unusedSets").data([1])
    unusedSetsGroup.enter().append("g").attr("class","unusedSets")

    console.log(svgWidth,maxWidthUnused, cellDistance);




    if (maxWidthUnused<cellDistance){


        unusedSetsGroup.selectAll('.unusedSetLabel').remove();

    }else{

        /*
         * add only if there is enough space !!!
         * */

        var paginationDistance = Math.floor(maxWidthUnused/cellDistance);
        if (initialize){
            ctx.setSelection.paginationStart=+0;
        }
        ctx.setSelection.paginationEnd=+ctx.setSelection.paginationStart+paginationDistance;

        var unusedSetsFiltered = unusedSets.filter(
            function(d,i){
                return ((ctx.setSelection.paginationStart<=i) && (i<=ctx.setSelection.paginationEnd));
            }
        )

        console.log("uS_f:", maxWidthUnused,paginationDistance,unusedSetsFiltered);

        /*
        * create buttons for pagination
        * */
        updatePaginationDecoration();


        var unusedSetsLabels = unusedSetsGroup
            .selectAll('.unusedSetLabel')
            .data(unusedSetsFiltered, function(d){return d.elementName;})

        unusedSetsLabels.exit()
//        .transition().style({
//        opacity:0
//    }).transition().delay(500)
            .remove();

        unusedSetsLabels.attr({
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i ) + unusedLabelOffset) + ', 0)'
            }
        })


        var unusedSetsLabelsEnter = unusedSetsLabels.enter().append("g").attr("class","unusedSetLabel").attr({
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i ) + unusedLabelOffset) + ', -10)'
            },
            opacity:.1
        });
        unusedSetsLabelsEnter
            .append('rect')
            .attr({
                class: 'unusedSetSizeBackground',
//                transform: function (d, i) {
//                    return 'translate(' + (cellDistance * (i )) + ', 20)'
//                },
                height: textHeight-2,
                width: cellSize
            })
            .on('click', setClicked)

        unusedSetsLabelsEnter
            .append('rect')
            .attr({
                class: 'unusedSetSize',
                transform: function (d, i) {
                    return 'translate(1, ' + ( textHeight - setSizeScale(d.setSize)) + ')'
                }, // ' + (textHeight - 5) + ')'
                height: function (d) {
                    return setSizeScale(d.setSize);
                },
                width: cellSize-2
            })
            .on('click', setClicked)
//        .append("svg:title")
//        .text(function(d, i) { return d.elementName + " (" +d.setSize+ ")"; });;


        unusedSetsLabelsEnter
            .append('text').text(function (d) {
                if (d.elementName.length > (truncateAfter+3)){
                    var str = d.elementName.substring(0, truncateAfter)
                    if(str.length<d.elementName.length)
                        str = str.trim() + "...";
                }else{
                    str= d.elementName.trim();
                }

                return str;
            })
//        .sort(sortFn)
            .attr({
                class: 'setLabel',
                transform: function (d, i) {
                    return 'translate(' + (cellDistance + 5) + ', 0) rotate(90)'
                },
                y: cellSize - 3,
                x: 3,
                height: textHeight-4,
                'text-anchor': 'start'

            })
            .on('click', setClicked)
            .append("svg:title")
            .text(function(d, i) { return d.elementName + " (" +d.setSize+ ")"; });


        console.log("animate:", animate);
        var updateUnusedPos =unusedSetsLabelsEnter;
        if (animate){
            updateUnusedPos= unusedSetsLabelsEnter
                .transition().duration(400).delay(400)
        }
        updateUnusedPos.attr({
            opacity:1,
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i ) + unusedLabelOffset) + ', 0)'
            }
        })



    }





    function updatePaginationDecoration() {
        var setsRight = unusedSets.length - ctx.setSelection.paginationEnd;
        var setsLeft = ctx.setSelection.paginationStart;


        var pagi = headerSVG.selectAll(".pagination")
            .data([{countRight: setsRight, countLeft: setsLeft, distance: paginationDistance}])
        var pagiGroup = pagi.enter().append("g").attr({
            "class":"pagination"
        })
        pagi.attr({
            "transform":"translate("+(svgWidth-paddingForPaginationRight)+",0)"
        })

        pagiGroup.append("text").attr({
            "class": "right setLabel"
        }).style({
            "text-anchor": "end",
            "cursor": "e-resize"
        }).attr({
            "transform": function () {
                return "translate(" + (paddingForPaginationRight - 2) + "," + (1*paginationLinespace) + ")";
            }
        })

        pagiGroup.append("text").attr({
            "class": "left setLabel"
        }).style({
            "text-anchor": "start",
            "cursor": "w-resize"
        }).attr({
            "transform": function () {
                return "translate(" + (cellDistance+2) + "," + (1 * paginationLinespace) + ")";
            }
        })

//        pagiGroup.append("text").attr({
//            "class": "info setLabel"
//        }).style({
//            "text-anchor": "start",
//            "cursor": "none"
//        }).attr({
//            "transform": function () {
//                return "translate(" + (cellDistance + 5) + "," + (1 * paginationLinespace) + ")";
//            }
//        })

        pagiGroup.append("text").attr({
            "class": "info_distance setLabel"
        }).style({
            "text-anchor": "middle",
            "cursor": "none"
        }).attr({
            "transform": function (d) {
                return "translate(" + ((paddingForPaginationRight-cellDistance) / 2 + cellDistance) + ","
                    + (1 * paginationLinespace) + ")";
            }
        })

//        pagiGroup.append("text").attr({
//            "class": "multiSelect setLabel"
//        }).style({
//            "text-anchor": "start",
//            "cursor": "pointer"
//        }).attr({
//            "transform": "translate(" + (cellDistance + 5) + "," + (2.4*paginationLinespace) + ")"
//        }).text("multi select")
//            .on({
//            "click": function () {
//                if (ctx.setSelection.mode=="none"){
//                    ctx.setSelection.mode = "multiSel";
//                    plotSetOverview();
//                }else if (ctx.setSelection.mode === "multiSel"){
//                    ctx.setSelection.mode = "none";
//                    plotSetOverview();
//                }
//            }
//        })
//
//        pagiGroup.append("text").attr({
//            "class": "sortFilter setLabel"
//        }).style({
//            "text-anchor": "start",
//            "cursor": "pointer"
//        }).attr({
//            "transform": "translate(" + (cellDistance + 5) + "," + (4.0*paginationLinespace) + ")"
//        }).text("sort & filter")
//
//        // --- UPDATES
//
        pagi.select(".right").text(function (d) {
            if (d.countRight < 1) return '-|'
            else return '>>';
        }).on({
            "click": function (d) {
                if (d.countRight > 0) {
                    ctx.setSelection.paginationStart = ctx.setSelection.paginationStart + d.distance;
                    plotSetOverview({animate: false});
                } else {
                    return;
                }
            }
        })


        pagi.select(".left")
             .text(function (d) {
                if (d.countLeft < 1) return '|-'
                else return '<<'; })
            .on({
                "click": function (d) {
                    if (d.countLeft > 0) {
                        ctx.setSelection.paginationStart = Math.max(ctx.setSelection.paginationStart - d.distance, 0);
                        plotSetOverview({animate: false});
                    } else {
                        return;
                    }
                }
            })


        pagi.select(".info_distance").text(function (d) {
            return ctx.setSelection.paginationStart+ " - " +
                Math.min(ctx.setSelection.paginationEnd,unusedSets.length)
        })

//        pagi.select(".multiSelect").style({
//            "font-weight": function () {
//                if (ctx.setSelection.mode === "multiSel"){
//                    return "bold"
//                }else{
//                    return "normal"
//                }
//            }
//        })


    }


//    // -- update position !!!

//    var unusedSetsLabels =  overview.append("foreignObject")
//        .attr("width", 710)
//        .attr("height", textHeight+20)
//        .attr("x", usedSets.length*cellSize)
//        .attr("y", 40)
//      .append("xhtml:div")
//        .style("overflow-x", "auto")
//        .append("svg")
//        .attr({
//            height: textHeight+20,
//            width: unusedSets.length*cellSize
//        })
//        .append("g")
//        //.attr("transform", "translate(-50)")
//        .attr("class", "unusedSets")
//        .selectAll('.unusedSetsLabels')
//        .data(unusedSets)
//        .enter();
//
//    unusedSetsLabels
//            .append('rect')
//            .sort(sortFn)
//            .attr({
//                class: 'unusedSetSizeBackground',
//                transform: function (d, i) {
//                    return 'translate(' + (cellDistance * (i )) + ', 20)'
//                },
//                height: textHeight-2,
//                width: cellSize
//            })
//            .on('click', setClicked)
//
//
//    // background bar
//    unusedSetsLabels
//        .append('rect')
//        .sort(sortFn)
//        .attr({
//            class: 'unusedSetSize',
//            transform: function (d, i) {
//                return 'translate(' + (cellDistance * i) + ', ' + ( textHeight - minorPadding - setSizeScale(d.setSize) + 21) + ')'
//            }, // ' + (textHeight - 5) + ')'
//            height: function (d) {
//                return setSizeScale(d.setSize);
//            },
//            width: cellSize
//        })
//       // .on('mouseover', mouseoverColumn)
//       // .on('mouseout', mouseoutColumn)
//        .on('click', setClicked)
//
//    unusedSetsLabels
//        .append('text').text(function (d) {
//
//          //var tmpText = d3.select("svg").append("text").attr("id", "tmpText").text(d.elementName.substring(0, truncateAfter))
//          //var str = Utilities.truncate(tmpText, 70)
//          //tmpText.remove();
//          var str = d.elementName.substring(0, truncateAfter)
//          if(str.length<d.elementName.length)
//            str = str.trim() + "...";
//
//            return str;
//          })
//        .sort(sortFn)
//        .attr({
//            class: 'setLabel',
//         // Not sure we need this..
//         //   id: function (d) {
//         //       return d.elementName.substring(0, truncateAfter);
//         //   },
//                transform: function (d, i) {
//                    return 'translate(' + (cellDistance * (i + 1) + 5) + ', 20) rotate(90)'
//                },
//            y: cellSize - 3,
//            x: 3,
//            height: textHeight-4,
//            'text-anchor': 'start'
//
////            transform: function (d, i) {
////                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
////            }
//      })
//      .on('click', setClicked)
//      .append("svg:title")
//      .text(function(d, i) { return d.elementName + " (" +d.setSize+ ")"; });

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

//    overview.on('mouseover', function(d, i) {
//
//      // Remove current transitions
//      d3.selectAll(".bulkCheck").transition();
//
//        var sortFn;
//
//        if (ctx.setOrder === "name") {
//          sortFn = sortName;
//        }  else {
//          sortFn = sortSize;
//        }
//
//      if(d3.selectAll(".bulkCheck")[0].length>5)
//        return;
//
//        usedSets.filter(function(d, ii) {
//
//          d3.select(".usedSets")
//            .append("foreignObject")
//            .datum([d])
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 40)
//            .attr("x", function(d, i) {
//              return cellDistance * (ii);
//            })
//            .html("<form><input type=checkbox value=setcheck id=setcheck_"+ii+" checked/></form>")
//
//        })
//
//        var unusedSetsCheck = unusedSets.sort(sortFn).filter(function(d, ii) {
//
//          d3.select(".unusedSets")
//            .append("foreignObject")
//            .datum([d])
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck unusedSets")
//            .attr("y", 0)
//            .attr("x", function(d, i) {
//              return cellDistance * (ii);
//            })
//            .html("<form><input type=checkbox value=setcheck id="+ii+" /></form>")
//
//        })
//
//         d3.select("#headerVis").select("svg")
//            .append("foreignObject")
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 20)
//            .attr("x", function(d, i) {
//              return 0;//ctx.w- usedSets.length*cellDistance-100;
//            })
//            .html("<form><input type=button value=update /></form>")
//            .on("click", setClickedByBulk);
//
//         d3.select("#headerVis").select("svg")
//            .append("foreignObject")
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 20)
//            .attr("x", function(d, i) {
//              return 60;//ctx.w- usedSets.length*cellDistance-100;
//            })
//            .html("<form><input type=button value='all' /></form>")
//            .on("click", function() {
//              d3.selectAll("input[value=setcheck]").property("checked", true);
//            });
//
//         d3.select("#headerVis").select("svg")
//            .append("foreignObject")
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 20)
//            .attr("x", function(d, i) {
//              return 95;//ctx.w- usedSets.length*cellDistance-100;
//            })
//            .html("<form><input type=button value='none' /></form>")
//            .on("click", function() {
//              d3.selectAll("input[value=setcheck]").property("checked", false);
//            });
//
//         d3.select("#headerVis").select("svg")
//            .append("foreignObject")
//            .attr("width", 200)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 20)
//            .attr("x", function(d, i) {
//              return 145;//ctx.w- usedSets.length*cellDistance-100;
//            })
//            .html("<form style='font-size:12px'>Order by: <input type=radio name='order' value='size' "+ (ctx.setOrder == 'size' ? 'checked' : '') +"/> Size <input type=radio name='order' value='name' "+ (ctx.setOrder == 'name' ? 'checked' : '') +"/> Name</form>")
//            .on("click", function() {
//              d3.select(this).selectAll("input").each(orderChange);
//            });
//
//           d3.selectAll(".bulkCheck").on("mouseenter", function() {
//            // Remove current transitions
//            d3.selectAll(".bulkCheck").transition();
//          })
//
//        })
//        .on('mouseout', function(d, i) {
//            mouseoutColumn(d, i);
//            d3.selectAll(".bulkCheck").transition().duration(1500).remove();
//        })




//function orderChange() {
//    if(!this.checked)
//        return;
//
//    var sortFn;
//
//    if (this.value === "name") {
//        sortFn = sortName;
//        ctx.setOrder = "name";
//    }  else {
//        sortFn = sortSize;
//        ctx.setOrder = "size";
//    }
//
//    d3.selectAll(".unusedSets .unusedSetSizeBackground")
//        .sort(sortFn)
//        .transition().duration(500).delay(function(d, i) {
//            return i * 500 / unusedSets.length;
//        })
//        .attr("transform", function (d, i) {
//            return 'translate(' + (cellDistance * (i )) + ', 20)'
//        })
//    d3.selectAll(".unusedSets .unusedSetSize")
//        .sort(sortFn)
//        .transition().duration(500).delay(function(d, i) {
//            return i * 500 / unusedSets.length;
//        })
//        .attr("transform", function (d, i) {
//            return 'translate(' + (cellDistance * i) + ', ' + ( textHeight - minorPadding - setSizeScale(d.setSize) + 20) + ')'
//        })
//
//    d3.selectAll(".unusedSets .setLabel")
//        .sort(sortFn)
//        .transition().duration(500).delay(function(d, i) {
//            return i * 500 / unusedSets.length;
//        })
//        .attr("transform", function (d, i) {
//            return 'translate(' + (cellDistance * (i + 1) + 5) + ', 20) rotate(90)'
//        })
//
//    d3.selectAll(".unusedSets .bulkCheck").remove();
//
//    unusedSets.sort(sortFn).filter(function(d, ii) {
//
//        d3.select(".unusedSets")
//            .append("foreignObject")
//            .datum([d])
//            .attr("width", 100)
//            .attr("height", 100)
//            .attr("class", "bulkCheck")
//            .attr("y", 0)
//            .attr("x", function(d, i) {
//                return cellDistance * (ii);
//            })
//            .html("<form><input type=checkbox value=setcheck id="+ii+" /></form>")
//
//    })
//
//}