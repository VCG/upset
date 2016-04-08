/**
 * Created by hen on 3/18/14.
 */

function BrushableScale(ctx, svg, width, updateFunctionNameInCtx, redrawFunctionNameInCtx, scaleNameInCtx, params){



//    var svg = d3.select("#vis").append("svg").attr({
//        width:800,
//        height:800
//    })

    var offsetX=0,
        offsetY=0;

    var distanceBetweenAxis = 25; // distance between two scales
    var distanceBetweenUpperAndLower = 20 // should be fix !!
//        height=20;


    var width = width;

    var xScale = d3.scale.pow().exponent(2).domain([1,width]).range([0, width])
    var xOverViewAxisUpper = d3.svg.axis().scale(xScale);
    var xOverViewAxisLower = d3.svg.axis().scale(xScale).orient("top").tickFormat(function(d){return ""});


    var xDetailScale = d3.scale.linear().domain([0,width]).range([0,width]).clamp(true)
    var xDetailAxisUpper = d3.svg.axis().scale(xDetailScale).ticks(5);
    var xDetailAxisLower = d3.svg.axis().scale(xDetailScale).orient("top").tickFormat(function(d){return ""}).ticks(5);

    var param = param

    var columnLabel ="ABC";

    var maxValue = 100;

    var labels=[
        {name: "largest intersection",id:"I", value:100 },
        {name: "largest group",id:"G", value:200 },
        {name: "largest set",id:"S", value:300 },
        {name: "all items",id:"A", value:400 }
    ]


    var actionsTriggeredByLabelClick=params.actionsTrioggeredByLabelClick;


    var connectionAreaData =[
        [0,-distanceBetweenAxis],
        [100,-distanceBetweenAxis],
        [width,0]
    ]


    // add axis
    svg.append("g").attr({
        "class":"x overviewAxisUpper axis",
        "transform":"translate("+offsetX+","+offsetY+")"
    }).call(xOverViewAxisUpper)


    svg.append("g").attr({
        "class":"x overviewAxisLower axis",
        "transform":"translate("+offsetX+","+(offsetY+distanceBetweenUpperAndLower)+")"
    }).call(xOverViewAxisLower)

    svg.append("g").attr({
        "class":"x detailAxisUpper axis",
        "transform":"translate("+offsetX+","+(offsetY+distanceBetweenAxis+distanceBetweenUpperAndLower)+")"
    }).call(xDetailAxisUpper)

    svg.append("g").attr({
        "class":"x detailAxisLower axis",
        "transform":"translate("+offsetX+","+(offsetY+distanceBetweenAxis+2*distanceBetweenUpperAndLower)+")"
    }).call(xDetailAxisLower)

//    svg.append("path").attr({
//        class:"connectionArea",
//        "transform":"translate("+offsetX+","+offsetY+")"
//    })


    var sliders;
    var overViewBrushDef;
    var overviewBrush;
    var redrawFunction = ctx[redrawFunctionNameInCtx];


    // brushed function
    var brushed = function(){
        var endRange = overViewBrushDef.extent()[1];
        if (endRange<5){
            endRange =5;
            overViewBrushDef.extent([0,5]);

        }


        svg.select(".drawBrush").attr({
            width:xScale(endRange)
        });

        xDetailScale.domain([0,endRange]);
        xDetailAxisUpper.scale(xDetailScale);
        xDetailAxisLower.scale(xDetailScale);

        svg.selectAll(".detailAxisUpper").call(xDetailAxisUpper);
        svg.selectAll(".detailAxisLower").call(xDetailAxisLower);

        connectionAreaData[1][0]= xScale(endRange);
        updateConnectionArea()
        if (redrawFunction!=null) redrawFunction();
        ctx[scaleNameInCtx] = xDetailScale;
    };

    var setBrush= function(size){
//        var sizeB =xScale(size);
        overViewBrushDef.extent([0,size]);
//        overviewBrush.select(".e").attr({
//            "transform":"translate("+xScale(size)+","+0+")"
//        })
        overviewBrush.call(overViewBrushDef)
        brushed();
    }


    function updateColumnLabel() {
        svg.select(".columnLabelGroup").select("rect").attr({
            width:width
        })

        svg.select(".columnLabelGroup").select("text").attr({
            x:width/2
        })

    }

    var update = function(params){

        if (params.maxValue !=null) maxValue= params.maxValue;
        if (params.labels !=null) labels = params.labels;
        if (params.width != null) width = params.width;

        updateScales();
        updateSliderLabels();
        updateColumnLabel();
    }

    function init(){
        if (params.columnLabel != null) columnLabel = params.columnLabel;

        // define slider
        overViewBrushDef = d3.svg.brush()
            .x(xScale)
            .extent([0, 100])
            .on("brush", brushed)
            .on("brushstart", function(){
                svg.selectAll(".columnLabelGroup").transition().duration(100).style({
                    opacity:0
                })
                svg.selectAll(".connectionArea").transition().duration(100).style({
                    opacity:.2
                })

            })
            .on("brushend", function(){
                svg.selectAll(".columnLabelGroup").transition().duration(500).style({
                    opacity:1
                })
                svg.selectAll(".connectionArea").transition().duration(500).style({
                    opacity:.00001
                })
            });

        sliders = svg.append("g").attr({
            class: "sliderGroup",
            "transform": "translate(" + offsetX + "," + (offsetY) + ")"
        });

        sliders.append("path").attr({
            class:"connectionArea"
        }).style({
                opacity:.00001
            })

        var labelHeight = 20;

        var columnLabelGroup = svg.append("g").attr({
            class:"columnLabelGroup",
            "transform":"translate("+(0)+","+(distanceBetweenUpperAndLower+(distanceBetweenAxis-labelHeight)/2)+")" //Math.floor
        })

        columnLabelGroup.append("rect").attr({
            class:"labelBackground",
            x:0,
            y:0,
            width:width,
            height:labelHeight// TODO magic number
        }).on({
                "click": function(){ actionsTriggeredByLabelClick.forEach(function(d){d();})}
            })

        columnLabelGroup.append("text").attr({
            class:"columnLabel",
            "pointer-events":"none",
            x:width/2,
            y:labelHeight/2
        })
//            .style({
//                "font-size":"1em"
//            })
            .text(columnLabel);


        sliders.append("rect").attr({
            class:"drawBrush",
            x:0,
            y:0,
            height:distanceBetweenUpperAndLower,
            width:overViewBrushDef.extent()[1]
        })

        overviewBrush = sliders.append("g").attr({
            class:"slider"
        }).call(overViewBrushDef)

        overviewBrush.selectAll(".w, .extent,  .background").remove();

        overviewBrush.selectAll("rect").attr({
            height:50,
            width:20
        })
        overviewBrush.selectAll(".e")
            .append("rect")
            .attr({
                "class":"handle"
            })
        overviewBrush.selectAll("rect").attr({
            transform:"translate(0,"+(distanceBetweenUpperAndLower/2)+")rotate(45)",
            x:-5,
            y:-5,
            height:10,
            width:10
        })

        sliders.append("g").attr({
            class:"labels"
        })

    }

    function updateScales(){

        var brushedValue = d3.min([overViewBrushDef.extent()[1], maxValue]);
        var optimalExponent = getOptimalExponent(maxValue,width);
        xScale.domain([0,maxValue]).range([0, width]).exponent(optimalExponent);

        // Heavy label stuff
        var formatFunction = null;
        var tickValues = xScale.ticks(10);
        tickValues.push(maxValue);
        var tickValuesReverse = tickValues.reverse();
        var drawLabels = {};

        var numberWidth = 6/2;// TODO magic Number 6
        var maxSpace = width-maxValue.toString(10).length* numberWidth;

        drawLabels[maxValue]=true;
        tickValuesReverse.forEach(function(label){

            if (xScale(label)+label.toString(10).length*numberWidth<maxSpace){
                maxSpace = xScale(label)-label.toString(10).length*numberWidth;
                drawLabels[label] = true;
            }
        })

        formatFunction = function(d,i){return (d in drawLabels)?d:"";}
        // kill last regular tick if too close to maxValue
//        if (xScale(tickValuesReverse[0])<  width-maxValue.toString(10).length* numberWidth){
//            tickValues.slice()
//        }




//        if (optimalExponent>.8){
//            tickValues = xScale.ticks(6);
//            formatFunction = function(d,i){return d;}
//             //[0,Math.floor(maxValue/3),Math.floor(maxValue*2/3),maxValue]
//        }else{
//            tickValues = xScale.ticks(8);
//            formatFunction = function(d,i){return (i%2==0 || i<4 || i==(tickValues.length-1))?d:"";}
//        }
//        tickValues.pop();
        tickValues.push(maxValue);


        xOverViewAxisUpper.scale(xScale).tickValues(tickValues).tickFormat(formatFunction);
        xOverViewAxisLower.scale(xScale).tickValues(tickValues);

        xDetailScale.range([0,width])
        xDetailAxisUpper.scale(xDetailScale);
        xDetailAxisLower.scale(xDetailScale);
        connectionAreaData[2] =  [width,0];

        svg.select(".x.overviewAxisUpper.axis").call(xOverViewAxisUpper)
        svg.select(".x.overviewAxisLower.axis").call(xOverViewAxisLower)
        svg.select(".x.detailAxisUpper.axis").call(xDetailAxisUpper)
        svg.select(".x.detailAxisLower.axis").call(xDetailAxisLower)

        // do NOT redraw !
        overViewBrushDef.x(xScale)
        var saveRedraw = redrawFunction;
        redrawFunction = null;
        setBrush(brushedValue);
        redrawFunction = saveRedraw;

    }

    function updateSliderLabels(){


        // slider labels
        var sliderLabels = sliders.select(".labels").selectAll(".sliderLabel").data(labels, function(d){return d.name})
        sliderLabels.exit().remove();
        var sliderLabelsEnter = sliderLabels.enter().append("g").attr({
            class:"sliderLabel"
        });

        sliderLabelsEnter.append("rect").attr({
            x:-5,
            y:0,
            width:10,
            height:15
        })

            .append("svg:title").text( function(d){return d.name})

        sliderLabelsEnter.append("line").attr({
            x1:0,
            x2:0,
            y1:15,
            y2:20
        })
        sliderLabelsEnter.append("text").text(function(d){return d.id}).attr({
            dy:"1em",
            "pointer-events":"none"
        })

        sliderLabels.attr({
            "transform":function(d){return "translate("+xScale(d.value)+","+(-20)+")"}
        }).on({
                "click":function(d){setBrush(d.value);}
            })

    }


    function getOptimalExponent(maxValue, width){

        if (maxValue<=width) return 1;
        else{
            // ensure that value 5 has at least 5 pixel
            var deltaValue = 5;
            var deltaPixel = 5;


            var optimalExponent = Math.log(deltaPixel/width)/Math.log(deltaValue/maxValue);

            return optimalExponent;

        }




    }


    function updateConnectionArea(){
        var cAreaNode = svg.selectAll(".connectionArea").data([connectionAreaData])
        cAreaNode.exit().remove();
        cAreaNode.enter().append("path")
            .attr({
                class:"connectionArea",
                 "transform":"translate("+offsetX+","+(offsetY+distanceBetweenUpperAndLower+distanceBetweenAxis)+")"

            })
        cAreaNode.attr({
            "transform":"translate("+offsetX+","+(offsetY+distanceBetweenUpperAndLower+distanceBetweenAxis)+")",
            d:d3.svg.area()
        })

    }


    init();

    updateSliderLabels();
    updateConnectionArea();
//    updateScales();

    ctx[updateFunctionNameInCtx]=function(d,params){update(params);};

}
