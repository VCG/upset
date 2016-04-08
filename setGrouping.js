/**
 * Created by Hendrik Strobelt on 3/11/14.
 */



function SetGrouping(params){
    var width = params.width+10;
    var gQuery = params.queryElement;
    var vis = params.visElement;
    var cellSize = params.cellSize;
    var usedSets = params.usedSets;

//    console.log(globalContext);

    // to be bound !!
    var grays = ['#f0f0f0', '#636363'];
    var groupingByList = [
        {name:"by set size", groupFunction:function(){console.log("by set size");}},
        {name:"by sets", groupFunction:function(){console.log("by size");}},
        {name:"by weather", groupFunction:function(){console.log("by size");}}
    ]



    var collapseHeight = cellSize+5;
    var uncollapseHeight = 70;
    var isCollapsed = true;

    var toggleState = {}





    var init = function(){

//        vis.attr({
//            "transform":"translate("+0+","+(collapseHeight+6)+")"
//        })

        gQuery.append("rect").attr({
            class:"menuPlaceholder menuPlaceholderRect",
            width:width,
            height:collapseHeight
        })
        .style({
            fill:"none",
            stroke: grays[1]
        })


        gQuery.append("rect").attr({
            class:"menuPlaceholder collapseButton",
            x:width/2-50,
            y:2,
            width:100,
            height: collapseHeight-4
        })
            .style({
                "fill":"white"
            }).on({
                "click":function(d){ toggleMenu()}

            })

        gQuery.append("text").text("vvvv  detail").attr({
            class:"menuPlaceholder menuPlaceholderText columnLabel",
            "text-anchor":"middle",
            "transform":"translate("+(width-10)+","+(collapseHeight/2)+")"
        })
            .style({
//                "font-size":"8pt",
                "text-anchor":"end"
            })
            .on({
                "click":function(d){toggleMenu()}

            })


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


        var groupSelector = gQuery.append("g").attr({
           class:"groupSelector",
            "transform":"translate("+5+","+2+")"

        })
        usedSets.forEach(function(d){
            toggleState[d.id]=2;
        })

        groupSelector.selectAll(".selectorCircle").data(usedSets.map(function(d){return d.id;})).enter()
           .append("circle").attr({
                class:"selectorCircle",
                cx:function(d,i){return (i*cellSize)+cellSize/2},
                cy:function(d,i){return cellSize/2},
                r: cellSize/2-1
            })
            .style({
//                stroke:grays[1],
                fill:function(d){
                    switch(toggleState[d])
                    {
                        case 0:
                            return grays[0]
                            break;
                        case 1:
                            return grays[1]
                            break;
                        default:
                            return "url(#HalfSelectPattern)"
                    }}
            })
            .on({
                "click":function(d){toggleCircle(d);}

            })

        var xoffset = usedSets.length*cellSize +5;
        var buttonWidth = 70
        groupSelector.append("text").text("filter").attr({
            class:"columnLabel",
            x: xoffset,
            y: cellSize/2
        }).style({
                "text-anchor":"start"
        })

        groupSelector.selectAll(".groupAction").data(groupingByList).enter()
            .append("text")
            .text(function(d){return d.name})
            .attr({
                class:"groupAction columnLabel",
                x: function(d,i){return xoffset + (i+1)*(buttonWidth+3)},
                y: cellSize/2
            })




    }

    init();




    var toggleCircle= function(id){
        toggleState[id] = (toggleState[id]+1) % 3;

        gQuery.selectAll(".selectorCircle").style({
            fill:function(d){
       //         console.log(d);
                switch(toggleState[d])
            {
                case 0:
                    return grays[0]
                    break;
                case 1:
                    return grays[1]
                    break;
                default:
                    return "url(#HalfSelectPattern)"
            }}
        })


    }


    var toggleMenu= function(){

        if (isCollapsed){
            gQuery.select(".menuPlaceholderRect").transition().attr({
                height:uncollapseHeight
            })

            gQuery.select(".menuPlaceholderText").text(" ^^^^  detail")

            vis.transition().attr({
                "transform":"translate("+0+","+(uncollapseHeight+2)+")"
            })


            isCollapsed=false;
        }else{
            gQuery.select(".menuPlaceholderRect").transition().attr({
                height:collapseHeight
            })

            gQuery.select(".menuPlaceholderText").text("vvvv  detail")

            vis.transition().attr({
                "transform":"translate("+0+","+(collapseHeight+2)+")"
            })

            isCollapsed=true;

        }





    }


//    vis.append("rect").attr({
//
//
//
//    })
//







}
