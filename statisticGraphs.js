/**
 * Created by hen on 3/24/14.
 */


function StatisticGraphs(){
    this.statistics = {};

    this.scale = d3.scale.linear().domain([0,1]).rangeRound([0,1]);
    this.axis = d3.svg.axis().scale(this.scale).orient("top");


    // expects a list of data containing key and value attributes
    // creates an internal map with statistics



}

StatisticGraphs.prototype.updateStatistics= function(subsetData, subsetIDselector, itemIDselector, itemData, attributeIDSelector,attributeValueSelector, attributeID ){

    var min = undefined;
    var max = undefined;

    var collector= {}

    subsetData.forEach(function(subset){

        var attributeColumn = {}
        itemData.forEach(function(d){
            if (d[attributeIDSelector]== attributeID) attributeColumn =d[attributeValueSelector];
        })

//        console.log("attr",attributeColumn);

        var itemIDSelectors = itemIDselector.split(".")

        var actualSubset = subset;
        itemIDSelectors.forEach((function(selector){
            actualSubset = actualSubset[selector];
        }))
//        console.log(actualSubset);

        var itemList = actualSubset.map(function(itemID){
            return +attributeColumn[itemID]
        })

//        console.log(itemList);

        var summaryStatistics ={
            min:0,
            max:0,
            median:0,
            lowerQuartile:0,
            upperQuartile:0

        }
        itemList.sort(d3.ascending);


        if (itemList.length!=0){
            var extent = d3.extent(itemList)
            summaryStatistics.min = extent[0];
            summaryStatistics.max = extent[1];

            summaryStatistics.median =d3.median(itemList);
            summaryStatistics.lowerQuartile =d3.quantile(itemList,0.25);
            summaryStatistics.upperQuartile =d3.quantile(itemList, 0.75);
            //.. see D3

            summaryStatistics.numberElements = itemList.length;


            if (min==undefined || min>summaryStatistics.min){
                min = summaryStatistics.min;
            }
            if (max==undefined || max<summaryStatistics.max){
                max = summaryStatistics.max;
            }


        }




        collector[subset[subsetIDselector]] = summaryStatistics;

    })

    this.statistics=collector;
    this.scale.domain([min,max]);
    this.axis.scale(this.scale)

}

StatisticGraphs.prototype.renderAxis = function(g,x,y,w){

    this.scale.rangeRound([0,w]);
    this.axis.scale(this.scale).ticks(Math.ceil(w/50)); //Math.ceil(w/50)

    var detailStatAxisVis = g.selectAll(".axis").data(["summary"])
    detailStatAxisVis.enter().append("g").attr({
        class:"axis",
        "transform":"translate("+x+","+y+")"
    }).call(this.axis)

    detailStatAxisVis.exit().remove();
    detailStatAxisVis.transition().call(this.axis);

}


StatisticGraphs.prototype.renderBoxPlot = function(id, g, x,y,w,h,classID){
    var actualStat = this.statistics[id];
    var diffY=2;


    if (actualStat!=null){
        var dS = g.selectAll("."+classID).data([actualStat])
        dS.exit().remove();


        var dSEnter = dS.enter().append("g").attr({
            class:""+classID
        })
        dSEnter.append("line").attr({
            class:"boxPlot centralLine"
        })
        dSEnter.append("line").attr({
            class:"boxPlot minLine"
        })
        dSEnter.append("line").attr({
            class:"boxPlot maxLine"
        })
        dSEnter.append("rect").attr({
            class:"boxPlot quartile"
        }).append("title").text(function(d){return "|"+ d.min+" --["+ d.lowerQuartile+" |"+ d.median+"| "+ d.upperQuartile+"]-- "+ d.max+"|"})

        dSEnter.append("line").attr({
            class:"boxPlot medianLine"
        })


        var localScale = this.scale

        dS.select("rect").transition().attr({
            x:function(d){
                return x+localScale(d.lowerQuartile)
            },
            y:(y+diffY),
            width:function(d){
                return localScale(d.upperQuartile)-localScale(d.lowerQuartile);
            },
            height:(h-(2*diffY))
        }).attr({
                opacity:function(d){return (d.numberElements>4)?1:0.0001}
            })

        dS.select(".boxPlot.centralLine").transition().attr({
            x1:function(d){return x+localScale(d.min)},
            x2:function(d){return x+localScale(d.max)},
            y1:(y+h/2),
            y2:(y+h/2)
        })

        dS.select(".boxPlot.minLine").transition().attr({
            x1:function(d){return x+localScale(d.min)},
            x2:function(d){return x+localScale(d.min)},
            y1:(y+diffY),
            y2:(y+h-diffY)
        })

        dS.select(".boxPlot.maxLine").transition().attr({
            x1:function(d){return x+localScale(d.max)},
            x2:function(d){return x+localScale(d.max)},
            y1:(y+diffY),
            y2:(y+h-diffY)
        })

        dS.select(".boxPlot.medianLine").transition().attr({
            x1:function(d){return x+localScale(d.median)},
            x2:function(d){return x+localScale(d.median)},
            y1:y,
            y2:y+h
        }).attr({
                opacity:function(d){return (d.numberElements==3 || d.numberElements >4)?1:0}
            })



    }else{
        var nullVis =  g.selectAll(".detailStatistics").data("null")
        nullVis.exit().remove();
        nullVis.enter().append("g").attr({
            class:"detailStatistics"
        }).append("line").attr({
                x1:x+1,
                x2:x+w-1,
                y1:y+h/2,
                y2:y+h/2
            })

        nullVis.select("line").attr({
            x1:x+1,
            x2:x+w-1,
            y1:y+h/2,
            y2:y+h/2
        })



    }




}

window.StatisticGraphs = StatisticGraphs;
