/**
 * Created by romain & hen (hendrik.strobelt.com)
 */

function plotSetOverview() {

    var initialize = false;
    var animate = false;


    if (arguments[0]) {
        console.log(arguments[0]);
        initialize = arguments[0].initialize || false;

        if (initialize) {
            ctx.setSelection.mode = "none"
            ctx.setSelection.modeChange = false;
            ctx.setSelection.multiSelIn = d3.set();
            ctx.setSelection.multiSelOut = d3.set();
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

    var differenceForMultiSel = 7;
    var textHeight = 62 - differenceForMultiSel;
    var truncateAfter = 7;
    var distanceUsedMenu = 15;
    var paddingForPaginationRight = 115;
    var paddingForPaginationRightExtra = (ctx.setSelection.mode === "none") ? 0 : 100;
    const paginationLinespace = 14;

    var headerSVG = d3.select('#headerVis').select('svg');

    // calculate widths
    var svgWidth = headerSVG.attr("width");
    var menuOffset = usedSets.length * cellSize + distanceUsedMenu;
    var maxWidthUnused = svgWidth - menuOffset - paddingForPaginationRight - paddingForPaginationRightExtra - distanceUsedMenu - cellDistance;

    var unusedSets = sets.filter(function (n) {
        return usedSets.indexOf(n) == -1
    });


    // --- INIT the SVG structure (d3 version)


    var setSelectionGroup = headerSVG.selectAll(".setSelection").data([1]);
    setSelectionGroup.enter().append("g").attr({
        class: "setSelection",
        "transform": "translate(" + 0 + "," + 0 + ")"
    })


    // scale for the size of the subSets, also used for the sets
    var setSizeScale = d3.scale.linear().domain([0, d3.max(sets, function (d) {
        return d.setSize;
    })]).nice().range([0, textHeight]);


    function updateUsedSets() {
        // ----------------------------
        ///-- Render the used Sets
        // ----------------------------
        var usedSetsVis = setSelectionGroup.selectAll(".usedSets").data([1]);
        usedSetsVis.enter().append("g").attr("class", "usedSets");

        usedSetsVis.attr({
            "transform": "translate(" + 0 + "," + differenceForMultiSel + ")"
        })

        var usedSetsLabels = usedSetsVis
            .selectAll('.setLabel')
            .data(usedSets, function (d) {
                return d.elementName;
            })
        usedSetsLabels.exit().remove();
        var usedSetsLabelsEnter = usedSetsLabels.enter().append("g").attr("class", "setLabel").attr({
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i)) + ', 0)'
            },
            opacity: .1

        });
        usedSetsLabelsEnter
            .append('rect')
            .attr({
                class: 'setSizeBackground',
                height: (textHeight + 1),
                width: cellSize,//setRowScale.rangeBand()
                title: function (d) {
                    return d.setSize
                }
            })
            .on('click', setClicked)
            .on('mouseover', function (d, i) {
                mouseoverColumn(d, i);
            })
            .on('mouseout', function (d, i) {
                mouseoutColumn(d, i);
            })
            .append("svg:title")
                .text(function (d) {
                    return d.elementName + " (" + d.setSize + ")";
                });
        // background bar
        usedSetsLabelsEnter
            .append('rect')
            .attr({
                class: 'setSizeRect setSize',
                x: 1,
                width: cellSize - 2//setRowScale.rangeBand()
            })
            //  .attr("transform", "skewX(45)")
            .on('mouseover', mouseoverColumn)
            .on('mouseout', mouseoutColumn)
            .on('click', setClicked)
            .append("svg:title")
                .text(function (d) {
                    return d.elementName + " (" + d.setSize + ")";
                });
        // *** update sizes (might happen when changing datasets)
        d3.selectAll(".usedSets .setSize").transition().duration(1000).attr({
            y: function (d) {
                return (textHeight - (setSizeScale(d.setSize)));
            },
            height: function (d) {
                return setSizeScale(d.setSize);
            }
        });
        usedSetsLabelsEnter.transition().duration(400).delay(400).attr({
            opacity: 1
        })
        // *** update group position
//        usedSetsLabels
//            .attr({
//                transform: function (d, i) {
//                        return 'translate(' + (cellDistance * i) + ', 0)'
//                }
//            })

        usedSetsLabels.attr({
            transform: function (d, i) {
                if (ctx.setSelection.mode === "multiSel") {
                    if (ctx.setSelection.multiSelOut.has(d.elementName)) {
                        return 'translate(' + (cellDistance * i) + ', -' + differenceForMultiSel + ')'
                    } else {
                        return 'translate(' + (cellDistance * i) + ', 0)'
                    }

                } else {
                    return 'translate(' + (cellDistance * i) + ', 0)'
                }

            }
        })

        usedSetsLabels.selectAll(".setSizeRect")
            .attr({
                "class": function (d) {
                    if (ctx.setSelection.multiSelOut.has(d.elementName)) {
                        return 'setSizeRect unusedSetSize'
                    } else {
                        return 'setSizeRect setSize'
                    }


                }


            })


    }

    updateUsedSets();


    function updateUnusedSets() {
        // ----------------------------
        ///-- Render the unused Sets
        // ----------------------------
        var sortSize = function (a, b) {
            return b.setSize - a.setSize;
        };

        var sortName = function (a, b) {
            return d3.ascending(a.elementName, b.elementName);
        };

        var sortFn;

        if (ctx.setSelection.setOrder === "name") {
            sortFn = sortName;
        } else {
            sortFn = sortSize;
        }

        var unuseedSetsOffset = menuOffset + paddingForPaginationRight + paddingForPaginationRightExtra + distanceUsedMenu;


        unusedSets.sort(sortFn);

        var unusedSetsGroup = setSelectionGroup.selectAll(".unusedSets").data([1])
        unusedSetsGroup.enter().append("g").attr("class", "unusedSets")

        unusedSetsGroup.attr({
            "transform": function (d) {
                if (ctx.setSelection.mode === "multiSel") {
                    return 'translate(' + unuseedSetsOffset + ', 0)'
                } else {
                    return 'translate(' + unuseedSetsOffset + ', ' + differenceForMultiSel + ')'
                }
            }
        })


        if (maxWidthUnused < cellDistance) {


            unusedSetsGroup.selectAll('.unusedSetLabel').remove();

        } else {

            /*
             * add only if there is enough space !!!
             * */

            console.log(maxWidthUnused, cellDistance);
            var paginationDistance = Math.floor(maxWidthUnused / cellDistance);

            console.log(maxWidthUnused, cellDistance, paginationDistance);
            if (initialize) {
                ctx.setSelection.paginationStart = +0;
            }
            ctx.setSelection.paginationEnd = +ctx.setSelection.paginationStart + paginationDistance;

            var unusedSetsFiltered = unusedSets.filter(
                function (d, i) {
                    return ((ctx.setSelection.paginationStart <= i) && (i <= ctx.setSelection.paginationEnd));
                }
            )


            /*
             * create buttons for pagination
             * */
            updatePaginationDecoration();


            var unusedSetsLabels = unusedSetsGroup
                .selectAll('.unusedSetLabel')
                .data(unusedSetsFiltered, function (d) {
                    return d.elementName;
                })

            unusedSetsLabels.exit().remove();


            var unusedSetsLabelsEnter = unusedSetsLabels.enter().append("g").attr("class", "unusedSetLabel").attr({
                transform: function (d, i) {
                    return 'translate(' + (cellDistance * (i)) + ', -10)'
                },
                opacity: .1
            });
            unusedSetsLabelsEnter
                .append('rect')
                .attr({
                    class: 'unusedSetSizeBackground',
//                transform: function (d, i) {
//                    return 'translate(' + (cellDistance * (i )) + ', 20)'
//                },
                    height: textHeight - 2,
                    width: cellSize
                })
                .on('click', setClicked)

            unusedSetsLabelsEnter
                .append('rect')
                .attr({
                    class: 'setSizeRect unusedSetSize',
                    transform: function (d, i) {
                        return 'translate(1, ' + (textHeight - setSizeScale(d.setSize)) + ')'
                    }, // ' + (textHeight - 5) + ')'
                    height: function (d) {
                        return setSizeScale(d.setSize);
                    },
                    width: cellSize - 2,
                })
                .on('click', setClicked)
               // .append('title').text(function (d) {return d});
              //     .append('title').text("what");
//        .append("svg:title")
//        .text(function(d, i) { return d.elementName + " (" +d.setSize+ ")"; });;


            unusedSetsLabelsEnter
                .append('text').text(function (d) {
                if (d.elementName.length > (truncateAfter + 3)) {
                    var str = d.elementName.substring(0, truncateAfter)
                    if (str.length < d.elementName.length)
                        str = str.trim() + "...";
                } else {
                    str = d.elementName.trim();
                }

                return str;
            })
                .attr({
                    class: 'setLabel',
                    transform: function (d, i) {
                        return 'translate(' + (cellDistance + 5) + ', 0) rotate(90)'
                    },
                    y: cellSize - 3,
                    x: 3,
                    height: textHeight - 4,
                    'text-anchor': 'start'

                })
                .on('click', setClicked)
                .append("svg:title")
                .text(function (d, i) {
                    return d.elementName + " (" + d.setSize + ")";
                });


//            console.log("animate:", animate);
//            var updateUnusedPos =unusedSetsLabelsEnter;
//            if (animate){
//                updateUnusedPos= unusedSetsLabelsEnter
//                    .transition().duration(400).delay(400)
//            }
//            updateUnusedPos.attr({
//                opacity:1,
//                transform: function (d, i) {
//                    return 'translate(' + (cellDistance * (i ) + unusedLabelOffset) + ', 0)'
//                }
//            })

            unusedSetsLabels.attr({
                transform: function (d, i) {
                    if (ctx.setSelection.mode === "multiSel") {
                        if (ctx.setSelection.multiSelIn.has(d.elementName)) {
                            return 'translate(' + (cellDistance * (i)) + ', ' + differenceForMultiSel + ')'
                        } else {
                            return 'translate(' + (cellDistance * (i)) + ', 0)'
                        }

                    } else {
                        return 'translate(' + (cellDistance * (i)) + ', 0)'
                    }

                },
                opacity: 1
            })


            unusedSetsLabels.selectAll(".setSizeRect")
                .attr({
                    "class": function (d) {
                        if (ctx.setSelection.multiSelIn.has(d.elementName)) {
                            return 'setSizeRect setSize'
                        } else {
                            return 'setSizeRect unusedSetSize'
                        }
                    }
                })
        }
    }

    updateUnusedSets();


    function updatePaginationDecoration() {
        var internalLeftPadding = 0 // only local
        var setsRight = unusedSets.length - ctx.setSelection.paginationEnd;
        var setsLeft = ctx.setSelection.paginationStart;

        var middlePos = ((paddingForPaginationRight - internalLeftPadding) / 2 + internalLeftPadding);
        var paginationDistance = Math.floor(maxWidthUnused / cellDistance);

        var pagi = headerSVG.selectAll(".pagination")
            .data([{countRight: setsRight, countLeft: setsLeft, distance: paginationDistance}])
        var pagiGroup = pagi.enter().append("g").attr({
            "class": "pagination"
        })

//        var finalPos = svgWidth-paddingForPaginationRight;
        var finalPos = menuOffset;
//        console.log("finalpos", finalPos);
        if (ctx.setSelection.mode !== "none") {
            finalPos += paddingForPaginationRightExtra;
        }

        if (ctx.setSelection.modeChange) {
            pagi.transition().attr({
                "transform": "translate(" + (finalPos) + ",0)"
            })

        } else {
            pagi.attr({
                "transform": "translate(" + (finalPos) + ",0)"
            })
        }


        pagiGroup.append("text")
            .style({
                "text-anchor": "middle",
                "cursor": "default",
                "font-weight": "bold"
            }).attr({
            "transform": function () {

                return "translate(" + (middlePos) + "," + (.8 * paginationLinespace) + ")";
            }
        }).text("Set Selection")


        pagiGroup.append("rect")
            .attr({
                "class": "selectionRect setSelectionArea",
                x: -5,
                width: paddingForPaginationRight - internalLeftPadding + 5,
                height: paginationLinespace * .9,
                opacity: 0
            })


        pagiGroup.append("text").attr({
            "class": "right setSelectionLabelAwesome"
        }).style({
            "text-anchor": "end"
        }).attr({
            "transform": function () {
                return "translate(" + (paddingForPaginationRight - 2) + "," + (2 * paginationLinespace) + ")";
            }
        })

        pagiGroup.append("text").attr({
            "class": "left setSelectionLabelAwesome"
        }).style({
            "text-anchor": "start"
        }).attr({
            "transform": function () {
                return "translate(" + (internalLeftPadding + 2) + "," + (2 * paginationLinespace) + ")";
            }
        })


        pagiGroup.append("text").attr({
            "class": "info_distance"
        }).style({
            "text-anchor": "middle",
            "cursor": "default"
        }).attr({
            "transform": function (d) {
                return "translate(" + (middlePos) + ","
                    + (2 * paginationLinespace) + ")";
            }
        })

        pagiGroup.append("rect").attr({
            "class": "multiSelect setSelectionButton"
        }).attr({
            "transform": "translate(" + (internalLeftPadding + 2) + "," + (2.3 * paginationLinespace) + ")",
            width: paddingForPaginationRight - internalLeftPadding - 4,
            height: .9 * paginationLinespace,
            rx: 5,
            ry: 5
        })
            .on({
                "click": function () {
                    if (ctx.setSelection.mode == "none") {
                        ctx.setSelection.mode = "multiSel";
                        ctx.setSelection.modeChange = true;
                        plotSetOverview();
                    } else if (ctx.setSelection.mode === "multiSel") {
                        ctx.setSelection.multiSelIn = d3.set();
                        ctx.setSelection.multiSelOut = d3.set();
                        ctx.setSelection.mode = "none";
                        ctx.setSelection.modeChange = true;
                        plotSetOverview();
                    }
                }
            })

        pagiGroup.append("text").attr({
            "class": "multiSelect setSelectionButtonText"
        }).style({
            "text-anchor": "middle",
            "cursor": "pointer",
            "pointer-events": "none"
        }).attr({
            "transform": "translate(" + (middlePos) + "," + (3.0 * paginationLinespace) + ")"
        }).text("Batch Add Sets")


        pagiGroup.append("rect").attr({
            "class": "sortFilter setSelectionButton"
        }).attr({
            "transform": "translate(" + (internalLeftPadding + 2) + "," + (3.3 * paginationLinespace) + ")",
            width: paddingForPaginationRight - internalLeftPadding - 4,
            height: .9 * paginationLinespace,
            rx: 5,
            ry: 5
        })
            .on({
                "click": function () {
                    if (ctx.setSelection.mode == "none") {
                        ctx.setSelection.mode = "sortFilter";
                        ctx.setSelection.modeChange = true;
                        plotSetOverview();
                    } else if (ctx.setSelection.mode === "sortFilter") {
                        ctx.setSelection.mode = "none";
                        ctx.setSelection.modeChange = true;
                        plotSetOverview();
                    }
                }
            })


        pagiGroup.append("text").attr({
            "class": "sortFilter setSelectionButtonText"
        }).style({
            "text-anchor": "middle",
            "cursor": "pointer",
            "pointer-events": "none"
        }).attr({
            "transform": "translate(" + (middlePos) + "," + (4 * paginationLinespace) + ")"
        }).text("Sort Sets")


        // --- UPDATES

        pagi.select(".right").text(function (d) {
//            if (d.countRight < 1) return '-|'
//            else return '>>';
            if (d.countRight < 1) return ''
            else return '\uf0a9';
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
//                if (d.countLeft < 1) return '|-'
//                else return '<<'; })
                if (d.countLeft < 1) return ''
                else return '\uf0a8';
            })

            //&#f053

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
            return ctx.setSelection.paginationStart + " - " +
                Math.min(ctx.setSelection.paginationEnd, unusedSets.length)
        })

//        pagi.select(".multiSelect").style({
//            "font-weight": function () {
////                if (ctx.setSelection.mode === "multiSel"){
////                    return "bold"
////                }else{
//                    return "normal"
////                }
//            }
//        })


        var selRectPos = 0;
        var selRectOpa = 0;
        if (ctx.setSelection.mode === "multiSel") {
            selRectPos = 2.3 * paginationLinespace;
            selRectOpa = 1;
        } else if (ctx.setSelection.mode === "sortFilter") {
            selRectPos = 3.3 * paginationLinespace;
            selRectOpa = 1;
        }


        if (ctx.setSelection.modeChange) {
            pagi.select(".selectionRect").transition().duration(200)
                .attr({
                    y: selRectPos,
                    opacity: selRectOpa
                })

        } else {
            pagi.select(".selectionRect").attr({
                y: selRectPos,
                opacity: selRectOpa
            })
        }

        updateSecondMenu();

        // only one pass of mode change rendering
        ctx.setSelection.modeChange = false;


    }


    function updateSecondMenu() {

        var menuContent = []
        if (ctx.setSelection.mode === "multiSel") {
            menuContent =
                [[
                    {
                        name: "Add All Sets", func: function () {
                            unusedSets.forEach(function (d) {
                                ctx.setSelection.multiSelIn.add(d.elementName);
                            });
                            ctx.setSelection.multiSelOut = d3.set();
                            plotSetOverview();
                        }
                    },
                    {
                        name: "Clear All Sets", func: function () {
                            ctx.setSelection.multiSelIn = d3.set();
                            usedSets.forEach(function (d) {
                                ctx.setSelection.multiSelOut.add(d.elementName);
                            });

                            plotSetOverview()
                        }
                    },
                    {
                        name: "Cancel", func: function () {
                            ctx.setSelection.multiSelIn = d3.set();
                            ctx.setSelection.multiSelOut = d3.set();

                            //close multiselect panel
                            ctx.setSelection.mode = "none"
                            ctx.setSelection.modeChange = true
                            plotSetOverview();
                        }, fontawe: "\uf00d"
                    },
                    {name: "Confirm", func: bulkChange, fontawe: "\uf00c"}
                ]]

        } else if (ctx.setSelection.mode === "sortFilter") {
            menuContent =
                [[
                    {
                        name: "by Size", func: function () {
                            ctx.setSelection.setOrder = "size"
                            ctx.setSelection.mode = "none"
                            ctx.setSelection.modeChange = true
                            plotSetOverview();
                        }
                    },
                    {
                        name: "by Name", func: function () {
                            ctx.setSelection.setOrder = "name"
                            ctx.setSelection.mode = "none"
                            ctx.setSelection.modeChange = true
                            plotSetOverview()
                        }
                    }
                ]]

        }

        var menuExtra = headerSVG.selectAll(".setMenuExtra").data(menuContent);
        menuExtra.exit().remove();
        var menuExtraGroup = menuExtra.enter().append("g").attr("class", "setMenuExtra").attr({
            opacity: .1
        })

        menuExtraGroup.append("rect").attr({
            "class": "setSelectionArea",
            x: 5,
            width: paddingForPaginationRightExtra - 10,
            height: textHeight + 5
        })

        if (ctx.setSelection.modeChange) {
            menuExtra.transition().duration(500)
                .attr({
                    opacity: 1
                });
        }

        menuExtra
            .attr({
                "transform": "translate(" + (menuOffset) + "," + 0 + ")"
            });


        var menuExtraGroupEntries = menuExtraGroup.selectAll(".menuExtraEntry").data(function (d) {
            return d;
        })
        menuExtraGroupEntries.enter().append("text")
            .attr({
                "class": function (d) {
                    if ('fontawe' in d) {
                        return "menuExtraEntry setMenuExtraAwesome"
                    } else {
                        return "menuExtraEntry"
                    }
                },
                "transform": function (d, i) {
                    return "translate(" + (paddingForPaginationRightExtra / 2) + "," + ((1 + (i * 1.0)) * paginationLinespace) + ")";
                }
            })
            .style({
                "cursor": "pointer",
                "text-anchor": "middle"
            })
            .text(function (d) {
                if ('fontawe' in d) {
                    return d.fontawe + " " + d.name;
                } else {
                    return d.name;
                }
            })
            .on("click", function (d) {
                d.func();
            })


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

        if (ctx.setSelection.mode === "multiSel") {
            if (d.isSelected) {
                // for usedSets:
                if (ctx.setSelection.multiSelOut.has(d.elementName)) {
                    ctx.setSelection.multiSelOut.remove(d.elementName);
                } else {
                    ctx.setSelection.multiSelOut.add(d.elementName);
                }
            } else {
                // for UNusedSets:
                if (ctx.setSelection.multiSelIn.has(d.elementName)) {
                    ctx.setSelection.multiSelIn.remove(d.elementName);
                } else {
                    ctx.setSelection.multiSelIn.add(d.elementName);
                }
            }
            plotSetOverview();
        } else {
            updateSetContainment(d, true);
        }


//               d3.selectAll(".bulkCheck").transition().remove();
    }


    function bulkChange() {

        var list_update =
            sets.filter(function (d) {
                return ctx.setSelection.multiSelIn.has(d.elementName) ||
                    ctx.setSelection.multiSelOut.has(d.elementName)
            })


        ctx.setSelection.multiSelIn = d3.set();
        ctx.setSelection.multiSelOut = d3.set();

        //close multiselect panel
        ctx.setSelection.mode = "none"
        ctx.setSelection.modeChange = true

        if (list_update.length > 0) {
            // updateSetCon will call plot again
            list_update.map(function (d, i) {
                updateSetContainment(d, i == list_update.length - 1);
            });
        } else {
            plotSetOverview()
        }


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
