/**
 * Created by hen on 3/12/14.
 */

function LogicPanel(params){

    var width = params.width;
    var vis = params.visElement;
    var panel = params.panelElement;
    var cellSize = params.cellSize;
    var usedSets = params.usedSets;
    var grays = params.grays;
    var belowVis = params.belowVis;
    var buttonX = params.buttonX;
    var buttonY = params.buttonY;


    // to be bound !!
//    var grays = ['#f0f0f0', '#636363'];
//    var groupingByList = [
//        {name:"by set size", groupFunction:function(){console.log("by set size");}},
//        {name:"by sets", groupFunction:function(){console.log("by size");}},
//        {name:"by weather", groupFunction:function(){console.log("by size");}}
//    ]


    var collapseHeight = cellSize+5;
    var uncollapseHeight = 90;
    var isCollapsed = true;
    var toggleState = {}
    var isNewPanel = true;
    var belowVisRestoreTranslate = "translate(0,0)"

    var logicExpression = {orClauses:[]}
    var actualOrClause = 1;
    var logicState ={
        NOT:0,
        DONTCARE:2,
        MUST:1


    }

    const logicColor = "#a1d99b";

    var addLogicButton = {}


    var init = function(){
        //### add button ##
        addLogicButton = vis.append("g").attr({
            class:"logicAddButton",
            "transform":"translate("+buttonX+","+buttonY+")"
        })

        addLogicButton.append("rect").attr({
            width:70,
            height:20
        }).style({fill: logicColor })
            .on("click", addLogic)

        addLogicButton.append("text").attr({
            class:"addButton",
            x:35,
            y:10
        }).style({ fill:"white" })
            .text("+ logic")
            .on("click", addLogic)


        defineDontCarePattern(panel,cellSize,grays);


    }


    var defineDontCarePattern = function(gQuery, cellSize, grays){
        var patternDef = gQuery.append("defs").append("pattern").attr({
            id:"HalfSelectPattern",
            patternUnits:"userSpaceOnUse",
            x:"0",
            y:"0",
            width:cellSize,
            height:cellSize
        })
        patternDef.append("rect").attr({
            x:cellSize/2,
            y:"0",
            width:cellSize/2,
            height:cellSize

        }).style({
                fill: grays[1]
            })
        patternDef.append("rect").attr({
            x:0,
            y:"0",
            width:cellSize/2,
            height:cellSize

        }).style({
                fill: grays[0]
            })

    }


    var addLogic = function(){

        addLogicButton.attr({
            "opacity":0
        })
        belowVisRestoreTranslate= belowVis.attr("transform");


        // define first orClause as dontcare ANDs
        logicExpression.orClauses[0] = {};
        usedSets.forEach(function(d){
//            logicExpression.orClauses[0].clauses.push({state:logicState.DONTCARE, subsetID: d.id});
            logicExpression.orClauses[0][d.id]={state:Math.floor(Math.random()*3)};
        })

        console.log(logicExpression);
        actualOrClause=0;
        isNewPanel= true;
        renderActualPanel();
    }

    var addOrClause = function(){

        var id = logicExpression.orClauses.length;
        logicExpression.orClauses[id] = {};
        usedSets.forEach(function(d){
//            logicExpression.orClauses[id][d.id]= {state:logicState.DONTCARE};
            logicExpression.orClauses[id][d.id]={state:Math.floor(Math.random()*3)};
        })
        actualOrClause= id;
        renderActualPanel();
    }


    var selectRow = function(index){
        if (index != actualOrClause){
            actualOrClause= index;
            renderActualPanel();
        }
    }

    var removeRow = function(index){
        logicExpression.orClauses.splice(index,1)
        actualOrClause=0;
        if (logicExpression.orClauses.length==0) destroyPanel();
        else renderActualPanel();
    }


    function changeState(orClause, id, state) {
         logicExpression.orClauses[actualOrClause][id] = {state:state};

        console.log("here");
         panel.selectAll(".logicPanelRow").filter(function(d,i){return (i==actualOrClause)})
             .each(function(d){
                 renderSelectorTable(this, true, false);
                })

    }

    function renderSelectorTable(node, isExpanded, animated) {

//        logicPanelSelectionTable
//        logicPanelSelectionHeader
//

        var nodeSelector = d3.select(node);
        var headerCircles = nodeSelector.select(".logicPanelSelectionHeader")
            .selectAll(".logicPanelHeaderCircle")
            .data(function(d){return Object.keys(d).map(function(dd){
                        return {subsetID:dd, state: d[dd].state}
                    })})
         headerCircles.enter().append("circle").attr({
                class:"logicPanelHeaderCircle",
                cx:function(d,i){return (i*cellSize)+cellSize/2+90}, // TODO: add 90 as params!!
                cy:function(d,i){return cellSize/2},
                r: cellSize/2-1
            })
         headerCircles.style({
//                stroke:grays[1],
                fill:function(d){
                    switch(d.state)
                    {
                        case logicState.NOT:
                            return grays[0]
                            break;
                        case logicState.MUST:
                            return grays[1]
                            break;
                        default: // logicState.DONTCARE
                            return "url(#HalfSelectPattern)"
                    }},
                stroke:function(){if (isExpanded) return logicColor; else return null;}
            })


    if (isExpanded){
        var g= nodeSelector.select(".logicPanelSelectionTable");
        var nodeData = g.node().__data__
        var clausesList = Object.keys(nodeData).map(function(d){
            return {subsetID:d, state:nodeData[d].state}
        })

//        console.log("clist:",clausesList);
        var matrix = clausesList.map(function(dd){
            return {

                selectors:Object.keys(logicState).map(function(d){
                    return{
                        state:logicState[d],
                        id:dd.subsetID,
                        isSelected:function(){return (logicState[d]==dd.state)}
                    }
                })

            }
        })



        var columns = g.selectAll(".logicTableColumn").data(matrix)

        columns.enter().append("g").attr({
            "class":"logicTableColumn"
        }).append("rect").attr({
                x:0,
                y:cellSize+1,
                width:cellSize,
                height:1

            })
        columns.exit().remove();
        columns.attr({
            "transform":function(d,i){return "translate("+((i*cellSize)+90)+","+0+")"}
//            ,opacity:0.0001

        })



        var circles = columns.selectAll("circle").data(function(d){return d.selectors})
        circles.enter()
            .append("circle").attr({
            class:"logicPanelCircle",
            cx:function(d,i){return cellSize/2}, // TODO: add 90 as params!!
            cy:function(d,i){
                if (animated) return 0.5*cellSize;
                else return (i+1.5)*cellSize +5},
            r: cellSize/2-2
        })

         circles.style({
                fill:function(d){
                    switch(d.state)
                    {
                        case logicState.NOT:
                            return grays[0]
                            break;
                        case logicState.MUST:
                            return grays[1]
                            break;
                        default: // logicState.DONTCARE
                            return "url(#HalfSelectPattern)"
                    }},
                stroke:function(d){
                    if (d.isSelected()) return logicColor;
                    else return null;
                }

         })  .on({
                 "click":function(d){changeState(actualOrClause, d.id, d.state)}
             })


           if (animated){
               circles.transition().delay(50).attr({
                   cy:function(d,i){return (i+1.5)*cellSize +5}
               })
           }


//          .style({
//                "stroke-width":2,
//                fill:"red"
//            })

//        columns.transition().delay(50).attr({
//            opacity:1
//        })


        }else{
            d3.select(node).select(".logicPanelSelectionTable").selectAll(".logicTableColumn").remove();

        }

    }

    function submitExpression() {
        console.log(logicExpression);
        destroyPanel();
    }

    var renderActualPanel= function(){

        // calculate y positions
        var yCummulate =0;
        var yOffsets = logicExpression.orClauses.map(function(d,i){
                var returnValue = yCummulate;
                yCummulate+=(i==actualOrClause)?uncollapseHeight:collapseHeight;
                return returnValue;
        })

        var logicPanelRows = panel.selectAll(".logicPanelRow").data(logicExpression.orClauses)

        // the newly appended row is allways uncollapsed !!
        var logicPanelRowEnter = logicPanelRows.enter().append("g").attr({
            class:"logicPanelRow",
            "transform":function(d,i){
                return "translate("+0+","+yOffsets[i]+")"
            }
        }).style("opacity",0.000001)

        // add row buttons
        logicPanelRowEnter.append("text").text("select")
            .attr("class","addButton logicPanelSelect")
            .style("text-anchor","start")
            .on("click", function(d,i){selectRow(i)});
        logicPanelRowEnter.append("text").text("del")
            .attr("class","addButton logicPanelRemove")
            .style("text-anchor","start")
            .on("click", function(d,i){removeRow(i)});
        logicPanelRowEnter.append("rect").attr({
            class:"logicPanelRect",
            width:width,
            height:function(d,i){
                return (i==actualOrClause)?uncollapseHeight:collapseHeight
            }
            }).style({
                fill:"none",
                stroke:"lightgray"
            })
        logicPanelRowEnter.append("g").attr("class","logicPanelSelectionTable")
        logicPanelRowEnter.append("g").attr("class","logicPanelSelectionHeader")


        logicPanelRows.exit().remove();

        logicPanelRows.transition().attr({
            "transform":function(d,i){
                return "translate("+0+","+(yOffsets[i])+")"
            }
        }).style("opacity",1);

        logicPanelRows.select(".logicPanelSelect").transition().attr({
            x:10,
            y: function(d,i){
                if (actualOrClause==i) return uncollapseHeight/2;
                else return collapseHeight/2;
            }
        })

        logicPanelRows.select(".logicPanelRemove").transition().attr({
            x:60,
            y: function(d,i){
                if (actualOrClause==i) return uncollapseHeight/2;
                else return collapseHeight/2;
            }
        })

        logicPanelRows.select(".logicPanelRect").transition().attr({
                height:function(d,i){
                    return (i==actualOrClause)?uncollapseHeight:collapseHeight}
        })


        logicPanelRows.each(function(d,i){
            renderSelectorTable(this, i==actualOrClause, true);
        })


        var endOfPanel = (logicExpression.orClauses.length-1)*collapseHeight+uncollapseHeight+10
        if (isNewPanel){
            var buttonGroup =  panel.append("g").attr({
                id:"logicPanelButtons"
            }).attr({
                    "transform":"translate("+0+","+endOfPanel+")"
                })

            buttonGroup.append("text").text("add").attr({
                id:"logicPanelAddText",
                class:"addButton",
                x:20
//                "transform":"translate("+0+","+endOfPanel+")"
            }).style({
//                    "text-anchor":"start"
                })
                .on({
                    "click":function(){addOrClause();}
                })

            buttonGroup.append("text").text("submit").attr({
                id:"logicPanelSubmitText",
                class:"addButton",
                x:100
//                "transform":"translate("+35+","+endOfPanel+")"
            }).style({
//                    "text-anchor":"start"
                })
                .on({
                    "click":function(){submitExpression();}
                })

            buttonGroup.append("text").text("cancel").attr({
                id:"logicPanelCancelText",
                class:"addButton",
                x:150
//                "transform":"translate("+70+","+endOfPanel+")"
            }).style({
//                    "text-anchor":"start"
                })
                .on({
                    "click":function(){destroyPanel();}
                })


            isNewPanel=false;
        }else{
            panel.select("#logicPanelButtons").transition().attr({
                "transform":"translate("+0+","+endOfPanel+")"
            })
        }






//
//        // add uncollapsed panel
//        panel.append("rect").attr({
//            class:"menuPlaceholder menuPlaceholderRect",
//            width:width,
//            height:uncollapseHeight
//        })
//            .style({
//                fill:"none",
//                stroke: grays[1]
//            })
//
        belowVis.transition().attr({
            "transform":"translate(0,"+(endOfPanel+15)+")"
        })






    }

    var destroyPanel = function(){
        panel.selectAll(".logicPanelRow").remove();
        panel.select("#logicPanelButtons").remove();
        belowVis.transition().attr({
            "transform":belowVisRestoreTranslate
        })
        addLogicButton.attr({
            "opacity":1
        })
        logicExpression = {orClauses:[]}
    }


    init();


}

