/*
	TODO:
	-Bind with the scrolled pab
	-Scale
	-

*/

function Scrollbar(params) {

	this.parentEl = params.parentEl;
	this.x = params.x;
	this.y = params.y;
	this.width = params.width || 20;
  this.height = params.height || 20;
	this.value = params.initValue || 0;

	// Ideally we should have some listeners
	this.listeners = [];

	this.min = params.min;
	this.max = params.max;

  var dragScrollbar = d3.behavior.drag()
          .origin(Object)
          .on("dragstart", dragstartScrollbar)
          .on("drag", dragScrollbar)
          .on("dragend", dragendScrollbar);

   var backgroundScrollbar = this.parentEl.append("rect").attr({
      width: 20,
      height: params.height,
      fill: 'lightgray',
      class: "scrollbar-background",
      x: params.x,
      y: params.y    
    });

  var gThumb = this.parentEl.selectAll(".scrollbar-thumb")
      .data([{value: this.value, dx:0, x:0, y:0}])
      .enter()
      .append("g")
      .attr("class","scrollbar-thumb")
      .on("mouseover", function(d){
          d3.select(this).style("cursor", "pointer")
      })
      .call(dragScrollbar);

    gThumb.append("rect")
        .attr("width", 20)
        .attr("height", params.thumbHeight)
        .attr("x", params.x)
        .attr("y", params.y)
        .attr("rx", 20)
        .attr("ry", 10)          
        .attr("fill", "gray")

    function dragstartScrollbar(d) {
      d.dx = 0;

    }


    function dragendScrollbar(d) {
      
    }

    function dragScrollbar(d) {
      d.y += d3.event.dy;
      if(d.y>0 && d.y<params.height-params.thumbHeight) {

        gThumb.attr("transform", "translate("+[0, d.y]+")");

          d3.select(".gRows").attr('transform', 'translate(0, ' + -d.y + ')');

          // Subset background should stick to his place
          d3.select(".background-subsets").attr('transform', function (d, i) {
              return 'translate(' + [ 0, d.y ] + ')'
          })
      }
    }

 }

Scrollbar.prototype.setValue = function(value) {
	this.value = value;
}

