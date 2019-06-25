/**
 * Created by alex,nils,romain,hen
 */


var ctx = {
    majorPadding: 25,
    minorPadding: 2,
    cellDistance: 20,
    textHeight: 90,
    textSpacing: 3,

    setSizeWidth: 700,
    subSetSizeWidth: 200,
    subSetSizeWidthMax: 200,

    leftOffset: 90,
    leftIndent: 10,
    topOffset: 120,

    /** The width from the start of the set vis to the right edge */

    cellSizeShrink: 3,
    maxLevels: 3,

    expectedValueWidth: 150,
    expectedValueWidthMax: 150,

    labelTopPadding: 20+22,

    paddingTop: 30,
    paddingSide: 20,



    truncateAfter: 20,
    truncateGroupAfter: 30,

    setCellDistance: 12,
    setCellSize: 10,
    cellWidth: 20,

//         tableBodyHeight;
//         h;
//         rowScale;

    svgHeight: 600, //height || 600;

    grays: [ '#f0f0f0', '#636363'],

    backHighlightColor: '#fed9a6',//'#fdbf6f'
    rowTransitions: true,
    barTransitions: true,

    globalStatistics: [
        {name: "largest intersection", id: "I", value: 100 },
        {name: "largest aggregate", id: "A", value: 200 },
        {name: "largest set", id: "S", value: 300 },
        {name: "universal set", id: "U", value: 400 }
    ],

    nameForRelevance:"Disproportionality",

    summaryStatisticVis : [{
        attribute:"",
        visObject:{}
    }],// list of all statistic graphs TODO: make dynamic !!!
    summaryStatisticsWidth:100,


    // GROUPING OPTIONS
    groupingOptions : {},

    setSelection: {
        paginationStart:0,
        paginationEnd:10,
        mode:"none", // special modes are: "multiSel", "sortFilter"
        modeChange: false,// only true if mode changed and re-rendering
        multiSelIn:d3.set(),
        multiSelOut:d3.set(),
        setOrder: 'size' // options: size or name
    },

    logicStates: {
        NOT:0,
        DONTCARE:2,
        MUST:1
    }


};

//bindEvents();

function plot() {
    ctx.plot();
}

function UpSet(datasets) {

    // FAKE:
//    var usedSets = ["xx","zzz"];

    bindEvents();

    function setDynamicVisVariables() {

        ctx.tableBodyHeight = renderRows.length * (ctx.cellDistance+4);
//        ctx.h = ctx.tableBodyHeight + ctx.textHeight;

        ctx.rowScale = d3.scale.ordinal().rangeRoundBands([ 0, ctx.tableBodyHeight], 0, 0);
        ctx.rowScale.domain(renderRows.map(function (d) {
            return d.id;
        }));


        // dynamic context variables
        ctx.cellSize = ctx.cellDistance; // - minorPadding,

        ctx.xStartSetSizes = ctx.cellWidth * usedSets.length + ctx.majorPadding;



        ctx.xStartExpectedValues = ctx.xStartSetSizes + ctx.subSetSizeWidth + ctx.majorPadding;

        ctx.setVisWidth = ctx.expectedValueWidth + ctx.subSetSizeWidth
            + ctx.majorPadding + ctx.cellDistance + ctx.xStartSetSizes+ctx.summaryStatisticVis.length*(ctx.summaryStatisticsWidth+ctx.majorPadding);// TODO HACK !!!

        ctx.w = ctx.cellWidth * usedSets.length + ctx.majorPadding + ctx.leftOffset
            + ctx.subSetSizeWidth + ctx.expectedValueWidth + 50 +ctx.summaryStatisticVis.length*(ctx.summaryStatisticsWidth+ctx.majorPadding);
        ctx.setMatrixHeight = ctx.setCellDistance + ctx.majorPadding;

        ctx.svgHeight = /*renderRows.length * ctx.cellSize*/ctx.rowScale.rangeExtent()[1];// TODO: Duplicate to ctx.tableBodyHeight

        ctx.intersectionClicked = function (d) {
            var selection = Selection.fromSubset(d.data);
            selections.addSelection(selection, false);
            selections.setActive(selection);
        }


        ctx.xStartStatisticColumns = ctx.xStartExpectedValues+ ctx.expectedValueWidth+ctx.majorPadding // TODO: HACK!!!


        ctx.horizonBarGrays = d3.scale.linear().domain([0,1,2]).range(["#bdbdbd","#888888","#252525" ])

    }

    function calculateGlobalStatistics() {
        var collector = {allItems: 1};
        dataRows.forEach(function (d) {

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
                case "A":
                    d.value = collector[ROW_TYPE.GROUP];
                    break;
                case "U":
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
        d3.select('#bodyVis').select('svg').remove();
        ctx.svgBody = d3.select('#bodyVis')
//            .style('width', ctx.w + "px")
            .append('svg')
            .attr('width', ctx.w)
            .attr('height', renderRows.length * ctx.cellDistance);

//        ctx.vis = ctx.svgBody.append("g").attr({
//            class: "svgRows",
//            "transform": "translate(" + ctx.leftOffset + "," + ctx.topOffset + ")"
//        });

        // -- the background highlights
        ctx.columnBackgroundNode = ctx.svgBody.append("g").attr({
            class: "columnBackgroundsGroup"

        }).attr({
           "transform":"translate("+ctx.leftOffset+","+0+")"
        })

        // Rows container for vertical panning
        ctx.gRows = ctx.svgBody
            .append('g')
            .attr({
                'class': 'gRows',
                "transform":"translate("+ctx.leftOffset+","+0+")"
            })

        // tooltips on top !
        ctx.toolTipLayer = ctx.svgBody.append("g").attr({class:"toolTipLayer"});



        d3.select("#headerVis").select("svg").remove();
        ctx.svgHeader = d3.select("#headerVis").append('svg')
            .attr('width', ctx.w)
            .attr('height', 65+ctx.textHeight);
//            .style({
//                "top":"",
//                "position":"relative"
//            });


        //####################### LogicPanel ##################################################

        ctx.logicPanelNode = ctx.svgBody.append("g").attr({
            class: "logicPanel",
            "transform": "translate(" + 0 + "," + 0 + ")"
        })

        // TODO: give only context
        ctx.logicPanel = new LogicPanel(
            {width: ctx.setVisWidth + ctx.leftOffset,
                visElement: ctx.svgHeader,
                panelElement: ctx.logicPanelNode,
                cellSize: ctx.cellSize,
                usedSets: usedSets,
                grays: ctx.grays,
                belowVis: ctx.gRows,
                buttonX: 0,
                buttonY: ctx.svgHeader.attr("height")-20,
                stateObject: UpSetState,
                subsets: subSets,
                callAfterSubmit: [updateState, updateStatistics, rowTransition],
                leftAlignment:ctx.leftOffset,
                ctx: ctx,
                cellWidth: ctx.cellWidth

            });
//            {
//                ctx:ctx
//            }
//        );




        ctx.tableHeaderNode = ctx.svgHeader.append("g").attr({
            class: "tableHeader",
            "transform":"translate("+ctx.leftOffset+","+(ctx.svgHeader.attr("height")-ctx.textHeight)+")"
        })

//        ctx.tableHeaderNode.append("g")

//        ctx.vis.append
//        ctx.brushedScale = new BrushableScale(ctx,)

        // For horizon subset size
        ctx.svgBody.append('defs')
            .append('pattern')
            .attr('id', 'diagonalHatch_0')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 8)
            .attr('height', 8)
            .append('path')
            .attr('d', 'M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4')
            .attr('stroke', "blue")
            .attr('stroke-width', 1);




//        ctx.summaryStatisticVis[0].attribute = attributes.filter(function(d){
//            return d.type=="integer" || d.type=="float"
//        })[0].name
//        ctx.summaryStatisticVis[0].visObject = new StatisticGraphs();

//        updateStatistics();

        dataSetChanged();

        updateSetsLabels(ctx.tableHeaderNode);

        updateHeaders();

        plotSubSets();

        initCallback = [dataSetChanged] //TODO: bad hack !!!

        updateFrames($(window).height(), null);

        updateFrames(null,$(".ui-layout-center").width());

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


    function dataSetChanged(){
//        ctx.summaryStatisticVis[0].attribute = attributes.filter(function(d){
//            return d.type=="integer" || d.type=="float"
//        })[0].name

        ctx.summaryStatisticVis=[];
        attributes.filter(function(d){
            return (d.type=="integer" || d.type=="float") && (d.name!="Set Count")
        }).forEach(function(attribute,i){

                ctx.summaryStatisticVis.push({
                    attribute: attribute.name,
                    visObject:new StatisticGraphs()
                })
//                ctx.summaryStatisticVis[i].attribute = name;
            })




        updateStatistics()
        setDynamicVisVariables()

        ctx.svgBody.attr({
            width: (Math.max(ctx.w, 400))
        })

        updateHeaders();
        plotSubSets();

    }

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

        var setRects = setRows.selectAll(".sortBySet.connection.vertical").data(function (d, i) {
            return [d]
        })
        setRects.enter().append("rect").attr({
            class: "sortBySet connection vertical"
        })
        .on('mouseover', mouseoverColumn)
        .on('mouseout', mouseoutColumn)

        setRects.exit().remove();

        setRects.attr({
            transform: function (d, i) {
                return 'skewX(45) translate(' + (- ctx.leftOffset) + ', 0)';
            },
            width: ctx.cellWidth,
            height: ctx.textHeight - 2
        })

        var setRowsText = setRows.selectAll("text").data(function (d) {
            return [d]
        })
        setRowsText.enter().append("text").text(
            function (d) {

              var str = d.elementName.substring(0, ctx.truncateAfter);
              if(str.length<d.elementName.length)
                str = str.trim() + "...";

              return str;
            }).attr({
                class: 'setLabel sortBySet',
                //  "pointer-events": "none",
                id: function (d) {
                    return d.elementName.substring(0, ctx.truncateAfter);
                },
                transform: function (d, i) {
                    return 'translate(0,' + (ctx.textHeight - ctx.textSpacing - 2) + ')rotate(45)';
                },
                'text-anchor': 'end'
            })
            .style({
                'cursor':'s-resize'
            })
            .on('mouseover', mouseoverColumn)
            .on('mouseout', mouseoutColumn)
            .append("svg:title")
            .text(function (d, i) {
                return d.elementName;
            })

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


        d3.selectAll('.sortBySet, .setRow .setLabel').on(
            'click',
            function (d) {
                UpSetState.sorting = StateOpt.sortBySetItem;
                UpSetState.grouping = undefined;
                UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;
                updateState(d);
                rowTransition();
            }).style({
                'cursor':'s-resize'
            });


    }


    function updateStatistics(){
        ctx.summaryStatisticVis.forEach(function(sumStat,i){
            sumStat.visObject.updateStatistics(renderRows, "id", "data.items", attributes,"name","values", sumStat.attribute)
        });
//        ctx.summaryStatisticVis[0].visObject.updateStatistics(subSets, "id", "items", attributes,"name","values", ctx.summaryStatisticVis[0].attribute)
    }



    function addStatisticColumn(){
        var allAttributes = attributes.filter(function(d){
            return d.type=="integer" || d.type=="float"
        })

        allAttributes.unshift(ctx.nameForRelevance);
        // find first not-used


        var delList = allAttributes.map(function(d){return d})

        ctx.summaryStatisticVis.forEach(function(stat){
            delList.remove(stat.attribute);
        })

        //console.log(delList);


    }


    function updateHeaders() {
        setDynamicVisVariables()
        calculateGlobalStatistics();


        // -- Create Table Header:
        var tableHeaderGroup = ctx.tableHeaderNode.selectAll(".tableHeaderGroup").data([1]);
        var tableHeaderGroupEnter = tableHeaderGroup.enter().append("g").attr({class: "tableHeaderGroup"});



        //------------ subSet value header -----------------------

        tableHeaderGroupEnter.append('g').attr()
            .attr({
                id: "subSetSizeAxis",
                class: 'axis',
                "transform":"translate("+0+","+20+")"
            }).each(function () {
                ctx.brushableScaleSubsetUpdate = function () {

                };
                ctx.brushableScaleSubset = new BrushableScale(
                    ctx,
                    d3.select(this),
                    ctx.subSetSizeWidth,
                    "brushableScaleSubsetUpdate", "plotTable", "subSetSizeScale", {columnLabel:"Cardinality",
                        actionsTrioggeredByLabelClick:[function(){
                            UpSetState.sorting = StateOpt.sortBySubSetSize;
                            UpSetState.grouping = undefined;
                            UpSetState.levelTwoGrouping = undefined;
                            UpSetState.forceUpdate = true;
                            $('#noGrouping').prop('checked', true);
                            $('#sortRelevanceMeasure').prop('checked', true);
                            toggleGroupingL2(true);
                            updateState();
                            rowTransition();
                        }]})
            });

        // *** update Part

//        tableHeaderGroup.selectAll("#subSetSizeLabelRect").attr({
//            transform: 'translate(' + ctx.xStartSetSizes + ',' + (ctx.labelTopPadding) + ')',
//            height: '20',
//            width: ctx.subSetSizeWidth
//        });
//
//        tableHeaderGroup.selectAll("#subSetSizeLabelText").attr({
//            transform: 'translate(' + (ctx.xStartSetSizes + ctx.subSetSizeWidth / 2) + ','
//                + (ctx.labelTopPadding + 10) + ')'
//        });

        var maxValue = d3.max(ctx.globalStatistics, function (d) {
            return d.value
        });

        tableHeaderGroup.selectAll("#subSetSizeAxis").transition().attr({
            transform: 'translate(' + ctx.xStartSetSizes + ',' + (ctx.textHeight - 70) + ')' // TODO magic number
        }).call(ctx.brushableScaleSubsetUpdate,
            {
                maxValue: maxValue,
                labels: ctx.globalStatistics

            })


        // ------------ expected value header -----------------------

        // *** init Part
        tableHeaderGroupEnter.append('rect')
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

        tableHeaderGroupEnter.append('text').text('Deviation')
            .attr({
                id: "expectedValueLabelText",
                class: 'columnLabel sortRelevanceMeasureGlobal',
                "pointer-events": "none"
            });

        tableHeaderGroupEnter.append('g').attr()
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

//        var formatPercent = d3.format(".0 ");
        var formatPercent = d3.format("%");

        var expectedValueAxis = d3.svg.axis().scale(ctx.expectedValueScale).orient('top').ticks(4).tickFormat(formatPercent);

        tableHeaderGroup.select("#expectedValueAxis").transition().attr({
            transform: 'translate(' + ctx.xStartExpectedValues + ',' + (ctx.textHeight - 5) + ')'
        }).call(expectedValueAxis);



        // some statistics
        var sumStatFO = tableHeaderGroup.selectAll(".summaryStatisticsFO").data(ctx.summaryStatisticVis, function(d,i){return d.attribute+i})

        sumStatFO.exit().remove();
        var sumStatFOHTML = sumStatFO.enter().
            append("foreignObject").attr({
                class:"summaryStatisticsFO",
                width:120,
                height:30,
                x:function(d,i){return ctx.xStartStatisticColumns+i*(ctx.summaryStatisticsWidth+ctx.majorPadding)},
                y:ctx.labelTopPadding-5

            }).append("xhtml:body")//.attr("xmlns","http://www.w3.org/1999/xhtml")

        sumStatFO.attr({
            x:function(d,i){return ctx.xStartStatisticColumns+i*(ctx.summaryStatisticsWidth+ctx.majorPadding)}
        })



//        sumStatFO.append("h1").text("Hal2")
//        sumStatFO.html("<h1>HALLO</h1>")
//
        sumStatFOHTML.append("select").attr({
//            id:"sumStatAttributeSelector"
                class:"columnLabel"
        }).style({
                width:ctx.summaryStatisticsWidth+"px",
                "background":"transparent",
                border: "1px solid #ccc",
                "-webkit-appearance": "none",
                "padding":"5px"

            })
        .on({
            "change":function(d,i){

                d.attribute = d3.event.target.value;
                updateStatistics();
                updateHeaders();
                plotSubSets();

            }
        })


        var attSel = sumStatFO.selectAll("select")
          .selectAll("option").data(attributes.filter(function(d){return d.type=="integer" || d.type=="float"}))




        attSel.exit().remove();
        attSel.enter().append("option")
        attSel.attr({
            "value":function(d,i){
                return d.name
            },
            "selected":function(d,i){
                return (d.name == d3.select(this.parentNode).datum().attribute)?"selected":null;
            }
        }).text(function(d){return d.name})


        var sumStatAxis = tableHeaderGroup.selectAll(".summaryStatisticsAxis").data(ctx.summaryStatisticVis,function(d,i){return d.attribute+i})
        sumStatAxis.exit().remove();
        sumStatAxis.enter().append("g").attr({
            class:"summaryStatisticsAxis"
        })
        sumStatAxis.attr({
            "transform":function(d,i){return "translate("+(ctx.xStartStatisticColumns+(i*(ctx.summaryStatisticsWidth+ctx.majorPadding)))+","+(ctx.textHeight-5)+")"}
        }).each(function(d,i){
                d.visObject.renderAxis(d3.select(this),0,0,ctx.summaryStatisticsWidth);
            })


//        ctx.summaryStatisticVis.forEach(function(sumStat,i){
//            sumStat.visObject.renderAxis(tableHeaderGroup,ctx.xStartStatisticColumns+(i*100),ctx.textHeight-5,95);
//
//        })

        updateSetsLabels(ctx.tableHeaderNode)

    }

    function updateSubSetGroups() {

      // ------------------- the rows -----------------------
      var subSets = ctx.gRows.selectAll('.row')
          .data(renderRows, function (d, i) {
              return d.id;
          });

//        console.log("rr:",renderRows);
//        console.log("rr2:",ctx.rowScale.domain());

      var rowSubSets = subSets
          .enter()
          .append('g')
          .attr({transform: function (d) {

              if (d.data.type === ROW_TYPE.SUBSET || d.data.type === ROW_TYPE.GROUP) {
                  return 'translate(0, ' + ctx.rowScale(d.id) + ')';
              }else {
                  var offset_y = ctx.textHeight;
                  if (d.data.level == 2)
                      offset_y += 10
                  return 'translate(0, ' + offset_y + ')';
              }
          }, class: function (d) {
              return 'row ' + d.data.type;
          }
          }).style("opacity", function (d) {
              if (d.data.type === ROW_TYPE.SUBSET || d.data.type === ROW_TYPE.GROUP)
                  return ctx.gRows.selectAll('.row')[0].length == 0 ? 1 : 0;
              else
                  return ctx.gRows.selectAll('.row')[0].length ? 0 : 1;
          })

      // Anticipating future overlays
      rowSubSets.append("g").attr("class", "gBackgroundRect")
      rowSubSets.append("g").attr("class", "gHorizon")
      rowSubSets.append("g").attr("class", "gOverlays")
      rowSubSets.append("g").attr("class", "gIndicators")

      subSets.exit().remove();

      var subSetTransition = subSets
      if (ctx.rowTransitions && usedSets.length<10)
          subSetTransition = subSets
              .transition().duration(function (d, i) {
                  if (d.data.type === ROW_TYPE.SUBSET)
                      return queryParameters['duration'];
                  else
                      return queryParameters['duration'];
              })
      subSetTransition.attr({transform: function (d) {
        return 'translate(0, ' + ctx.rowScale(d.id) + ')';

      }, class: function (d) {
          return 'row ' + d.data.type;
      }}).transition().duration(100).style("opacity", 1);

      return subSets;
    }

    function updateSubsetRows(subsetRows, setScale) {

        var backgrounds = subsetRows.select(".gBackgroundRect").selectAll(".backgroundRect").data(function (d) {
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

        var combinationGroups = subsetRows.selectAll('g.combination').data(function (d) {
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

            var i = 0, is_overflowing = false;
            var nbLevels = Math.min(ctx.maxLevels, Math.ceil(e.data.setSize / max_scale));

            var data = d3.range(nbLevels).map(function () {

                var f = {};
                f.data = {};
                f.data.type = e.data.type;

               // Prevent empty bar when right on 1-level value
                if(nbLevels==1 && e.data.setSize > 0 && (e.data.setSize % max_scale == 0)) {
                  f.data.setSize = e.data.setSize;
                  return f;
                }

                if (i == nbLevels - 1 && Math.ceil(e.data.setSize / max_scale) < nbLevels + 1)
                    f.data.setSize = (e.data.setSize % max_scale);
                else
                    f.data.setSize = max_scale;
                i++;
                return f;
            })

            g.selectAll(".cutlines").remove();

            if (Math.ceil(e.data.setSize / max_scale) > ctx.maxLevels) {
                var g_lines = g.selectAll(".cutlines").data([e.id]).enter().append("g").attr("class", "cutlines")

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + ctx.subSetSizeWidth-15, x2: ctx.xStartSetSizes + ctx.subSetSizeWidth-5, y1: 0, y2: 20})
                    .style({'stroke': 'white', 'stroke-width': 1})

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + ctx.subSetSizeWidth-20, x2: ctx.xStartSetSizes + ctx.subSetSizeWidth-10, y1: 0, y2: 20})
                    .style({'stroke': 'white', 'stroke-width': 1})
            }

            // Add new layers
            var layers_enter = g.selectAll(".gHorizon").selectAll(".row-type-subset").data(data).enter()

            layers_enter.append('rect')
                .attr("class", function (d) {
                    return ( 'subSetSize row-type-subset' );

                })

            // Remove useless layers
            g.selectAll(".row-type-subset").data(data).exit().remove()

            // Update current layers
            g.selectAll(".row-type-subset")
                .attr({
                    transform: function (d, i) {
                        var y = 0;
                        if (d.data.type !== ROW_TYPE.SUBSET)
                            y = 0;//cellSize / 3 * .4;
                        return   'translate(' + (ctx.xStartSetSizes) + ', ' + (y + ctx.cellSizeShrink * i + 1) + ')'; // ' + (textHeight - 5) + ')'
                    },

                    width: function (d, i) {
                        return ctx.subSetSizeScale(d.data.setSize);
                    },
                    height: function (d, i) {
                        return ctx.cellSize - ctx.cellSizeShrink * 2 * i - 2;
                    }
                })
                .style({
                    fill:function(d,i){ return ctx.horizonBarGrays(i);}
                })
//                .style("opacity", function (d, i) {
//                    if (nbLevels == 1)
//                        return .8;
//                    else if (nbLevels == 2)
//                        return .8 + i * .2;
//                    else
//                        return .4 + i * .4;
//                })
                .on('click', function () {
                  //console.log("e", e, d3.select(this).node().parentNode.__data__)
                  ctx.intersectionClicked(e);
                })
                .on('mouseover', function () {
                    mouseoverRow(e);
                })
                .on('mouseout', function () {
                    mouseoutRow(e);
                })

        })



    }

    function updateGroupRows(groupRows) {
        var groupsRect = groupRows.select(".gBackgroundRect").selectAll(".groupBackGround").data(function (d) {
            return [d];
        });
        //**init
        groupsRect.enter().append('rect').attr({
            class: function (d) {
                if (d.data instanceof QueryGroup) {
                    return 'groupBackGround filterGroup';
                } else {
                    if (d.data.level>1) return 'groupBackGround secondLevel';
                    else return 'groupBackGround'
                }
            },
            rx:5,
            ry:10,
            width: ctx.setVisWidth + ctx.leftOffset,
            height: ctx.cellSize,
            x: -ctx.leftOffset,
            y: 0
        })
//            .on('click', function (d) {
//                collapseGroup(d.data);
//                updateStatistics();
//
//                rowTransition(false);
//            });

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
            else {
                var truncateLength = 0;
              if (d.data.type === ROW_TYPE.GROUP && typeof(d.data.combinedSets) != "undefined") {
                truncateLength = 10;
              } else {
                truncateLength = ctx.truncateGroupAfter;
              }
              var str = d.data.elementName.substring(0, truncateLength);
              if(str.length<d.data.elementName.length)
                str = str.trim() + "...";
              return str;
            }
        }).attr({
                class: function () {
                    if (ctx.cellDistance < 14) return 'groupLabel groupLabelText small'; else return 'groupLabel groupLabelText'
                },
                y: ctx.cellSize - 3,
                x: function (d) {
                    return (-ctx.leftOffset + 15) + (d.data.level - 1) * ctx.leftIndent;
                }

            })
        .on('click', function (d) {
                collapseGroup(d.data);
                updateStatistics();
                rowTransition(false);
            })
        .append("svg:title")
            .text(function (d, i) {
                return d.data.elementName;
            })

        var collapseIcon = groupRows.selectAll(".collapseIcon").data(function (d) {
            return [d];
        })
        collapseIcon.enter()
            .append("text")
            .attr({
                class: "collapseIcon"
            }).on('click', function (d) {
                collapseGroup(d.data);
                updateStatistics();
                rowTransition(false);
            });

        collapseIcon
            .text(function (d) {
                if (d.data.isCollapsed == 0) return "\uf0dd";//return "\uf147";
                else return "\uf0da";//return "\uf196"
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
            .text("\uf057") // uf057 uf05e
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


        // --- circles for Groups with combinedSets element set --- ///

        function decorateGroupsWithCells(){
            var nonLogicGroups =  groupRows.filter(function (d) {
                return  ("combinedSets" in d.data); //!(d.data instanceof QueryGroup) &&
            })
            var combinationGroups = nonLogicGroups.selectAll('g.combination').data(function (d) {
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
                    r: ctx.cellSize / 2 - 3,
                    cy: ctx.cellSize / 2,
                    class: 'cell'
                })
                .style('fill', function (d) {
                    switch(d.value)
                    {case 0: //logicState.NOT
                        return ctx.grays[0]
                        break;
                        case 1: //logicState.MUST
                            return ctx.grays[1]
                            break;
                        default: // logicState.DONTCARE
                            return "url(#DontCarePattern)"}
                }
            )
                .style({
                    "stroke":function(d){if (d.value ==0) return ctx.grays[1]; else return "none"}//ctx.grays[1]
                })



        }

        decorateGroupsWithCells();


        function decorateComplexQueries() {
            var complexLogicGroups =  groupRows.filter(function (d) {
                return  ("orClauses" in d.data && d.data.orClauses.length>1); //!(d.data instanceof QueryGroup) &&
            })
            var combinationGroups = complexLogicGroups.selectAll('g.complexCombination').data(function (d) {
                    // binding in an array of size one
                    return [d.data.orClauses];
                }
            )
            combinationGroups.enter()
                .append('g')
                .attr({class: 'complexCombination'
                })
            combinationGroups.exit().remove();


            combinationGroups.selectAll("text").data(function(d){return [d]}).enter().append("text")
                .attr({
                    class: function () {
                        if (ctx.cellDistance < 14) return 'groupLabel small'; else return 'groupLabel'
                    },
                    x:(usedSets.length*ctx.cellWidth *.5),
                    y: ctx.cellWidth-3
                })
                .style({
                    cursor:"pointer",
                    "text-anchor":"middle"
                })
                .text(function(d){return "combination";})
                .on({
                    "mouseover":function(d){
                        var xy = d3.select(this.parentNode.parentNode).attr("transform").split(/[,()]/);
                   //     console.log(d3.select(this.parentNode.parentNode).attr("transform"),d);
//                        console.log(xy.split(/[,()]/));
                        if (xy.length==4){
                            var infoGroup = ctx.toolTipLayer.append("g").attr({
                                class:"toolTipQuery",
                                "transform":"translate("+
                                    (+xy[1]+ctx.leftOffset-5)+","+
                                    (+xy[2]-ctx.textHeight+ctx.cellSize+5)+")"})
                            infoGroup.style({
                                "opacity":.00001
                            }).transition().style({
                                "opacity":1
                            });

//                            b.append("circle").attr({
//                                cx:5,
//                                cy:5,
//                                r:3
//                            })

//                            console.log(b);

//                            var infoGroup = ctx.toolTipLayer.select("#toolTipQuery");
                            infoGroup.append("rect").attr({
//                                class:"groupBackGround",
                                width:(usedSets.length*ctx.cellWidth+10),
                                height: d.length*ctx.cellSize+10,
                                rx:10,
                                ry:10
                            }).style({
                                    "stroke-width":2,
                                    "stroke":ctx.grays[1],
                                    "fill":ctx.grays[0]
                                })



                       //     console.log(infoGroup);

                            d.forEach(function(row,index){
                                var y = index*ctx.cellSize;

                                var actualRow = infoGroup.append("g").attr({
                                    class:"combination",
                                    "transform":"translate("+0+","+y+")"
                                })

                                actualRow.selectAll('.cell').data(function (d) { return Object.keys(row).map(function(key){return row[key];})})
                                .enter()
                                    .append('circle')
                                    .attr('cx', function (d, i) {
                                        return (ctx.cellWidth) * i + ctx.cellWidth / 2+5;
                                    })
                                    .attr({
                                        r: ctx.cellSize / 2 - 3,
                                        cy: ctx.cellSize / 2+5,
                                        class: 'cell'
                                    })
                                    .style('fill', function (d) {

                                        switch(d.state)
                                        {case 0: //logicState.NOT
                                            return ctx.grays[0]
                                            break;
                                            case 1: //logicState.MUST
                                                return ctx.grays[1]
                                                break;
                                            default: // logicState.DONTCARE
                                                return "url(#DontCarePattern)"}
                                    }
                                )
                                    .style({
                                        "stroke":function(d){if (d.value ==0) return ctx.grays[1]; else return "none"}//ctx.grays[1]
                                    })


                            })



                        }


                    },
                    "mouseout":function(){
                        ctx.toolTipLayer.selectAll(".toolTipQuery").transition().attr({opacity:.0001}).remove();
                    }

                })
            ;

//            var cells = combinationGroups.selectAll('.cell').data(function (d) {
//
//                return d.map(function (dd, i) {
//                    return {data: usedSets[i], value: dd}
//                });
//            })
//            // ** init
//            cells.enter()
//                .append('circle')
//                .on({
//                    'mouseover': function (d, i) {
//                        mouseoverCell(d3.select(this).node().parentNode.parentNode.__data__, i)
//                    },
//                    'mouseout': mouseoutCell
//                })
//            cells.exit().remove()
//
//            //** update
//            cells.attr('cx', function (d, i) {
//                return (ctx.cellWidth) * i + ctx.cellWidth / 2;
//            })
//                .attr({
//                    r: ctx.cellSize / 2 - 3,
//                    cy: ctx.cellSize / 2,
//                    class: 'cell'
//                })
//                .style('fill', function (d) {
//                    switch(d.value)
//                    {case 0: //logicState.NOT
//                        return ctx.grays[0]
//                        break;
//                        case 1: //logicState.MUST
//                            return ctx.grays[1]
//                            break;
//                        default: // logicState.DONTCARE
//                            return "url(#DontCarePattern)"}
//                }
//            )
//                .style({
//                    "stroke":function(d){if (d.value ==0) return ctx.grays[1]; else return "none"}//ctx.grays[1]
//                })

        }

        decorateComplexQueries();



//        var circles = tableRows.selectAll("circle").data(function(d){return d.selectors})
//        circles.enter()
//            .append("circle").attr({
//                class:"logicPanelCircle",
//                cx:function(d,i){return (i+.5)*cellWidth}, // TODO: add 90 as params!!
//                cy: .5*cellSize,
////                if (animated) return 0.5*cellSize;
////                else return (i+1.5)*cellSize +5},
//                r: cellSize/2-2
//            })
//
//        circles.style({
//            fill:function(d){
//                switch(d.state)
//                {
//                    case logicState.NOT:
//                        return grays[0]
//                        break;
//                    case logicState.MUST:
//                        return grays[1]
//                        break;
//                    default: // logicState.DONTCARE
//                        return "url(#DontCarePattern)"
//                }},
//            stroke:function(d){
//                if (d.isSelected()) return logicColor;
//                else return null;
//            }
//
//        })




        // --- Horizon Bars for size.

        groupRows.each(function (e, j) {

            var g = d3.select(this);
            var max_scale = ctx.subSetSizeScale.domain()[1];

            var i = 0, is_overflowing = false;
            var nbLevels = Math.min(ctx.maxLevels, Math.ceil(e.data.setSize / max_scale));

            var data = d3.range(nbLevels).map(function () {

                var f = {};
                f.data = {};
                f.data.type = e.data.type;

                // Prevent empty bar when right on 1-level value
                if(nbLevels==1 && e.data.setSize > 0 && (e.data.setSize % max_scale == 0)) {
                  f.data.setSize = e.data.setSize;
                  return f;
                }

                if (i == nbLevels - 1 && Math.ceil(e.data.setSize / max_scale) < nbLevels + 1)
                    f.data.setSize = (e.data.setSize % max_scale);
                else
                    f.data.setSize = max_scale;
                i++;
                return f;
            })

            g.selectAll(".cutlines").remove();

            if (Math.ceil(e.data.setSize / max_scale) > ctx.maxLevels) {
                var g_lines = g.selectAll(".cutlines").data([e.id]).enter().append("g").attr("class", "cutlines")

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + ctx.subSetSizeWidth-15, x2: ctx.xStartSetSizes + ctx.subSetSizeWidth-5, y1: 0, y2: 20})
                    .style({'stroke': 'white', 'stroke-width': 1})

                g_lines.append("line")
                    .attr({x1: ctx.xStartSetSizes + ctx.subSetSizeWidth-20, x2: ctx.xStartSetSizes + ctx.subSetSizeWidth-10, y1: 0, y2: 20})
                    .style({'stroke': 'white', 'stroke-width': 1})
            }

            // Add new layers
            var layers_enter = g.select(".gHorizon").selectAll(".row-type-group").data(data).enter()

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

                        return   'translate(' + (ctx.xStartSetSizes) + ', ' + (ctx.cellSizeShrink * i+2) + ')'; // ' + (textHeight - 5) + ')'

                    },

                    width: function (d, i) {
                        return ctx.subSetSizeScale(d.data.setSize);
                    },
                    height: function (d, i) {

                        return ctx.cellSize-4 - ctx.cellSizeShrink * 2 * i;

                    }
                })       .style({
                    fill:function(d,i){ return ctx.horizonBarGrays(i);}
                })
//                .style("opacity",function (d, i) {
//                    if (nbLevels == 1)
//                        return 1;
//                    else if (nbLevels == 2)
//                        return .8 + i * .2;
//                    else
//                        return .4 + i * .4;
//                })
            .on('click', function (d) {
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
                    var y = 2;
                    if (d.data.type === ROW_TYPE.SUBSET)
                        y = 1;//cellSize / 3 * 1.7;
                    return 'translate(' + start + ', ' + y + ')';
                },
                width: 1,
                height: function (d) {
                    if (d.data.type === ROW_TYPE.SUBSET)
                        return ctx.cellSize - 2;
                    else
                        return ctx.cellSize-4;// / 3;
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
                    var y = 2;
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
                        return ctx.cellSize-4;// / 3;
                }
            })
        }
    }

    function updateAttributeStatistic(allRows){
        allRows.each(function(row,j){
            if (row.data.type == ROW_TYPE.SEPARATOR) return;

            var rowElement = d3.select(this);

            var detailStatisticElements = rowElement.selectAll(".detailStatistic").data(ctx.summaryStatisticVis,function(d,i){return d.attribute+i});
            detailStatisticElements.exit().remove();
            detailStatisticElements.enter().append("g").attr({
                class:function(d){return "detailStatistic"}
            })



            detailStatisticElements.each(function(d,i){

                d.visObject.renderBoxPlot(row.id,d3.select(this),ctx.xStartStatisticColumns+i*(ctx.summaryStatisticsWidth+ctx.majorPadding),2,null,ctx.cellSize-4,"detail"+i); //  function(id, g, x,y,w,h)

            })

        })




    }


    function updateOverlays(allRows) {
        if (selections.getSize() == 0) {
            allRows.selectAll(".what").remove();
            allRows.selectAll(".newOverlay").remove();
            allRows.selectAll('.selectionIndicators').remove();
            return;
        }

        var currentRowSize = 0

        allRows.each(function (e, j) {

            var g = d3.select(this);
            var max_scale = ctx.subSetSizeScale.domain()[1];


          if(e.data.type==ROW_TYPE.GROUP) {

            e.data.selections = {};
            e.data.selections.setSize = e.data.setSize;
            currentRowSize = e.data.setSize;

            e.data.subSets.map(function(s, k) {

              if(typeof(e.data.selections) == "undefined")
                e.data.selections = {};

                for (var p in s.selections) {
                  if(typeof(e.data.selections[p]) == "undefined")
                    e.data.selections[p] = [];

                  e.data.selections[p] = e.data.selections[p].concat(s.selections[p]);

              }
            });

          }
            // FIND UUID
             var usedID = false;
            //   var alternativeID;
            var sIDs = Object.getOwnPropertyNames(e.data.selections);
            var s = e.data.selections;
            sIDs.forEach(function (prop) {
                var length = s[prop].length;
                if (selections.isActiveByUuid(prop)) {
                    usedID = prop;
                }
            });
            if (!usedID) {
                return 0;
            }

            currentRowSize =  s[usedID].length;
            if(e.data.type==ROW_TYPE.GROUP)
              e.data.selections.setSize =currentRowSize;


            var i = 0, is_overflowing = false;
            var nbLevels = Math.min(ctx.maxLevels, Math.ceil(currentRowSize / max_scale));
            var data = d3.range(nbLevels).map(function () {

                var f = {};
                f.data = {};
                f.data.setSize = currentRowSize
                f.data.type = e.data.type;
               // Prevent empty bar when right on 1-level value
                if(nbLevels==1 && currentRowSize > 0 && (currentRowSize % max_scale == 0)) {
                  f.data.setSize = currentRowSize;
                  return f;
                }

                if (i == nbLevels - 1 && Math.ceil(currentRowSize / max_scale) < nbLevels + 1)
                    f.data.setSize = (currentRowSize % max_scale);
                else
                    f.data.setSize = max_scale;
                i++;


                return f;
            })

            // Add new layers
            var layers_enter = g.selectAll(".gOverlays").selectAll(".newOverlay").data(data).enter()

            layers_enter.append('rect')
                .attr("class", "newOverlay")

            // Remove useless layers
            g.selectAll(".newOverlay").data(data).exit().remove()

            // Update current layers
            g.selectAll(".newOverlay")
                .attr({
                    transform: function (d, i) {
                     //   var y = 0;
                     //   if (d.data.type !== ROW_TYPE.SUBSET)
                     //       y = 0;//cellSize / 3 * .4;
                        return   'translate(' + (ctx.xStartSetSizes) + ', ' + (ctx.cellSizeShrink * i + 1) + ')'; // ' + (textHeight - 5) + ')'
                    },

                    width: function (d, i) {

                     return ctx.subSetSizeScale(d.data.setSize);

                  },
                    height: function (d, i) {
                        return ctx.cellSize - ctx.cellSizeShrink * 2 * i - 2;
                    },
                   fill: function(d) {
                     var usedID = false;
                    //   var alternativeID;
                    var sIDs = Object.getOwnPropertyNames(e.data.selections);
                    var s = e.data.selections;
                    sIDs.forEach(function (prop) {
                        var length = s[prop].length;
                        if (selections.isActiveByUuid(prop)) {
                            usedID = prop;
                        }
                    });
                    if (!usedID) {
                        return 0;
                    }

                    return selections.getColorFromUuid(usedID)//"url(#diagonalHatch_0)"
                   }

                })
                .style("opacity", function (d, i) {

                    if (nbLevels == 1)
                        return .5;
                    else if (nbLevels == 2)
                        return .5 + i * .2;
                    else
                        return .2 + i * .3;
                })
                .on('click', function () {
                  ctx.intersectionClicked(e);
                })
                .on('mouseover', function () {
                    mouseoverRow(e);
                })
                .on('mouseout', function () {
                    mouseoutRow(e);
                })

        })


/*
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
                   // d3.select(this).style("fill", selections.getColorFromUuid(usedID));
                    return   ctx.subSetSizeScale(s[usedID].length);
                },
                height: function (d) {
                    return ctx.cellSize - 2// / 3;

                }
            })
*/
        // the triangles for the multiple selections

        //allRows.data(["indicators"]).enter().append("g").attr("class", "gIndicators")


        var selectIndicators = allRows.select('.gIndicators').selectAll('.selectionIndicators').data(function (d, i) {
            if (!d.data.selections)
                return [];
            var selectionIDs = Object.getOwnPropertyNames(d.data.selections);
            var selArray = selectionIDs.map(function (k) {
                return {uuid: k, items: d.data.selections[k]};
            });
            selArray = selArray.filter(function (d) {
                return d.items.length !== 0 && d.uuid != "undefined" && d.uuid != "setSize"; // prevents useless black indicators.. + Bug
            })
            var max_scale = ctx.subSetSizeScale.domain()[1];
            return selArray;
        })
        selectIndicators.enter()
            .append('path').attr({
                class: 'selectionIndicators'
            }).on('click', function (d) {
                selections.setActiveByUuid(d.uuid);
                updateOverlays(allRows);
            }).on('mouseenter', function() {
              d3.select(this).attr("transform", function (d, i) {
                //UPDATE
                return 'translate(' + d3.transform(d3.select(this).attr("transform")).translate + ') scale(1.5) rotate('+d3.transform(d3.select(this).attr("transform")).rotate+')';
              })
            }).on('mouseout', function() {
              //UPDATE
              d3.select(this).attr("transform", function (d, i) {
                return 'translate(' + d3.transform(d3.select(this).attr("transform")).translate + ') scale(1) rotate('+d3.transform(d3.select(this).attr("transform")).rotate+')';
            })})
        selectIndicators.exit().remove();
        selectIndicators.attr({
            transform: function (d, i) {

              var nbLevels = Math.floor(d.items.length / ctx.subSetSizeScale.domain()[1]);
              var subSetSize = d.items.length % ctx.subSetSizeScale.domain()[1];
              var rotate = 0;
              if(nbLevels>=ctx.maxLevels) {
                subSetSize = ctx.subSetSizeScale.domain()[1]
                nbLevels = ctx.maxLevels-1;
                rotate = -90;
              }
                return 'translate(' + (ctx.xStartSetSizes + ctx.subSetSizeScale(subSetSize)) + ' , ' + (nbLevels*ctx.cellSizeShrink) +
                    ') rotate(' + rotate + ')';
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
//            y: ctx.textHeight,
            height: ctx.tableBodyHeight,
            width: ctx.cellWidth
        })
    }

    function plotSubSets() {



//        console.log("plot");
        setDynamicVisVariables();
        ctx.svgBody.attr({
            height:ctx.rowScale.rangeExtent()[1]
        })

//        // to limit the foraignobject again
//        updateFrames($(window).height(), null);

        updateColumnBackgrounds();

        var separatorRow = null;
        // generate <g> elements for all rows
        var allRows = updateSubSetGroups().filter(function(r){
            if (r.data.type==ROW_TYPE.SEPARATOR){
                separatorRow= d3.select(this);
                return false;
            }else return true;
        })

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

        // ----------------------- all Rows -------------------
        updateAttributeStatistic(allRows);


//        var separatorColumns = renderRows.filter(function(d){return (d.data instanceof Separator)});
//        separatorColumns.append("")

        if (separatorRow!=null){
            var sepRowLine = separatorRow.selectAll(".gSeparatorLine").data([1])
            sepRowLine.enter().append("line").attr({
                    class:"gSeparatorLine"
                })

            sepRowLine.attr({
                x1:-ctx.leftOffset,
                x2:ctx.w,
                y1:ctx.cellSize/2,
                y2:ctx.cellSize/2
            })

        }



        // Adjust the row height
        d3.select(".divForeign").select("svg").attr("height", renderRows.length * ctx.cellDistance);
    }

    function bindEvents() {
        $(EventManager).bind("item-selection-added", function (event, data) {
            //console.log("Selection was added to selection list with color " + selections.getColor(data.selection) + ' and ' + data.selection.items.length + ' items.');

            data.selection.mapToSubsets(subSets);

            plotSelectionTabs("#selection-tabs", selections, data.selection);
            plotSelectedItems("#item-table", data.selection);
            elementViewers.renderViewer();
        });

        $(EventManager).bind("item-selection-updated", function (event, data) {
            //console.log('Selection was updated! New length is ' + data.selection.items.length + ' items.');

            data.selection.mapToSubsets(subSets);
            plot();
            plotSelectionTabs("#selection-tabs", selections, data.selection);
            plotSelectedItems("#item-table", data.selection);
            elementViewers.renderViewer();

            plotSetOverview();
        });

        $(EventManager).bind("item-selection-removed", function (event, data) {
            //console.log("Selection was removed from selection list.");
            data.selection.unmapFromSubsets(subSets);

            if ( selections.list.length === 0 ) {
                $( '#filters-list' ).html("");
                $( '#filters-controls' ).html("");
            }

            plot();
            plotSelectionTabs("#selection-tabs", selections, selections.getActive());
            plotSelectedItems("#item-table", selections.getActive());
            elementViewers.renderViewer();
            plotSetOverview();
        });

        $(EventManager).bind("item-selection-activated", function (event, data) {
            if (data.selection) {
                //console.log('Selection ' + data.selection.id + ' was activated.');

                plot();
                plotSelectionTabs("#selection-tabs", selections, data.selection);
                data.selection.filterCollection.renderFilters();
                plotSelectedItems("#item-table", data.selection);
                plotSetOverview();
            }
            else {
                plot();
                plotSelectionTabs("#selection-tabs", selections, data.selection);
                plotSelectedItems("#item-table", data.selection);
                plotSetOverview();
            }
            elementViewers.renderViewer();
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

//        $(EventManager).bind("ui-horizontal-resize", function (event, data) {
//            plot(Math.floor(data.newWidth * .66), undefined);
//            plotSetOverview();
//        });

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
            plotSetOverview()

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

    function updateL2Grouping(){

        if (UpSetState.grouping==undefined){
            d3.select("#secondLevelGroupingSelect").attr({disabled:true})
        }else{
            d3.select("#secondLevelGroupingSelect").attr({disabled:null})
            var selectableOptions = {};
            Object.keys(ctx.groupingOptions).forEach(function(key){
                if (key!=UpSetState.grouping) selectableOptions[key] = ctx.groupingOptions[key];
            })

         //   console.log("updateL2:",selectableOptions);

    //        UpSetState.grouping = StateOpt.groupByRelevanceMeasure;
    //        UpSetState.levelTwoGrouping = undefined;

            var l2GroupingSelect = d3.select("#secondLevelGrouping").selectAll("select").data([selectableOptions]);
            l2GroupingSelect.exit().remove();
            l2GroupingSelect.enter().append("select").attr({
                id: "secondLevelGroupingSelect",
                class:"groupingSelect"
            }).on({
                    "change": function () {
                        var value = this.options[this.selectedIndex].value;
                        ctx.groupingOptions[value].l2action();
                        updateCardinalitySpinners();
                        updateState();
                        updateStatistics();
                        rowTransition();
                    }
                });


            // has to be deleted to keep order in list :((
            d3.select("#secondLevelGroupingSelect").selectAll("option").remove();
            var l2GroupingOptions = d3.select("#secondLevelGroupingSelect").selectAll("option")
                .data(
                    function (d) { return Object.keys(d).map(function (key) { return {key: key, data: d[key]} }) },
                    function(d){ return d.key})
                .enter().append("option").attr({
                    value:function(d){return d.key;},
                    selected:function(d){return (d.key==UpSetState.levelTwoGrouping || (d.key=="dont" && UpSetState.levelTwoGrouping==undefined))?"selected":null}
                }).text(function(d){return d.data.name});

        }
    }

    function updateCardinalitySpinners(){
        //  <div id='firstLevelMinCardinality' hidden>min: <input id='firstLevelMinCardinalityInput' type='number' min='0' max='12' value='0'>
        d3.select("#firstLevelMinCardinality").attr({
            hidden:((UpSetState.grouping == StateOpt.groupByOverlapDegree)?null:"true")
        }).select("input").attr({
                value:UpSetState.levelOneDegree,
                min: 1,
                max: usedSets.length
            }).on({
                "change":function(d){
                    UpSetState.levelOneDegree = +(d3.select(this).node().value);
                    UpSetState.forceUpdate=true;
                    updateState();
                    updateStatistics();
                    rowTransition();
                }


            })



        //<div id='secondLevelMinCardinality' hidden>min: <input id='secondLevelMinCardinalityInput' type='number' min='0' max='12' value='0'>
        d3.select("#secondLevelMinCardinality").attr({
            hidden:((UpSetState.levelTwoGrouping== StateOpt.groupByOverlapDegree)?null:"true")
        }).select("input").attr({
                value:UpSetState.levelTwoDegree,
                min: 1,
                max: usedSets.length
            }).on({
                "change":function(d){
                    UpSetState.levelTwoDegree = +(d3.select(this).node().value);
                    UpSetState.forceUpdate=true;
                    updateState();
                    updateStatistics();
                    rowTransition();
                }


            })

    }


    function setUpSortSelections() {

        // groupingDefinitions
        ctx.groupingOptions[StateOpt.groupByIntersectionSize] = { name: "Degree", l1action:function(){},l2action:function(){} };
        ctx.groupingOptions[StateOpt.groupBySet]={ name: "Sets", l1action:function(){},l2action:function(){} };
        ctx.groupingOptions[StateOpt.groupByRelevanceMeasure] ={ name: "Deviation", l1action:function(){}, l2action:function(){} };
        ctx.groupingOptions[StateOpt.groupByOverlapDegree] = { name: "Overlaps", l1action:function(){}, l2action:function(){} };
        ctx.groupingOptions["dont"] ={ name: "Don't Aggregate", l1action:function(){}, l2action:function(){} };





       // ---- define L1 actions

       ctx.groupingOptions[StateOpt.groupByIntersectionSize]
           .l1action = function(){
               UpSetState.grouping = StateOpt.groupByIntersectionSize;
               UpSetState.levelTwoGrouping = undefined;
           }

       ctx.groupingOptions[StateOpt.groupBySet]
           .l1action= function () {
               UpSetState.grouping = StateOpt.groupBySet;
               UpSetState.levelTwoGrouping = undefined;
           };


        ctx.groupingOptions[StateOpt.groupByRelevanceMeasure]
            .l1action=function () {
                UpSetState.grouping = StateOpt.groupByRelevanceMeasure;
                UpSetState.levelTwoGrouping = undefined;
            };

        ctx.groupingOptions[StateOpt.groupByOverlapDegree]
            .l1action=function () {
                UpSetState.grouping = StateOpt.groupByOverlapDegree;
                UpSetState.levelTwoGrouping = undefined;
            };

        ctx.groupingOptions["dont"]
            .l1action=function () {
                UpSetState.grouping = undefined;
                UpSetState.levelTwoGrouping = undefined;
                UpSetState.forceUpdate = true;
            };


       // --- define L2 actions


        // ---------------- Grouping L2 -----------

        ctx.groupingOptions[StateOpt.groupByIntersectionSize]
            .l2action=function () {
                UpSetState.levelTwoGrouping = StateOpt.groupByIntersectionSize;
            };

        ctx.groupingOptions[StateOpt.groupBySet]
            .l2action=function () {
                UpSetState.levelTwoGrouping = StateOpt.groupBySet;
            };

        ctx.groupingOptions[StateOpt.groupByOverlapDegree]
            .l2action=function () {
                UpSetState.levelTwoGrouping = StateOpt.groupByOverlapDegree;
            };

        ctx.groupingOptions[StateOpt.groupByRelevanceMeasure]
            .l2action=function () {
                UpSetState.levelTwoGrouping = StateOpt.groupByRelevanceMeasure;
            };

        ctx.groupingOptions["dont"]
            .l2action=function () {
                UpSetState.levelTwoGrouping = undefined;
            };



        // ----------- grouping L1 -------------------------

        var l1GroupingSelect = d3.select("#firstLevelGrouping").selectAll("select").data([ctx.groupingOptions]);
        l1GroupingSelect.exit().remove(); // will not be called
        l1GroupingSelect.enter().append("select").attr({
            id: "firstLevelGroupingSelect",
            class:"groupingSelect"
        }).on({
                "change": function () {
                    var value = this.options[this.selectedIndex].value;
                    ctx.groupingOptions[value].l1action();
                    updateL2Grouping();
                    updateCardinalitySpinners();
                    updateState();
                    updateStatistics();
                    rowTransition();

                }
            });

        var l1GroupingOptions = l1GroupingSelect.selectAll("option")
            .data(function (d) {return Object.keys(d).map(function (key) { return {key: key, data: d[key]} }) });
        l1GroupingOptions.exit().remove();
        l1GroupingOptions.enter().append("option").attr({
            value:function(d){return d.key;}
        }).text(function(d){return d.data.name});

        // ----------- grouping L2 as update as it depends on L1 -------------------------
        updateL2Grouping();
        updateCardinalitySpinners();





        // ------- options ----

        d3.selectAll('#collapseAll').on(
            'click',
            function (d) {
                UpSetState.collapseAll = true;
                UpSetState.collapseChanged = true;
                updateState();
                updateStatistics();
                rowTransition();
            });

        d3.selectAll('#expandAll').on(
            'click',
            function (d) {
                UpSetState.expandAll = true;
                UpSetState.collapseChanged = true;
                updateState();
                updateStatistics();
                rowTransition();
            });

        // --------- sortings ------

        // sort based on occurrence of one specific data item
        //d3.selectAll('.sortBySet, .setLabel').on(
        //   'click',
        //    function (d) {
        //        UpSetState.sorting = StateOpt.sortBySetItem;
        //        UpSetState.grouping = undefined;
        //        UpSetState.levelTwoGrouping = undefined;
        //        updateState(d);
        //        rowTransition();
        //    });

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

    document.getElementById('rowSizeValue').addEventListener('change', function () {
        ctx.cellDistance = +(document.getElementById('rowSizeValue').value);
        rowTransition();
    });

//    document.getElementById('rowPaddingValue').addEventListener('input', function () {
//        ctx.cellDistance = +(document.getElementById('rowPaddingValue').value);
//        //console.log(ctx.cellSize);
//        rowTransition();
//    });

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

    ctx.resizeSetView = updateFrames
//    function(windowHeight, windowWidth){
//        updateFrames(windowHeight, windowWidth);
//        rowTransition(false);
//    }

    function updateFrames(windowHeight, windowWidth) {
        if (windowWidth == null) {
            d3.select(".matrixTableContainer")
                .style({
                    height: windowHeight+"px"
                })

//            d3.select('#bodyVis')
//                .style({
//                    height: (windowHeight-2*ctx.textHeight-40)+"px" // TODO: HACK
//                    height: (windowHeight-300)+"px" // TODO: HACK
//                })

//            ctx.svgBody.attr({
//                height: (windowHeight - 70)
//            })
            var tmc = d3.select(".matrixTableContainer")

            var visHeight = windowHeight - ctx.textHeight - 70;

//            ctx.foreignObject.attr({
//                height: visHeight
//            })
//
//            ctx.foreignDiv.style("height", +(visHeight - ctx.textHeight) + "px")
        } else if (windowHeight == null) {
            ctx.svgBody.attr({
                width: (Math.max(windowWidth, 400))
            })
            ctx.svgHeader.attr({
                width: (Math.max(windowWidth, 400))
            })



            var totalWidthMax = ctx.cellWidth * usedSets.length + ctx.majorPadding + ctx.leftOffset
                + ctx.subSetSizeWidthMax + ctx.expectedValueWidthMax + 50+ctx.summaryStatisticVis.length*(ctx.summaryStatisticsWidth+ctx.majorPadding);

            ctx.subSetSizeWidth = d3.scale.linear()
                .domain([totalWidthMax-(ctx.expectedValueWidthMax-100), totalWidthMax-(ctx.expectedValueWidthMax-100)-(ctx.subSetSizeWidthMax-100)]).range([ctx.subSetSizeWidthMax, 100]).clamp(true)(windowWidth);

            ctx.expectedValueWidth = d3.scale.linear()
                .domain([totalWidthMax, totalWidthMax-(ctx.expectedValueWidthMax-100)]).range([ctx.expectedValueWidthMax, 100]).clamp(true)(windowWidth);

            ctx["brushableScaleSubsetUpdate"](null, {
                width: ctx.subSetSizeWidth
            });
        }
    }

    setUpSortSelections()
    initData(ctx, [init], datasets);
//    init();

}
