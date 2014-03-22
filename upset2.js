/**
 * Created by alex,nils,romain,hen
 */


var ctx = {
    majorPadding: 17,
    minorPadding: 2,
    cellDistance: 20,
    textHeight: 90,
    textSpacing: 3,

    setSizeWidth: 700,
    subSetSizeWidth: 300,

    leftOffset: 90,
    leftIndent: 10,
    topOffset: 120,

    /** The width from the start of the set vis to the right edge */



    expectedValueWidth: 300,

    labelTopPadding: 15,

    paddingTop: 30,
    paddingSide: 20,

    truncateAfter: 25,

    setCellDistance: 12,
    setCellSize: 10,
    cellWidth: 20,

//         subSetMatrixHeight;
//         h;
//         rowScale;

    svgHeight: 600, //height || 600;

    grays: [ '#f0f0f0', '#636363'],

    backHighlightColor: '#fed9a6',//'#fdbf6f'
    rowTransitions: true,
    barTransitions: true,

    globalStatistics: [
        {name: "largest intersection", id: "I", value: 100 },
        {name: "largest group", id: "G", value: 200 },
        {name: "largest set", id: "S", value: 300 },
        {name: "all items", id: "A", value: 400 }
    ]


};

//bindEvents();

function plot() {

    ctx.plot();
//    console.log("plot");
}

function UpSet() {

    // FAKE:
//    var usedSets = ["xx","zzz"];

    bindEvents();

    function setDynamicVisVariables() {
        // dynamic context variables
        ctx.cellSize = ctx.cellDistance; // - minorPadding,
        ctx.xStartSetSizes = ctx.cellWidth * usedSets.length + ctx.majorPadding;

        ctx.xStartExpectedValues = ctx.xStartSetSizes + ctx.subSetSizeWidth + 20;
        ctx.setVisWidth = ctx.expectedValueWidth + ctx.subSetSizeWidth
            + ctx.majorPadding + ctx.cellDistance + ctx.xStartSetSizes;

        ctx.w = ctx.cellWidth * usedSets.length + ctx.majorPadding + ctx.leftOffset
            + ctx.subSetSizeWidth + ctx.expectedValueWidth + 50;
        ctx.setMatrixHeight = ctx.setCellDistance + ctx.majorPadding;

        ctx.svgHeight = renderRows.length * ctx.cellSize + ctx.textHeight;

        ctx.intersectionClicked = function (d) {
            var selection = Selection.fromSubset(d.data);
            selections.addSelection(selection, true);
            selections.setActive(selection);
        }
    }

    function calculateGlobalStatistics() {
        var collector = {allItems: 1};
        dataRows.forEach(function (d) {
//            console.log(d);
            var setSize = d.setSize;
            var type = d.type;

            var maxValue = collector[ type];
            if (maxValue == null) {
                collector[type] = setSize;
            }
            else if (maxValue < setSize) {
                collector[type] = setSize;
            }
//            console.log(d.type);
//            if (d.type === ROW_TYPE.SUBSET) {
//                console.log("iS Before", collector.allItems);
//                collector.allItems += setSize;
//                console.log("iS", collector.allItems);
//            }

        })

//        d3.max(usedSets, function(d){})

//    console.log(usedSets);

//        {name: "largest intersection",id:"I", value:100 },
//        {name: "largest group",id:"G", value:200 },
//        {name: "largest set",id:"S", value:300 },
//        {name: "all items",id:"A", value:400 }

        ctx.globalStatistics.forEach(function (d) {
            switch (d.id) {
                case "I":
                    d.value = collector[ROW_TYPE.SUBSET];
                    break;
                case "G":
                    d.value = collector[ROW_TYPE.GROUP];
                    break;
                case "A":
                    d.value = allItems.length;
                    break;
                case "S":
                    d.value = d3.max(usedSets, function (d) {
                        return d.items.length
                    })
                    break;
                default:
                    break;
            }

        })

    }

    // All global variables and SVG elements
    function init() {

        setDynamicVisVariables();

        // create SVG and VIS Element
        d3.select('#vis').select('svg').remove();
        ctx.svg = d3.select('#vis')
            .style('width', ctx.w + "px")
            .append('svg')
            .attr('width', ctx.w)
            .attr('height', ctx.svgHeight);

        ctx.vis = ctx.svg.append("g").attr({
            class: "visContainer",
            "transform": "translate(" + ctx.leftOffset + "," + ctx.topOffset + ")"
        });

        ctx.foreignObject = ctx.vis.append("foreignObject")
            .attr("width", ctx.w)
            .attr("height", ctx.svgHeight)
            .attr("x", 0)//*cellSize)
            .attr("y", 210)//*cellSize)
            .attr("class", "foreignGRows")
        ctx.foreignDiv = ctx.foreignObject.append("xhtml:div")
            .style("position", "relative")
            .style("overflow-y", "auto")
            .style("height", "600px")
            .on("mousemove", function () {
                // Prevent global scrolling here?
            })
        ctx.foreignSVG = ctx.foreignDiv.append("svg")
            .attr({
                height: renderRows.length * ctx.cellDistance,
                width: ctx.w,
                class: "svgGRows"
            })

        // -- the background highlights
        ctx.columnBackgroundNode = ctx.foreignSVG.append("g").attr({
            class: "columnBackgroundsGroup"

        }).attr({"transform": "translate(90,-90)"})

        // Rows container for vertical panning
        ctx.gRows = ctx.foreignSVG
            .append('g')
            .attr({'class': 'gRows', "transform": "translate(90,-90)"})

        //####################### LogicPanel ##################################################

        ctx.logicPanelNode = ctx.vis.append("g").attr({
            class: "logicPanel",
            "transform": "translate(" + -ctx.leftOffset + "," + (ctx.textHeight + 5) + ")"
        })

        // TODO: give only context
        ctx.logicPanel = new LogicPanel(
            {width: ctx.setVisWidth + ctx.leftOffset,
                visElement: ctx.vis,
                panelElement: ctx.logicPanelNode,
                cellSize: ctx.cellSize,
                usedSets: usedSets,
                grays: ctx.grays,
                belowVis: ctx.foreignObject,
                buttonX: -ctx.leftOffset,
                buttonY: ctx.textHeight - 20,
                stateObject: UpSetState,
                subsets: subSets,
                callAfterSubmit: [updateState, rowTransition],
                ctx: ctx,
                cellWidth: ctx.cellWidth

            });
//            {
//                ctx:ctx
//            }
//        );

        ctx.tableHeaderNode = ctx.vis.append("g").attr({
            class: "tableHeader"
        })

        ctx.tableHeaderNode.append("g")

//        ctx.vis.append
//        ctx.brushedScale = new BrushableScale(ctx,)

        initRows();

        updateSetsLabels(ctx.tableHeaderNode);

        updateHeaders();

        plotSubSets();

        initCallback = [updateHeaders, plotSubSets] //TODO: bad hack !!!

//        updateWidthHandle()
    }

//    // update svg size
//    var updateSVG = function (width, height) {
//        ctx.w = width;
//        ctx.svgHeight = height;
//
//        ctx.svg
//            .attr('width', ctx.w)
//            .attr('height', ctx.svgHeight)
//
//    }

    //####################### SETS ##################################################
    function updateSetsLabels(tableHeaderNode) {

        var setRowScale = d3.scale.ordinal().rangeRoundBands([0, usedSets.length * (ctx.cellWidth)], 0);
        setRowScale.domain(usedSets.map(function (d) {
            return d.id
        }))

        var setRows = tableHeaderNode.selectAll('.setRow')
            .data(usedSets, function (d) {
                return d.elementName
            })

        var setRowsEnter = setRows.enter()
            .append('g').attr({
                class: "setRow"
            })

        setRows.exit().remove();

        var setRects = setRows.selectAll("rect").data(function (d, i) {
            return [d]
        })
        setRects.enter().append("rect").attr({
            class: "sortBySet connection vertical"
        })
            // FIXME: this breaks the event for the sorting, but without it, it doesn't highlight
           // .on('mouseover', mouseoverColumn)
            .on('mouseout', mouseoutColumn)
            .on('click', function(d){
                UpSetState.sorting = StateOpt.sortBySetItem;
                UpSetState.grouping = undefined;
                UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;
                updateState(d);
                rowTransition();
            })

        setRects.exit().remove();

        setRects.attr({
            transform: function (d, i) {
                return 'skewX(45) translate(' + (ctx.cellWidth * i - ctx.leftOffset) + ', 0)';
            },
            width: ctx.cellWidth,
            height: ctx.textHeight - 2
        })

        var setRowsText = setRows.selectAll("text").data(function (d) {
            return [d]
        })
        setRowsText.enter().append("text").text(
            function (d) {
                return d.elementName.substring(0, ctx.truncateAfter);
            }).attr({
                class: 'setLabel sortBySet',
                //  "pointer-events": "none",
                id: function (d) {
                    return d.elementName.substring(0, ctx.truncateAfter);
                },
                transform: function (d, i) {
                    return 'translate(' + (ctx.cellWidth * (i )) + ',' + (ctx.textHeight - ctx.textSpacing - 2) + ')rotate(45)';
                },
                'text-anchor': 'end'
            })
            .on('mouseover', mouseoverColumn)
            .on('mouseout', mouseoutColumn)
            .append("svg:title")
            .text(function (d, i) {
                return d.elementName;
            });

        setRowsText.attr({
            class: function () {
                if (ctx.cellWidth > 16) return 'setLabel'; else return 'setLabel small'
            }

        })

        setRows.attr({transform: function (d, i) {

            return 'translate(' + setRowScale(d.id) + ', 0)';
            //  return 'translate(0, ' + ( cellDistance * (i)) + ')';
        },
            class: 'setRow'});

    }

    function updateHeaders() {
        setDynamicVisVariables()

        calculateGlobalStatistics();
        var tableHeaderGroup = ctx.tableHeaderNode.selectAll(".tableHeaderGroup").data([1]);
        var tableHeader = tableHeaderGroup.enter().append("g").attr({class: "tableHeaderGroup"});

        // ------------------- set size bars header --------------------

        // *** init Part
//        tableHeader.append('rect')
//            .attr({
//                id:"subSetSizeLabelRect",
//                class: 'labelBackground subsetSizeLabel sortIntersectionSizeGlobal'
//            }).on(
//                'click',
//                function (d) {
//                    UpSetState.sorting = StateOpt.sortBySubSetSize;
//                    UpSetState.grouping = undefined;
//                    UpSetState.levelTwoGrouping = undefined;
//                    UpSetState.forceUpdate = true;
//                    $('#noGrouping').prop('checked', true);
//                    toggleGroupingL2(true);
//                    $('#sortIntersectionSize').prop('checked', true);
//
//                    updateState();
//                    rowTransition();
//            })
//        ;

//        tableHeader.append('text').text('Intersection Size')
//            .attr({
//                id:"subSetSizeLabelText",
//                class: 'columnLabel subsetSizeLabel sortIntersectionSizeGlobal',
//                "pointer-events": "none"
//            });

        tableHeader.append('g').attr()
            .attr({
                id: "subSetSizeAxis",
                class: 'axis'
            }).each(function () {
                ctx.brushableScaleSubsetUpdate = function () {

                };
                ctx.brushableScaleSubset = new BrushableScale(
                    ctx,
                    d3.select(this),
                    ctx.subSetSizeWidth,
                    "brushableScaleSubsetUpdate", "plotTable", "subSetSizeScale", {})
            });

        // *** update Part

        tableHeaderGroup.selectAll("#subSetSizeLabelRect").attr({
            transform: 'translate(' + ctx.xStartSetSizes + ',' + (ctx.labelTopPadding) + ')',
            height: '20',
            width: ctx.subSetSizeWidth
        });

        tableHeaderGroup.selectAll("#subSetSizeLabelText").attr({
            transform: 'translate(' + (ctx.xStartSetSizes + ctx.subSetSizeWidth / 2) + ','
                + (ctx.labelTopPadding + 10) + ')'
        });

//        // scale for the size of the plottingSets TODO --> make own function
//        ctx.subSetSizeScale = d3.scale.linear().domain([0, d3.max(dataRows, function (d) {
//            return d.setSize;
//        })]).nice().range([0, ctx.subSetSizeWidth]);

        var subSetSizeAxis = d3.svg.axis().scale(ctx.subSetSizeScale).orient('top').ticks(4);

        var maxValue = d3.max(ctx.globalStatistics, function (d) {
            return d.value
        });

        tableHeaderGroup.selectAll("#subSetSizeAxis").transition().attr({
            transform: 'translate(' + ctx.xStartSetSizes + ',' + (ctx.textHeight - 70) + ')'
        }).call(ctx.brushableScaleSubsetUpdate,
            {
                maxValue: maxValue,
                labels: ctx.globalStatistics

            })
//            .call(ctx.brushableScaleSubsetUpdate({
//                maxValue:1000
//            }))
//            .call(subSetSizeAxis);

        // ------------ expected value header -----------------------

        // *** init Part
        tableHeader.append('rect')
            .attr({
                id: "expectedValueLabelRect",
                class: 'labelBackground expectedValueLabel sortRelevanceMeasureGlobal'
            }).on(
            'click',
            function () {
                UpSetState.sorting = StateOpt.sortByExpectedValue;
                UpSetState.grouping = undefined;
                UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;
                $('#noGrouping').prop('checked', true);
                $('#sortRelevanceMeasure').prop('checked', true);
                toggleGroupingL2(true);
                updateState();
                rowTransition();
            });

        tableHeader.append('text').text('Disproportionality')
            .attr({
                id: "expectedValueLabelText",
                class: 'columnLabel sortRelevanceMeasureGlobal',
                "pointer-events": "none"
            });

        tableHeader.append('g').attr()
            .attr({
                id: "expectedValueAxis",
                class: 'axis'
            });

        // *** update Part
        tableHeaderGroup.selectAll("#expectedValueLabelRect").attr({
            transform: 'translate(' + ctx.xStartExpectedValues + ',' + ( ctx.labelTopPadding) + ')',
            height: '20',
            width: ctx.expectedValueWidth
        });

        tableHeaderGroup.selectAll("#expectedValueLabelText").attr({
            transform: 'translate(' + (ctx.xStartExpectedValues + ctx.expectedValueWidth / 2) + ','
                + ( ctx.labelTopPadding + 10) + ')'
        });

        // scale for the size of the plottingSets
        var minDeviation = d3.min(dataRows, function (d) {
            return d.disproportionality;
        });
        if (minDeviation > 0) {
            minDeviation = 0;
        }
        var maxDeviation = d3.max(dataRows, function (d) {
            return d.disproportionality;
        });

        var bound = d3.max([Math.abs(minDeviation), Math.abs(maxDeviation)]);
        if (bound < 0.1) {
            bound = 0.1;
        }

        ctx.expectedValueScale = d3.scale.linear().domain([-bound, bound]).nice().range([0, ctx.expectedValueWidth]);

        var formatPercent = d3.format(".0%");

        var expectedValueAxis = d3.svg.axis().scale(ctx.expectedValueScale).orient('top').ticks(4).tickFormat(formatPercent);

        tableHeaderGroup.select("#expectedValueAxis").transition().attr({
            transform: 'translate(' + ctx.xStartExpectedValues + ',' + (ctx.textHeight - 5) + ')'
        }).call(expectedValueAxis);

        updateSetsLabels(ctx.tableHeaderNode)

    }

    function initRows() {

        ctx.subSetMatrixHeight = renderRows.length * ctx.cellDistance;
        ctx.h = ctx.subSetMatrixHeight + ctx.textHeight;

        ctx.rowScale = d3.scale.ordinal().rangeRoundBands([ ctx.textHeight, ctx.h ], 0, 0);

        ctx.rowScale.domain(renderRows.map(function (d) {
            return d.id;
        }));
    }

    function updateSubSetGroups() {

        // ------------------- the rows -----------------------
        var subSets = ctx.gRows.selectAll('.row')
            .data(renderRows, function (d, i) {
                return d.id;
            });

        subSets
            .enter()
            .append('g')
            .attr({transform: function (d) {

                if (d.data.type === ROW_TYPE.SUBSET)
                    return 'translate(0, ' + ctx.rowScale(d.id) + ')';
                else {
                    var offset_y = ctx.textHeight;
                    if (d.data.level == 2)
                        offset_y += 10
                    return 'translate(0, ' + offset_y + ')';
                }
            }, class: function (d) {
                return 'row ' + d.data.type;
            }
            }).style("opacity", function (d) {
                if (d.data.type === ROW_TYPE.SUBSET)
                    return ctx.gRows.selectAll('.row')[0].length == 0 ? 1 : 0;
                else
                    return ctx.gRows.selectAll('.row')[0].length ? 0 : 1;
            })

        subSets.exit().remove();

        var subSetTransition = subSets;
        if (ctx.rowTransitions)
            subSetTransition = subSets
                .transition().duration(function (d, i) {
                    if (d.data.type === ROW_TYPE.SUBSET)
                        return queryParameters['duration'];
                    else
                        return queryParameters['duration'];
                })
        subSetTransition.attr({transform: function (d) {

            if (d.data.type === ROW_TYPE.SUBSET)
                return 'translate(0, ' + ctx.rowScale(d.id) + ')';
            else {
                offset_x = 0;
                //if (d.data.level == 2)
                //    offset_x += 10
                return 'translate(' + offset_x + ', ' + ctx.rowScale(d.id) + ')';
            }

        }, class: function (d) {
            return 'row ' + d.data.type;
        }}).transition().duration(100).style("opacity", 1);

        /*
         // add transparent background to make each row it sensitive for interaction
         combinationRows.selectAll('.backgroundRect').data(function (d) {
         return [d]
         })
         .enter().append("rect").attr({
         class: "backgroundRect",
         x: 0,
         y: 0,
         width: setVisWidth,
         height: cellSize
         })
         .style({
         "fill-opacity": 0,
         fill: "grey" // for debugging
         })
         .on({
         'mouseover': mouseoverRow,
         'mouseout': mouseoutRow
         });
         */

        return subSets;
    }

    function updateSubsetRows(subsetRows, setScale) {

        var backgrounds = subsetRows.selectAll(".backgroundRect").data(function (d) {
            return [d]
        })
        backgrounds.enter()
            .append("rect").attr({
                class: "backgroundRect",
                x: 0,
                y: 0,
                width: ctx.setVisWidth,
                height: ctx.cellSize
            })
            .style({
                "fill-opacity": 0.0001,
                fill: ctx.backHighlightColor // for debugging
            })
            .on({
                'mouseover': mouseoverRow,
                'mouseout': mouseoutRow
            })
        backgrounds.exit().remove();
        backgrounds.attr({
            width: ctx.setVisWidth,
            height: ctx.cellSize
        })

        var combinationGroups = subsetRows.selectAll('g').data(function (d) {
                // binding in an array of size one
                return [d.data.combinedSets];
            }
        )

        combinationGroups.enter()
            .append('g')
            .attr({class: 'combination'
            })
        combinationGroups.exit().remove();

        var cells = combinationGroups.selectAll('.cell').data(function (d) {
            return d.map(function (dd, i) {
                return {data: usedSets[i], value: dd}
            });
        })
        // ** init
        cells.enter()
            .append('circle')
            .on({
                'click': function (d) {

                    /* click event for cells*/
                },
                'mouseover': function (d, i) {
                    mouseoverCell(d3.select(this).node().parentNode.parentNode.__data__, i)
                },
                'mouseout': mouseoutCell
            })
        cells.exit().remove()

        //** update
        cells.attr('cx', function (d, i) {
            return (ctx.cellWidth) * i + ctx.cellWidth / 2;
        })
            .attr({
                r: ctx.cellSize / 2 - 1,
                cy: ctx.cellSize / 2,
                class: 'cell'
            })
            .style('fill', function (d) {
                return setScale(d.value);

            })

        // add the connecting line for cells
        var cellConnectors = combinationGroups.selectAll('.cellConnector').data(
            function (d) {
                // get maximum and minimum index of cells with value 1
                var extent = d3.extent(
                    d.map(function (dd, i) {
                        if (dd == 1) return i; else return -1;
                    })
                        .filter(function (dd, i) {
                            return dd >= 0;
                        })
                )

                // dont do anything if there is only one (or none) cell
                if (extent[0] == extent[1]) return [];
                else return [extent];
            }
        );
        //**init
        cellConnectors.enter().append("line").attr({
            class: "cellConnector",
            "pointer-events": "none"
        })
            .style({
                "stroke": setScale(1),
                "stroke-width": 3
            });
        cellConnectors.exit().remove();

        //**update
        cellConnectors.attr({
            x1: function (d) {
                return (ctx.cellWidth) * d[0] + ctx.cellWidth / 2;
            },
            x2: function (d) {
                return (ctx.cellWidth) * d[1] + ctx.cellWidth / 2;
            },
            y1: ctx.cellSize / 2,
            y2: ctx.cellSize / 2
        })

        /// --- the sizeBar
        /*
         var sizeBars = subsetRows.selectAll(".row-type-subset").data(function (d) {
         return [d]
         })
         sizeBars.enter()
         .append('rect')
         .attr("class", 'subSetSize row-type-subset')
         .attr({
         transform: function (d) {
         var y = 1;
         return   'translate(' + ctx.xStartSetSizes + ', ' + y + ')'; // ' + (textHeight - 5) + ')'
         },

         width: function (d) {
         return ctx.subSetSizeScale(d.data.setSize);
         },
         height: function (d) {
         return ctx.cellSize - 2
         }
         })
         .on('click', function (d) {
         ctx.intersectionClicked(d);
         })
         .on('mouseover', mouseoverRow)
         .on('mouseout', mouseoutRow)
         sizeBars.exit().remove();


         var sizeBarsChanges = sizeBars
         if (ctx.barTransitions) sizeBarsChanges.transition()
         sizeBarsChanges.attr({
         //class: 'subSetSize',
         transform: function (d) {
         var y = 1;
         return   'translate(' + ctx.xStartSetSizes + ', ' + y + ')'; // ' + (textHeight - 5) + ')'
         },

         width: function (d) {
         return ctx.subSetSizeScale(d.data.setSize);
         },
         height: function (d) {
         return ctx.cellSize - 2
         }
         })

         */

        subsetRows.each(function (e, j) {

            var g = d3.select(this);
            var max_scale = ctx.subSetSizeScale.domain()[1];
            var cellSizeShrink = 3;
            var maxLevels = 3;
            var i = 0, is_overflowing = false;
            var nbLevels = Math.min(maxLevels, Math.ceil(e.data.setSize / max_scale));

            var data = d3.range(nbLevels).map(function () {

                var f = {};
                f.data = {};
                f.data.type = e.data.type;

                if (i == nbLevels - 1 && Math.ceil(e.data.setSize / max_scale) < nbLevels + 1)
                    f.data.setSize = (e.data.setSize % max_scale);
                else
                    f.data.setSize = max_scale;
                i++;
                return f;
            })

            g.selectAll(".cutlines").remove();

            if (Math.ceil(e.data.setSize / max_scale) > maxLevels) {
                var g_lines = g.selectAll(".cutlines").data([e.id]).enter().append("g").attr("class", "cutlines")

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + 285, x2: ctx.xStartSetSizes + 295, y1: 0, y2: 20})
                    .style({'stroke': 'white', 'stroke-width': 1})

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + 280, x2: ctx.xStartSetSizes + 290, y1: 0, y2: 20})
                    .style({'stroke': 'white', 'stroke-width': 1})
            }

            // Add new layers
            var layers_enter = g.selectAll(".row-type-group").data(data).enter()

            layers_enter.append('rect')
                .attr("class", function (d) {
                    return ( 'subSetSize row-type-group' );

                })

            // Remove useless layers
            g.selectAll(".row-type-group").data(data).exit().remove()

            // Update current layers
            g.selectAll(".row-type-group")
                .attr({
                    transform: function (d, i) {
                        var y = 0;
                        if (d.data.type !== ROW_TYPE.SUBSET)
                            y = 0;//cellSize / 3 * .4;
                        return   'translate(' + (ctx.xStartSetSizes) + ', ' + (y + cellSizeShrink * i + 1) + ')'; // ' + (textHeight - 5) + ')'
                    },

                    width: function (d, i) {
                        return ctx.subSetSizeScale(d.data.setSize);
                    },
                    height: function (d, i) {
                        return ctx.cellSize - cellSizeShrink * 2 * i - 2;
                    }
                })
                .style("opacity", function (d, i) {
                    if (nbLevels == 1)
                        return .8;
                    else if (nbLevels == 2)
                        return .8 + i * .2;
                    else
                        return .4 + i * .4;
                })
                .on('click', function () {
                    ctx.intersectionClicked(d3.select(this).node().parentNode.__data__);
                })
                .on('mouseover', function () {
                    mouseoverRow(d3.select(this).node().parentNode.__data__);
                })
                .on('mouseout', function () {
                    mouseoutRow(d3.select(this).node().parentNode.__data__);
                })

        })

    }

    function updateGroupRows(groupRows) {
        var groupsRect = groupRows.selectAll(".groupBackGround").data(function (d) {
            return [d];
        });
        //**init
        groupsRect.enter().append('rect').attr({
            class: function (d) {
                if (d.data instanceof QueryGroup) {
                    return 'groupBackGround filterGroup';
                } else {
                    return 'groupBackGround'
                }
            },
            width: ctx.setVisWidth + ctx.leftOffset,
            height: ctx.cellSize,
            x: -ctx.leftOffset,
            y: 0
        }).on('click', function (d) {
                collapseGroup(d.data);
                rowTransition(false);
            });

        groupsRect.exit().remove();
        //**update
        groupsRect.attr({
            width: function (d) {
                return ctx.setVisWidth + ctx.leftOffset - (d.data.level - 1) * ctx.leftIndent;
            },
            height: ctx.cellSize,
            x: function (d) {
                return (d.data.level - 1) * ctx.leftIndent - ctx.leftOffset
            }
        });

        //  console.log('g2: ' + groups);
        var groupsText = groupRows.selectAll(".groupLabel.groupLabelText").data(function (d) {
            return [d];
        });
        groupsText.enter().append('text')
            .attr({class: 'groupLabel groupLabelText',
                y: ctx.cellSize - 3,
                x: function (d) {
                    return (-ctx.leftOffset + 12) + (d.data.level - 1) * ctx.leftIndent;
                },
                'font-size': ctx.cellSize - 6

            });
        groupsText.exit().remove();

        var queryGroupDecoItems = [
//            {id:"I", action:1, color:"#a1d99b"},
            {id: "X", action: 2, color: "#f46d43"}
        ];

        //** update
        groupsText.text(function (d) {

//            if (d.data instanceof QueryGroup){
//                return "@ "+d.data.elementName;
//            }
//            if (d.data.type === ROW_TYPE.GROUP)
//                return d.data.elementName;
            if (d.data.type === ROW_TYPE.AGGREGATE)
                return String.fromCharCode(8709) + '-subsets (' + d.data.subSets.length + ') ';
            else
                return d.data.elementName;
        }).attr({
                class: function () {
                    if (ctx.cellDistance < 14) return 'groupLabel groupLabelText small'; else return 'groupLabel groupLabelText'
                },
                y: ctx.cellSize - 3,
                x: function (d) {
                    return (-ctx.leftOffset + 15) + (d.data.level - 1) * ctx.leftIndent;
                }

            }).on('click', function (d) {
                collapseGroup(d.data);
                rowTransition(false);
            });

        var collapseIcon = groupRows.selectAll(".collapseIcon").data(function (d) {
            return [d];
        })
        collapseIcon.enter()
            .append("text")
            .attr({
                class: "collapseIcon"
            }).on('click', function (d) {
                collapseGroup(d.data);
                rowTransition(false);
            });

        collapseIcon
            .text(function (d) {
                if (d.data.isCollapsed == 0) return "\uf147";
                else return "\uf196"
            })
            .attr({"transform": function (d) {
                return "translate(" + (-ctx.leftOffset + 2 + 5 + (d.data.level - 1) * ctx.leftIndent) + "," + (ctx.cellSize / 2 + 5) + ")"
            }
            }).style({
                "font-size": "10px"
            })

        // -- Decoration for Filter Groups
        var allQueryGroups = groupRows.filter(function (d) {
            return (d.data instanceof QueryGroup)
        })
        var groupDeleteIcon = allQueryGroups.selectAll(".groupDeleteIcon").data(function (d) {
            return [d]
        })
        var groupDeleteIconEnter = groupDeleteIcon.enter().append("g").attr({
            class: "groupDeleteIcon"
        })
//        groupDeleteIconEnter.append("rect").attr({
//            x:-5,
//            y:-10,
//            width:10,
//            height:10,
//            fill:"#f46d43"
//        })
        groupDeleteIconEnter.append("text")
            .text("\uf05e")
            .on({
                "click": function (d) {

                    var index = -1;
                    UpSetState.logicGroups.forEach(function (dd, i) {

                        if (dd.id == d.id) index = i;
                    })

                    UpSetState.logicGroups.splice(index, 1);

                    UpSetState.logicGroupChanged = true;
                    UpSetState.forceUpdate = true;

                    updateState();
                    rowTransition();
                }
            }).style({ "fill": "#f46d43"})

        groupDeleteIcon.attr({
            "transform": "translate(" + (ctx.xStartSetSizes - 12) + "," + (ctx.cellSize / 2 + 4) + ")"
        })

//        allQueryGroups.each(function(queryGroup){
//
//            var groupData = queryGroupDecoItems.map(function(pE){
//                    return {pElement:pE,dataSource: queryGroup}
//                })
//
//            var panelElementItems = d3.select(this).selectAll(".decoQuery")
//                .data(groupData);
//            var panelElementsEnter = panelElementItems.enter()
//                .append("g").attr("class","decoQuery")
//
//            panelElementsEnter.append("rect").attr({
//                fill:function(d){return d.pElement.color},
//                opacity:.5
//            })
//            panelElementsEnter.append("text").text(function(d){return d.pElement.id});
//
//            panelElementItems.select("rect").attr({
//                x:function(d,i){return ctx.xStartSetSizes-((i+1) *ctx.cellDistance/2)-1},
//                y:1,
//                width:+(ctx.cellDistance/2-1),
//                height:ctx.cellSize-2
//            })
//
//            panelElementItems.select("text")
//                .attr({
//                    class: function(){if (ctx.cellDistance<14) return 'groupLabel small'; else return 'groupLabel'},
//                    y: ctx.cellSize-3,
//                    x: function(d,i){return ctx.xStartSetSizes-(i +.5)*ctx.cellDistance/2-1.5}
////                    'font-size': ctx.cellSize - 6
//                }).style({
//                    "text-anchor":"middle",
//                    "font-weight":"bold"
//                }).on('click', function (d) {
//                   console.log(d.dataSource);
//                })
//            })

//        })

        // --- Horizon Bars for size.

        groupRows.each(function (e, j) {

            var g = d3.select(this);
            var max_scale = ctx.subSetSizeScale.domain()[1];
            var cellSizeShrink = 3;
            var maxLevels = 3;
            var i = 0, is_overflowing = false;
            var nbLevels = Math.min(maxLevels, Math.ceil(e.data.setSize / max_scale));

            var data = d3.range(nbLevels).map(function () {

                var f = {};
                f.data = {};
                f.data.type = e.data.type;

                if (i == nbLevels - 1 && Math.ceil(e.data.setSize / max_scale) < nbLevels + 1)
                    f.data.setSize = (e.data.setSize % max_scale);
                else
                    f.data.setSize = max_scale;
                i++;
                return f;
            })

            g.selectAll(".cutlines").remove();

            if (Math.ceil(e.data.setSize / max_scale) > maxLevels) {
                var g_lines = g.selectAll(".cutlines").data([e.id]).enter().append("g").attr("class", "cutlines")

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + 285, x2: ctx.xStartSetSizes + 295, y1: 0, y2: 20})
                    .style({'stroke': 'white', 'stroke-width': 1})

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + 280, x2: ctx.xStartSetSizes + 290, y1: 0, y2: 20})
                    .style({'stroke': 'white', 'stroke-width': 1})
            }

            // Add new layers
            var layers_enter = g.selectAll(".row-type-group").data(data).enter()

            layers_enter.append('rect')
                .attr("class", function (d) {
                    return ( 'subSetSize row-type-group' );

                })

            // Remove useless layers
            g.selectAll(".row-type-group").data(data).exit().remove()

            // Update current layers
            g.selectAll(".row-type-group")
                .attr({
                    transform: function (d, i) {
                        var y = 0;
                        if (d.data.type !== ROW_TYPE.SUBSET)
                            y = 0;//cellSize / 3 * .4;
                        return   'translate(' + (ctx.xStartSetSizes) + ', ' + (y + cellSizeShrink * i) + ')'; // ' + (textHeight - 5) + ')'
                    },

                    width: function (d, i) {
                        return ctx.subSetSizeScale(d.data.setSize);
                    },
                    height: function (d, i) {
                        return ctx.cellSize - cellSizeShrink * 2 * i;
                    }
                })
                .style("opacity",function (d, i) {
                    if (nbLevels == 1)
                        return 1;
                    else if (nbLevels == 2)
                        return .8 + i * .2;
                    else
                        return .4 + i * .4;
                }).on('click', function (d) {
                    var selection = Selection.fromSubset(d3.select(this).node().parentNode.__data__.data.subSets);
                    selections.addSelection(selection, true);
                    selections.setActive(selection);
                })

        })

    }

    function updateRelevanceBars(allRows) {
        var expectedValueBars = allRows.selectAll(".disproportionality").data(function (d) {
            return [d]
        })

        expectedValueBars.enter()
            .append('rect')
            .attr({
                transform: function (d) {
                    var start = ctx.expectedValueScale(d3.min([0, d.data.disproportionality]));
                    start += ctx.xStartExpectedValues;
                    var y = 0;
                    if (d.data.type !== ROW_TYPE.SUBSET)
                        y = 1;//cellSize / 3 * 1.7;
                    return 'translate(' + start + ', ' + y + ')';
                },
                width: 1,
                height: function (d) {
                    if (d.data.type === ROW_TYPE.SUBSET)
                        return ctx.cellSize - 2;
                    else
                        return ctx.cellSize;// / 3;
                }
            })
            .on('mouseover', mouseoverRow)
            .on('mouseout', mouseoutRow)

        expectedValueBars.exit().remove()

        // transition for subsets
        changeTheValues(expectedValueBars.filter(function (d) {
            return (d.data.type === ROW_TYPE.SUBSET)
        }).transition())

        // no transition for groups
        changeTheValues(expectedValueBars.filter(function (d) {
            return (d.data.type !== ROW_TYPE.SUBSET)
        }))
//        expectedValueBars.transition()

        function changeTheValues(node) {
            node.attr({
                class: function (d) {
                    return d.data.disproportionality < 0 ? 'disproportionality negative' : 'disproportionality positive';
                },
                transform: function (d) {
                    if (isNaN(d.data.disproportionality)) {
                        return 'translate(' + 0 + ', ' + 0 + ')';
                    }
                    var start = ctx.expectedValueScale(d3.min([0, d.data.disproportionality]));
                    start += ctx.xStartExpectedValues;
                    var y = 0;
                    if (d.data.type == ROW_TYPE.SUBSET)
                        y = 1;//cellSize / 3 * 1.7;
                    return 'translate(' + start + ', ' + y + ')';
                },
                width: function (d) {
                    if (isNaN(d.data.disproportionality)) {
                        return 0;
                    }
                    //  console.log(d.data.disproportionality)
                    return Math.abs(ctx.expectedValueScale(d.data.disproportionality) - ctx.expectedValueScale(0));
                },
                height: function (d) {
                    if (d.data.type === ROW_TYPE.SUBSET)
                        return ctx.cellSize - 2;
                    else
                        return ctx.cellSize;// / 3;
                }
            })
        }
    }

    function updateOverlays(allRows) {
        if (selections.getSize() == 0) {
            allRows.selectAll(".what").remove();
            allRows.selectAll('.selectionIndicators').remove();
            return;
        }

        var selectionOverlay = allRows.selectAll(".what").data(function (d) {
            return [d]
        })
        selectionOverlay.enter().append('rect')
            .on('click', function (d) {
                if (d.data.type === ROW_TYPE.SUBSET) {
                    var selection = Selection.fromSubset(d.data);
                    selections.addSelection(selection, true);
                    selections.setActive(selection);
                }
            })
            .on('mouseover', mouseoverRow)
            .on('mouseout', mouseoutRow)
            .attr("class", "what");

        selectionOverlay
            .attr({
                transform: function (d) {
                    var y = 0;
                    if (d.data.type == ROW_TYPE.SUBSET)
                        y = 1; //cellSize / 3 * .4;
                    return   'translate(' + ctx.xStartSetSizes + ', ' + y + ')'; // ' + (textHeight - 5) + ')'
                },

                width: function (d) {
                    var s = d.data.selections;
                    if (typeof s !== 'object') {
                        return 0;
                    }

                    var usedID = false;
                    //   var alternativeID;
                    var sIDs = Object.getOwnPropertyNames(s);
                    sIDs.forEach(function (prop) {
                        var length = s[prop].length;
                        if (selections.isActiveByUuid(prop)) {
                            usedID = prop;
                        }
                    });
                    if (!usedID) {
                        return 0;
                    }
                    d3.select(this).style("fill", selections.getColorFromUuid(usedID));
                    return   ctx.subSetSizeScale(s[usedID].length);
                },
                height: function (d) {
                    return ctx.cellSize - 2// / 3;

                }
            })

        // the triangles for the multiple selections

        var selectIndicators = allRows.selectAll('.selectionIndicators').data(function (d, i) {
            if (!d.data.selections)
                return [];
            var selectionIDs = Object.getOwnPropertyNames(d.data.selections);
            var selArray = selectionIDs.map(function (k) {
                return {uuid: k, items: d.data.selections[k]};
            });
            selArray = selArray.filter(function (d) {
                return d.items.length !== 0;
            })
            return selArray;
        })
        selectIndicators.enter()
            .append('path').attr({
                class: 'selectionIndicators'
            }).on('click', function (d) {
                selections.setActiveByUuid(d.uuid);
                updateOverlays(allRows);
            })
        selectIndicators.exit().remove();
        selectIndicators.attr({
            transform: function (d, i) {

                return 'translate(' + (ctx.xStartSetSizes + ctx.subSetSizeScale(d.items.length)) + ' , ' + 0 +
                    ')';
            },
            d: function (d) {
                return  " M -5 0  L  5 0  L 0 6 z M 0 6 L 0 " + ctx.cellSize;
            },

            stroke: 'white',
            "stroke-width": 1,
            fill: function (d, i) {
                return selections.getColorFromUuid(d.uuid);
            }
        })
    }

    function updateBarLabels(allRows) {
        var barLabels = allRows.selectAll(".intersectionSizeLabel").data(function (d) {
            return[d]
        })
        barLabels.enter().append('text')
            .attr({class: 'intersectionSizeText intersectionSizeLabel'})
            .on('click', function (d) {
                ctx.intersectionClicked(d)
            });
        barLabels.exit().remove();

        var barLabelChanges = barLabels.text(function (d) {
            return d.data.setSize;
        })
        if (ctx.barTransitions) barLabelChanges.transition()
        barLabelChanges.attr({class: 'intersectionSizeText intersectionSizeLabel',
            y: ctx.cellSize / 2,
            x: function (d) {
                return ctx.xStartSetSizes + ctx.subSetSizeScale(d.data.setSize) + 2;
            }

        });
    }

    function updateColumnBackgrounds() {
        var columnBackgrounds = ctx.columnBackgroundNode.selectAll(".columnBackground").data(usedSets);
        columnBackgrounds.enter().append("rect").attr({
            class: "columnBackground"
        }).style({
                "stroke": "none",
                fill: ctx.backHighlightColor,
                opacity: 0
            })
        columnBackgrounds.exit().remove();
        columnBackgrounds.attr({
            'x': function (d, i) {
                return (ctx.cellWidth) * i;
            },
            y: ctx.textHeight,
            height: ctx.h, //TODO: better value there
            width: ctx.cellWidth
        })
    }

    function plotSubSets() {

        setDynamicVisVariables();
        initRows();

        // make the scroallable SVG adapt:
        ctx.foreignSVG.attr({
            height: ctx.svgHeight
        })
        // to limit the foraignobject again
        updateFrames($(window).height(), null);

        updateColumnBackgrounds();

        // generate <g> elements for all rows
        var allRows = updateSubSetGroups()

        var setScale = d3.scale.ordinal().domain([0, 1]).range(ctx.grays);

        var subSetRows = allRows.filter(function (d) {
            return d.data.type === ROW_TYPE.SUBSET;
        })

        // decorate subset rows
        updateSubsetRows(subSetRows, setScale);

        var groupRows = allRows.filter(function (d, i) {
            if (d.data.type === ROW_TYPE.GROUP || d.data.type === ROW_TYPE.AGGREGATE)
                return true;
            return false;
        })

        // decorate GroupRows
        updateGroupRows(groupRows);

        // add BarLabels to all bars
        updateBarLabels(allRows);

//
        // Rendering the highlights and ticks for selections on top of the selected subsets
        updateOverlays(allRows);

        // ----------------------- expected value bars -------------------

        updateRelevanceBars(allRows);

        // Adjust the row height
        d3.select(".divForeign").select("svg").attr("height", renderRows.length * ctx.cellDistance);
    }

    function bindEvents() {
        $(EventManager).bind("item-selection-added", function (event, data) {
            console.log("Selection was added to selection list with color " + selections.getColor(data.selection) + ' and ' + data.selection.items.length + ' items.');

            data.selection.mapToSubsets(subSets);

            plotSelectionTabs("#selection-tabs", selections, data.selection);
            plotSelectedItems("#item-table", data.selection);
            elementViewers.renderViewer();
        });

        $(EventManager).bind("item-selection-updated", function (event, data) {
            console.log('Selection was updated! New length is ' + data.selection.items.length + ' items.');

            data.selection.mapToSubsets(subSets);
            plot();
            plotSelectionTabs("#selection-tabs", selections, data.selection);
            plotSelectedItems("#item-table", data.selection);
            elementViewers.renderViewer();

            plotSetOverview();
        });

        $(EventManager).bind("item-selection-removed", function (event, data) {
            console.log("Selection was removed from selection list.");
            data.selection.unmapFromSubsets(subSets);

            plot();
            plotSelectionTabs("#selection-tabs", selections, selections.getActive());
            plotSelectedItems("#item-table", selections.getActive());
            elementViewers.renderViewer();
            plotSetOverview();
        });

        $(EventManager).bind("item-selection-activated", function (event, data) {
            if (data.selection) {
                console.log('Selection ' + data.selection.id + ' was activated.');

                plot();
                plotSelectionTabs("#selection-tabs", selections, data.selection);
                plotSelectedItems("#item-table", data.selection);
                plotSetOverview();
            }
            else {
                plot();
                plotSelectionTabs("#selection-tabs", selections, data.selection);
                plotSelectedItems("#item-table", data.selection);
                plotSetOverview();
            }
        });

        $(EventManager).bind("ui-resize", function (event, data) {
            ctx.resizeSetView(data.newHeight, null)
//            plot(Math.floor(data.newWidth * .66), Math.floor(data.newHeight));
            plotSetOverview();
        });

        $(EventManager).bind("ui-vertical-resize", function (event, data) {

            ctx.resizeSetView(data.newHeight, null)
//            plot(undefined, Math.floor(data.newHeight));
            plotSetOverview();
        });

        $(EventManager).bind("ui-horizontal-resize", function (event, data) {
            plot(Math.floor(data.newWidth * .66), undefined);
            plotSetOverview();
        });

        $(EventManager).bind("loading-dataset-started", function (event, data) {
            $(".ui-fader").show();
            $("#data-loading-indicator").show();
        });

        $(EventManager).bind("loading-dataset-finished", function (event, data) {
            $(".ui-fader").fadeOut(1000);
            $("#data-loading-indicator").fadeOut(1000);

            elementViewers.renderController();
            elementViewers.renderViewer();
        });

        $(EventManager).bind("set-added", function (event, data) {
            if (usedSets.length === 2 || usedSets.length === 3) {
                $("#venn-diagram-viewer").fadeIn(500);
                venn.plot(undefined, usedSets.length);
            }

            if (usedSets.length !== 2 && usedSets.length !== 3) {
                $("#venn-diagram-viewer").fadeOut(500);
            }
        });

        $(EventManager).bind("set-removed", function (event, data) {
            if (usedSets.length === 2 || usedSets.length === 3) {
                $("#venn-diagram-viewer").fadeIn(500);
                venn.plot(undefined, usedSets.length);
            }

            if (usedSets.length !== 2 && usedSets.length !== 3) {
                $("#venn-diagram-viewer").fadeOut(500);
            }
        });

        $(EventManager).bind("vis-svg-resize", function (event, data) {
            //vis-svg-resize", { newWidth:+(leftWidth + (endX - startX)) });
            updateFrames(null, data.newWidth);
            updateHeaders()
            plotSubSets()

        });
    }

    /** Passing true will disable the group */
    function toggleGroupingL2(disable) {
        var noGroupingL2 = $('#noGroupingL2');

        if (disable) {
            noGroupingL2.prop('checked', true);
        }
        noGroupingL2.prop('disabled', disable);

        $('#groupByIntersectionSizeL2').prop('disabled', disable);
        $('#groupBySetL2').prop('disabled', disable);
        $('#groupByRelevanceMeasureL2').prop('disabled', disable);
        $('#groupByOverlapDegreeL2').prop('disabled', disable);
    }

    function disableL2Equivalent(id) {
        var l2 = $(id);
        if (l2.prop('checked')) {
            $('#noGroupingL2').prop('checked', true);
        }
        l2.prop('disabled', true);
    }

    function setUpSortSelections() {


        // ----------- grouping L1 -------------------------

        d3.selectAll('#groupByIntersectionSize').on(
            'click',
            function (d) {
                UpSetState.grouping = StateOpt.groupByIntersectionSize;
                UpSetState.levelTwoGrouping = undefined;
                toggleGroupingL2(false);
                disableL2Equivalent('#groupByIntersectionSizeL2');

                updateState();
                rowTransition();
//                d3.selectAll('#groupByIntersectionSizeL2').attr('disabled', true);
            });

        d3.selectAll('#groupBySet').on(
            'click',
            function (d) {
                UpSetState.grouping = StateOpt.groupBySet;
                UpSetState.levelTwoGrouping = undefined;
                toggleGroupingL2(false);
                disableL2Equivalent('#groupBySetL2');

                updateState();
                rowTransition();
            });

        d3.selectAll('#groupByRelevanceMeasure').on(
            'click',
            function (d) {
                UpSetState.grouping = StateOpt.groupByRelevanceMeasure;
                UpSetState.levelTwoGrouping = undefined;
                toggleGroupingL2(false);
                disableL2Equivalent('#groupByRelevanceMeasureL2');
                updateState();
                rowTransition();
            });

        d3.selectAll('#groupByOverlapDegree').on(
            'click',
            function (d) {
                UpSetState.grouping = StateOpt.groupByOverlapDegree;
                UpSetState.levelTwoGrouping = undefined;
                toggleGroupingL2(false);
                disableL2Equivalent('#groupByOverlapDegreeL2');
                updateState();
                rowTransition();
            });

        d3.selectAll('#noGrouping').on(
            'click',
            function (d) {
                UpSetState.grouping = undefined;
                UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;

                toggleGroupingL2(true);

                updateState();
                rowTransition();
            });

        // ---------------- Grouping L2 -----------

        d3.selectAll('#groupByIntersectionSizeL2').on(
            'click',
            function (d) {
                UpSetState.levelTwoGrouping = StateOpt.groupByIntersectionSize;
                updateState();
                rowTransition();
            });

        d3.selectAll('#groupBySetL2').on(
            'click',
            function (d) {
                UpSetState.levelTwoGrouping = StateOpt.groupBySet;
                updateState();
                rowTransition();
            });

        d3.selectAll('#groupByOverlapDegreeL2').on(
            'click',
            function (d) {
                UpSetState.levelTwoGrouping = StateOpt.groupByOverlapDegree;
                updateState();
                rowTransition();
            });

        d3.selectAll('#groupByRelevanceMeasureL2').on(
            'click',
            function (d) {
                UpSetState.levelTwoGrouping = StateOpt.groupByRelevanceMeasure;
                updateState();
                rowTransition();
            });

        d3.selectAll('#noGroupingL2').on(
            'click',
            function (d) {
                UpSetState.levelTwoGrouping = undefined;
                updateState();
                rowTransition();
            });

        // ------- options ----

        d3.selectAll('#collapseAll').on(
            'click',
            function (d) {
                UpSetState.collapseAll = true;
                UpSetState.collapseChanged = true;
                updateState();
                rowTransition();
            });

        d3.selectAll('#expandAll').on(
            'click',
            function (d) {
                UpSetState.expandAll = true;
                UpSetState.collapseChanged = true;
                updateState();
                rowTransition();
            });

        // --------- sortings ------

        // sort based on occurrence of one specific data item

       // FIXME this should be here, not up next to the object
//        d3.selectAll('.sortBySet').on(
//            'click',
//            function (d) {
//                UpSetState.sorting = StateOpt.sortBySetItem;
//                UpSetState.grouping = undefined;
//                UpSetState.levelTwoGrouping = undefined;
//                updateState(d);
//                rowTransition();
//            });

        d3.selectAll('#sortNrSetsInIntersection').on(
            'click',
            function (d) {
                UpSetState.sorting = StateOpt.sortByCombinationSize;
//                UpSetState.grouping = undefined;
//                UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;
                updateState();
                rowTransition();
            });

        d3.selectAll('.sortIntersectionSizeGlobal').on(
            'click',
            function (d) {
                UpSetState.sorting = StateOpt.sortBySubSetSize;
                UpSetState.grouping = undefined;
                UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;
                $('#noGrouping').prop('checked', true);
                toggleGroupingL2(true);
                $('#sortIntersectionSize').prop('checked', true);

                updateState();
                rowTransition();
            });

        d3.selectAll('#sortIntersectionSize').on(
            'click',
            function (d) {
                UpSetState.sorting = StateOpt.sortBySubSetSize;
                UpSetState.forceUpdate = true;
                updateState();
                rowTransition();
            });

        // Not preserving the grouping
        d3.selectAll('.sortRelevanceMeasureGlobal').on(
            'click',
            function () {
                UpSetState.sorting = StateOpt.sortByExpectedValue;
                UpSetState.grouping = undefined;
                UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;
                $('#noGrouping').prop('checked', true);
                $('#sortRelevanceMeasure').prop('checked', true);
                toggleGroupingL2(true);
                updateState();
                rowTransition();
            });

        // Preserving the grouping
        d3.selectAll('#sortRelevanceMeasure').on(
            'click',
            function () {
                UpSetState.sorting = StateOpt.sortByExpectedValue;
                UpSetState.forceUpdate = true;
                updateState();
                rowTransition();
            });

    }

    document.getElementById('rowSizeValue').addEventListener('input', function () {
        ctx.cellDistance = +(document.getElementById('rowSizeValue').value);
        //console.log(ctx.cellSize);
        rowTransition();
    });

    document.getElementById('rowPaddingValue').addEventListener('input', function () {
        ctx.cellDistance = +(document.getElementById('rowPaddingValue').value);
        //console.log(ctx.cellSize);
        rowTransition();
    });

    var rowTransition = function (animateRows) {
        if (animateRows != null) ctx.rowTransitions = animateRows;
        else ctx.rowTransitions = true;
        updateHeaders();
        plotSubSets();
        ctx.rowTransitions = true
    }

    ctx.updateHeaders = updateHeaders;
    ctx.plot = rowTransition
    ctx.plotTable = function () {
        ctx.barTransitions = false;
        plotSubSets();
        ctx.barTransitions = true;
    }

    ctx.resizeSetView = rowTransition
//    function(windowHeight, windowWidth){
//        updateFrames(windowHeight, windowWidth);
//        rowTransition(false);
//    }

    function updateFrames(windowHeight, windowWidth) {
        if (windowWidth == null) {
            ctx.svg.attr({
                height: (windowHeight - 70)
            })

            var visHeight = windowHeight - ctx.textHeight - 70;

            ctx.foreignObject.attr({
                height: visHeight
            })

            ctx.foreignDiv.style("height", +(visHeight - ctx.textHeight) + "px")
        } else if (windowHeight == null) {
            ctx.svg.attr({
                width: (Math.max(windowWidth, 400))
            })

            ctx.subSetSizeWidth = d3.scale.linear()
                .domain([680, 480]).range([300, 100]).clamp(true)(windowWidth);

            ctx.expectedValueWidth = d3.scale.linear()
                .domain([880, 680]).range([300, 100]).clamp(true)(windowWidth);

            ctx["brushableScaleSubsetUpdate"](null, {
                width: ctx.subSetSizeWidth
            });
        }
    }

    setUpSortSelections()
    initData(ctx, [init]);
//    init();

}

UpSet();


