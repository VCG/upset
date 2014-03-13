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
    var uncollapseHeight = 70;
    var isCollapsed = true;
    var toggleState = {}
    var isNewPanel = true;
    var belowVisRestoreTranslate = "translate(0,0)"

    var logicExpression = {orClauses:[]}
    var actualOrClause = 1;
    var logicState ={
        MUST:1,
        NOT:0,
        DONTCARE:2
    }

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
        }).style({fill:"#a1d99b" })
            .on("click", addLogic)

        addLogicButton.append("text").attr({
            class:"addButton",
            x:35,
            y:10
        }).style({ fill:"white" })
            .text("+ logic group")
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
        console.log(usedSets);

        addLogicButton.attr({
            "opacity":0
        })
        belowVisRestoreTranslate= belowVis.attr("transform");


        // define first orClause as dontcare ANDs
        logicExpression.orClauses[0] = {clauses:[]};
        usedSets.forEach(function(d){
            logicExpression.orClauses[0].clauses.push({state:logicState.DONTCARE, data: d.id});
        })

        actualOrClause=0;
        isNewPanel= true;
        renderActualPanel();
    }

    var addOrClause = function(){
        console.log(usedSets);


        var id = logicExpression.orClauses.length;
        logicExpression.orClauses[id] = {clauses:[]};
        usedSets.forEach(function(d){
            logicExpression.orClauses[id].clauses.push({state:logicState.DONTCARE, data: d.id});
        })
        actualOrClause= id;
        renderActualPanel();
    }


    var selectRow = function(index){
        actualOrClause= index;
        renderActualPanel();
    }

    var removeRow = function(index){
        logicExpression.orClauses.splice(index,1)
        actualOrClause=0;
        if (logicExpression.orClauses.length==0) destroyPanel();
        else renderActualPanel();
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
        var logicRow = logicPanelRows.enter().append("g").attr({
            class:"logicPanelRow",
            "transform":function(d,i){
                return "translate("+0+","+yOffsets[i]+")"
            }
        }).style("opacity",0.000001)

        logicRow.append("text").text("select")
            .attr("class","addButton logicPanelSelect")
            .style("text-anchor","start")
            .on("click", function(d,i){selectRow(i)});
        logicRow.append("text").text("remove")
            .attr("class","addButton logicPanelRemove")
            .style("text-anchor","start")
            .on("click", function(d,i){removeRow(i)});
        logicRow.append("rect").attr({
            class:"logicPanelRect",
            width:width,
            height:function(d,i){
                return (i==actualOrClause)?uncollapseHeight:collapseHeight
            }
        }).style({
                fill:"none",
                stroke:"lightgray"
            })

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



        logicPanelRows.selectAll(".logicPanelCircle").data(function(d){return d.clauses})
            .enter().append("circle").attr({
                class:"logicPanelCircle",
                cx:function(d,i){return (i*cellSize)+cellSize/2+90}, // TODO: add 90 as params!!
                cy:function(d,i){return cellSize/2},
                r: cellSize/2-1
            })
            .style({
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
                    }}
            })

        var endOfPanel = (logicExpression.orClauses.length-1)*collapseHeight+uncollapseHeight+3
        if (isNewPanel){
            panel.append("text").text("add").attr({
                id:"logicPanelAddText",
                class:"addButton",
                "transform":"translate("+0+","+endOfPanel+")"
            }).style({
                    "text-anchor":"start"
                })
                .on({
                    "click":function(){addOrClause();}
                })
            isNewPanel=false;
        }else{
            panel.select("#logicPanelAddText").transition().attr({
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
            "transform":"translate(0,"+(endOfPanel+10)+")"
        })






    }



    var destroyPanel = function(){
        panel.selectAll(".logicPanelRow").remove();
        panel.select("#logicPanelAddText").remove();
        belowVis.transition().attr({
            "transform":belowVisRestoreTranslate
        })
        addLogicButton.attr({
            "opacity":1
        })
    }


    init();


}

