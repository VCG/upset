/**
 * Created by hen on 3/12/14.
 */

function LogicPanel(params){

    var width = params.width;          // width for the whole row
    var vis = params.visElement;       // the node for whole vis
    var panel = params.panelElement;    // panel element
    var cellSize = params.cellSize;     // cell size for a particular subset indicator (circle)
    var usedSets = params.usedSets;     // all used Sets
    var grays = params.grays;           // range of grays used for dot labeling
    var belowVis = params.belowVis;     // the vis node below the panel (to be translated)
    var buttonX = params.buttonX;       // button X coordinate
    var buttonY = params.buttonY;       // button Y coordinate
    var subsets = params.subsets;
    var cellWidth = params.cellWidth; // width of cells
    var ctx = params.ctx

    var stateObject= params.stateObject
    var callAfterSubmit = params.callAfterSubmit;


    // to be bound !!
//    var grays = ['#f0f0f0', '#636363'];
//    var groupingByList = [
//        {name:"by set size", groupFunction:function(){console.log("by set size");}},
//        {name:"by sets", groupFunction:function(){console.log("by size");}},
//        {name:"by weather", groupFunction:function(){console.log("by size");}}
//    ]



    var setNames= {}
    var collapseHeight = cellSize+5;
    var uncollapseHeight = 95;
    var isCollapsed = true;
    var toggleState = {}
    var isNewPanel = true;
    var belowVisRestoreTranslate = "translate(0, 90)"

    var actualGroupLabel = "Query"

//    var getListOfValues = function(){
//        console.log(this);
//        var compareList= []
//        this.orClauses.forEach(function(orClause){
//
//            var compareObject = []
//            for (key in orClause){
//                compareObject.push(orClause[key].state);
//            }
//            compareList.push(compareObject)
//        })
//
//        return compareList;
//    }


    var logicExpression = {}
    var actualOrClause = 1;
    var logicState ={
        NOT:0,
        DONTCARE:2,
        MUST:1
    }


    var initLogicExpression = function(){
        logicExpression = {
            groupName:"",
            orClauses:[],
            getListOfValues:function(){

                var compareList= []
                this.orClauses.forEach(function(orClause){

                    var compareObject = []
                    for (key in orClause){
                        compareObject.push(orClause[key].state);
                    }
                    compareList.push(compareObject)
                })

                return compareList;
            }
        }


    }



    // the color for logic related stuff (highlighting & button)
    const logicColor = "#a1d99b";

    var addLogicButton = {}


    var init = function(){
        //### add button ##
        addLogicButton = vis.append("g").attr({
            class:"logicAddButton",
            "transform":"translate("+buttonX+","+buttonY+")"
        })

        addLogicButton.append("rect").attr({
            width:60,
            height:18
        }).style({fill: logicColor })
            .on("click", addLogic)

        addLogicButton.append("text").attr({
            class:"addButton",
            x:30,
            y:9
        }).style({ fill:"white" })
            .text("+ query")
            .on("click", addLogic)


        defineDontCarePattern(panel,cellSize,grays);

        initLogicExpression();

    }


    var defineDontCarePattern = function(gQuery, cellSize, grays){
        var patternDefAll = gQuery.selectAll("defs").data([cellSize], function(d){return d;})
        patternDefAll.exit().remove();


//        if (removed.length<1){
        var patternDef = patternDefAll.enter().
        append("defs").append("pattern").attr({
                id:"DontCarePattern",
//            patternUnits:"userSpaceOnUse",
                patternContentUnits:"objectBoundingBox",
                x:"0",
                y:"0",
                width:1,
                height:1
            })
        patternDef.append("rect").attr({
            x:.5,
            y:0,
            width:.5,
            height:1,
            fill: grays[1]
        })
        patternDef.append("rect").attr({
            x:0,
            y:0,
            width:.5,
            height:1,
            fill: grays[0]
        })
    }


    var addLogic = function(){

        addLogicButton.attr({
            "opacity":0
        })
        belowVisRestoreTranslate= +belowVis.attr("y");


        // define first orClause as dontcare ANDs
        logicExpression.orClauses[0] = {};
        usedSets.forEach(function(d){
            logicExpression.orClauses[0][d.id]={state:logicState.DONTCARE};
//            logicExpression.orClauses[0][d.id]={state:Math.floor(Math.random()*3)};
        })

        logicExpression["id"] = "LogicGroup_"+(new Date().getTime())

        actualOrClause=0;
        isNewPanel= true;

        setNames={}
        usedSets.forEach(function(d){
            setNames[d.id] = d.elementName
        })
        actualGroupLabel = "Query"

        renderActualPanel();
    }

    var addOrClause = function(){

        var id = logicExpression.orClauses.length;
        logicExpression.orClauses[id] = {};
        usedSets.forEach(function(d){
            logicExpression.orClauses[id][d.id]= {state:logicState.DONTCARE};
//            logicExpression.orClauses[id][d.id]={state:Math.floor(Math.random()*3)};
        })
        actualOrClause= id;
        renderActualPanel();
    }


    var selectRow = function(index){
        if (index != actualOrClause){
            actualOrClause= index;
            renderActualPanel();
        }else{
            actualOrClause = -1;
            renderActualPanel();
        }
    }

    var removeRow = function(index){
        logicExpression.orClauses.splice(index,1)
        actualOrClause=actualOrClause-1;
        if (logicExpression.orClauses.length==0) destroyPanel();
        else renderActualPanel();
    }


    function changeState(orClause, id, state) {
         logicExpression.orClauses[actualOrClause][id] = {state:state};

//        console.log("here");
         panel.selectAll(".logicPanelRow").filter(function(d,i){return (i==actualOrClause)})
             .each(function(d){
                 renderSelectorTable(this, true, false, actualOrClause);
                })

    }

    function getTextDescription(actualOrClause){
        var actualClause = logicExpression.orClauses[actualOrClause]
        var collectExpressions = {}

        Object.keys(actualClause).forEach(function(d){

            var setList = collectExpressions[actualClause[d].state]
            if (setList==null){
                setList=[setNames[d]]
            }else{
                setList.push(setNames[d])
            }
            collectExpressions[actualClause[d].state] = setList

        })

        //console.log("expression",collectExpressions);

        var setNameListLength = Object.keys(setNames).length;
        var expression = "";

        Object.keys(logicState).forEach(function (dd){
            var d = logicState[dd];
            if (collectExpressions[d]!=null && collectExpressions[d].length ==setNameListLength){
                switch(d){
                    case logicState.NOT:
                        expression=  "the intersection that does not intersect with any selected set";
                        break;
                    case logicState.DONTCARE:
                        expression =  "all intersections that intersect with the selected sets";
                        break;
                    case logicState.MUST:
                        expression = "the intersection that intersects all selected sets";
                        break;
                    default : break;
                }
            }
        })

        if (expression.length<1){
            expression = "intersections that intersect  ";

            var but = "";
            if (collectExpressions[logicState.MUST]!=null){
                expression += "with set"+((collectExpressions[logicState.MUST].length>1)?"s ":" ")
                expression += collectExpressions[logicState.MUST].map(function(d){return "["+d+"]"}).join(" and ")
                but=" but "
            }
            if (collectExpressions[logicState.NOT]!=null){
                expression += but+"not with set ";
                expression += collectExpressions[logicState.NOT].map(function(d){return "["+d+"]"}).join(" nor with set ")
            }


        }


//            console.log(collectExpressions);

        return expression;


    }



    function changeStateAll(actualOrClause, state) {
        var actualClause = logicExpression.orClauses[actualOrClause]
        Object.keys(actualClause).forEach(function(d){
           actualClause[d]= {state:state};
        })

        //console.log("here");
        panel.selectAll(".logicPanelRow").filter(function(d,i){return (i==actualOrClause)})
            .each(function(d){
                renderSelectorTable(this, true, false, actualOrClause);
            })
    }


//    function createLineWrapperField(d3Node){
//        d3Node.html(
//                '<g requiredFeatures="http://www.w3.org/Graphics/SVG/feature/1.2/#TextFlow"> \
//                    <textArea width="200" height="auto" class="logicPanelActualText"> \
//                    Text goes here \
//                    </textArea>\
//                </g>\
//                <foreignObject width="200" height="200" class="logicPanelActualText"\
//                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility">\
//                    <p xmlns="http://www.w3.org/1999/xhtml">Text goes here</p>\
//                </foreignObject>'
//        )
//
//
//
//
//    }

    function wrap(text, width) {

        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }


    function renderSelectorTable(node, isExpanded, animated, rowIndex) {
        //console.log("textexprssion",getTextDescription(actualOrClause));

//        logicPanelSelectionTable
//        logicPanelSelectionHeader
//

        var nodeSelector = d3.select(node);
        var noOfSets = Object.keys(node.__data__).length

        var panelTableHeader = nodeSelector.select(".logicPanelSelectionHeader");
        panelTableHeader.attr({
            "transform":"translate("+90+","+0+")"
        })
        panelTableHeader.on({
            click:function(d) {selectRow(rowIndex);}
        })
        var infoBar = panelTableHeader.selectAll(".logicPanelHeaderBar").data(function(){
            var count =0;
            getSubsetsForMaskList(subsets,[logicExpression.getListOfValues()[rowIndex]], function(d){
                count++;
            })

            return [count/subsets.length];
        })
        infoBar.enter().append("rect").attr({
            class:"logicPanelHeaderBar",
            x:function(d){return noOfSets*cellWidth+5;},
            y:2,
            height:cellSize-4
        }).style({
                fill:logicColor
            })

        infoBar.transition().attr({
            width:(function(d){return d*ctx.subSetSizeScale.range()[1]})
        })


        var headerCircles = panelTableHeader
            .selectAll(".logicPanelHeaderCircle")
            .data(function(d){return Object.keys(d).map(function(dd){
                        return {subsetID:dd, state: d[dd].state}
                    })})
         headerCircles.enter().append("circle").attr({
                class:"logicPanelHeaderCircle",
                cx:function(d,i){return (i*cellWidth)+cellWidth/2}, // TODO: add 90 as params!!
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
                            return "url(#DontCarePattern)"
                    }},
                stroke:function(){if (isExpanded) return logicColor; else return grays[1];}
            })


    if (isExpanded){
        var textDescriptionPanel = nodeSelector.selectAll(".logicPanelActualText").data(function(d){
            return [getTextDescription(actualOrClause)]
        });
        textDescriptionPanel.enter().append("text").attr({
            class:"logicPanelActualText addButton",
            "transform":"translate("+(noOfSets*cellWidth+5+90)+","+0+")",
            y:cellSize,
            dy:1
        }).style({
                "text-anchor":"start",
                "dominant-baseline": "auto"
            });

        textDescriptionPanel.text(function(d){return d}).call(wrap,width-((noOfSets*cellSize+5+90+100)));

        var g= nodeSelector.select(".logicPanelSelectionTable");
        var nodeData = g.node().__data__
        var clausesList = Object.keys(nodeData).map(function(d){
            return {subsetID:d, state:nodeData[d].state}
        })




//        console.log("clist:",clausesList);
        var matrix = Object.keys(logicState).map(function(d){
            return {

                state:logicState[d],
                selectors:clausesList.map(function(dd){

                    return{
                        state:logicState[d],
                        id:dd.subsetID,
                        isSelected:function(){return (logicState[d]==dd.state)}
                    }
                })

            }
        })



        var tableRows = g.selectAll(".logicTableRow").data(matrix)

        var trEnter =tableRows.enter().append("g").attr({
            "class":"logicTableRow"
        })
        trEnter.append("text").text(function(d,i){
            switch(d.state)
            {
                case logicState.NOT:
                    return "not";
                    break;
                case logicState.MUST:
                    return "must";
                    break;
                default: // logicState.DONTCARE
                    return "maybe"
            }}).attr({
                x:-2,
                y:cellSize/2,
                class:"addButton"
            }).style({
                    "text-anchor":"end"
            }).on({
                click:function(d){changeStateAll(actualOrClause, d.state)}

            })

        trEnter.each(function(d,i){
            if (i==0)
                    d3.select(this).append("rect").attr({
                        x: 0,
                        y: -3,
                        width: cellSize*(clausesList.length),
                        height: 1

                    })
            })


        tableRows.exit().remove();
        tableRows.attr({
            "transform":function(d,i){return "translate("+(90)+","+
                ((animated)?(0.0*cellSize):((i+1.0)*cellSize +5))
//                ((i+1.0)*cellSize +5)
                +")"}
//            ,opacity:0.0001

        })



        var circles = tableRows.selectAll("circle").data(function(d){return d.selectors})
        circles.enter()
            .append("circle").attr({
            class:"logicPanelCircle",
            cx:function(d,i){return (i+.5)*cellWidth}, // TODO: add 90 as params!!
            cy: .5*cellSize,
//                if (animated) return 0.5*cellSize;
//                else return (i+1.5)*cellSize +5},
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
                            return "url(#DontCarePattern)"
                    }},
                stroke:function(d){
                    if (d.isSelected()) return logicColor;
                    else return grays[1];
                }

         })  .on({
                 "click":function(d){changeState(actualOrClause, d.id, d.state)}
             })


           if (animated){
               tableRows.transition().attr({
                   "transform":function(d,i){return "translate("+(90)+","+
                       ((i+1.0)*cellSize +5)
                       +")"}
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
            d3.select(node).select(".logicPanelSelectionTable").selectAll(".logicTableRow").remove();
            d3.select(node).select(".logicPanelActualText").remove();
        }

    }

    function submitExpression() {
        logicExpression.groupName = actualGroupLabel;

        stateObject.logicGroups.push(logicExpression);
        stateObject.logicGroupChanged=true;
        stateObject.forceUpdate= true;
        if (callAfterSubmit!=null)
            callAfterSubmit.forEach(function(d){
                d();
            })

        console.log(logicExpression);
//        console.log(logicExpression.getListOfValues())
        destroyPanel();
    }

    function changeGroupLabel() {
//        console.log("enter");
        var label = prompt("Group label:",actualGroupLabel);
        if (label !=null){
            actualGroupLabel = label
            panel.select("#fakeGroup").select("text").text(actualGroupLabel);
        }

    }

    var renderActualPanel= function(){
        cellSize = ctx.cellDistance

        defineDontCarePattern(panel,cellSize,grays);

        if (isNewPanel){
            var fakeGroup = panel.append("g").attr({id:"fakeGroup"})
            fakeGroup.append("rect").attr({
                x:0,
                y:0,
                width:width,
                height:cellSize,
                class:"groupBackGround"
            })
            fakeGroup.append("text").attr({
                x:0,
                y:cellSize-3,
                class:"groupLabel"
            }).text(actualGroupLabel)
        }


        // calculate y positions
        var yCummulate =cellSize;
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
        logicPanelRowEnter.append("text").text("V")
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
                return uncollapseHeight
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
            },
            height:function(d,i){
                return (i==actualOrClause)?uncollapseHeight:collapseHeight
            }
        }).style("opacity",1);

        logicPanelRows.select(".logicPanelSelect").transition().attr({
            x:10,
            y: function(d,i){
//                if (actualOrClause==i) return uncollapseHeight/2;
//                else
                    return collapseHeight/2;
            }
        }).text(function(d,i){
                if (actualOrClause==i) return "^";
                else return "";
            })

        logicPanelRows.select(".logicPanelRemove").transition().attr({
            x:60,
            y: function(d,i){
//                if (actualOrClause==i) return uncollapseHeight/2;
//                else
                    return collapseHeight/2;
            }
        })

        logicPanelRows.select(".logicPanelRect").transition().attr({
                height:function(d,i){
                    return (i==actualOrClause)?uncollapseHeight:collapseHeight}
        })


        logicPanelRows.each(function(d,i){
            renderSelectorTable(this, i==actualOrClause, true, i);
        })


        var endOfPanel = yCummulate+10
        if (isNewPanel){
            var buttonGroup =  panel.append("g").attr({
                id:"logicPanelButtons"
            }).attr({
                    "transform":"translate("+0+","+endOfPanel+")"
                })

            buttonGroup.append("text").text("add OR").attr({
                id:"logicPanelAddText",
                class:"addButton",
                x:25
//                "transform":"translate("+0+","+endOfPanel+")"
            }).style({
//                    "text-anchor":"start"
                })
                .on({
                    "click":function(){addOrClause();}
                })

            buttonGroup.append("text").text("create").attr({
                id:"logicPanelSubmitText",
                class:"addButton",
                x:230
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
                x:280
//                "transform":"translate("+70+","+endOfPanel+")"
            }).style({
//                    "text-anchor":"start"
                })
                .on({
                    "click":function(){destroyPanel();}
                })

            buttonGroup.append("text").text("change group label").attr({
                id:"logicPanelCancelText",
                class:"addButton",
                x:120
//                "transform":"translate("+70+","+endOfPanel+")"
            }).style({
//                    "text-anchor":"start"
                })
                .on({
                    "click":function(){changeGroupLabel();}
                })




        }else{
            panel.select("#logicPanelButtons").transition().attr({
                "transform":"translate("+0+","+endOfPanel+")"
            })
        }

        isNewPanel=false;




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
//        belowVis.transition().attr({
//            "transform":"translate(0,"+(endOfPanel+15)+")"
//        })

        belowVis.transition().attr({
            "y":+(endOfPanel+belowVisRestoreTranslate+15)
        })






    }

    var destroyPanel = function(){
        panel.selectAll(".logicPanelRow").remove();
        panel.select("#logicPanelButtons").remove();
        panel.select("#fakeGroup").remove();


        belowVis.transition().attr({
            "y":belowVisRestoreTranslate
        })
        addLogicButton.attr({
            "opacity":1
        })
        initLogicExpression();
    }


    init();


}

