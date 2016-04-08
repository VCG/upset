function Scrollbar(params) {

	this.parentEl = params.parentEl;
	this.x = params.x;
	this.y = params.y;
	this.width = params.width || 20;
  this.height = params.height || 200;
	this.value = params.initValue || 0;

	this.rowsHeight = params.rowsHeight || 200;
	this.viewportHeight = params.viewportHeight;

	if(this.rowsHeight < this.viewportHeight)
		this.thumbHeight = this.height; // Nothing to scroll
	else
		this.thumbHeight = this.height - this.height*(this.rowsHeight - this.viewportHeight) / this.rowsHeight; // Test

	// Ideally we should have some listeners
	this.listeners = [];

	this.min = params.min;
	this.max = params.max;

	// In case we want some ticks on the scrollbar
	this.ordinal_axis = d3.scale.ordinal().domain(d3.range(this.min, this.max+1)).rangePoints([0, this.height]);
	this.linear_axis = d3.scale.linear().domain([this.min, this.max]).range([0, this.height]);

	this.scale = d3.scale.linear().domain([0, this.viewportHeight-this.rowsHeight]).range([0,	this.height*(this.rowsHeight - this.viewportHeight) / this.rowsHeight]);

	var that = this;

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

  this.parentEl.selectAll(".scrollbar-thumb").remove()

  this.gThumb = this.parentEl.selectAll(".scrollbar-thumb")
      .data([{value: this.value, dx:0, x:0, y:0}])
      .enter()
      .append("g")
      .attr("class", "scrollbar-thumb")
      .on("mouseover", function(d){
          d3.select(this).style("cursor", "pointer")
      })
      .call(dragScrollbar);

   this.gThumb.append("rect")
        .attr("width", 20)
        .attr("height", this.thumbHeight)
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
      d.y = Math.max(0, Math.min(d.y, that.height-that.thumbHeight))

      that.gThumb.attr("transform", "translate("+[0, d.y]+")");

      d3.select(".gRows").attr('transform', 'translate(0, ' + that.scale.invert(d.y) + ')');

      // Subset background should stick to his place
      d3.select(".background-subsets").attr('transform', function (d, i) {
          return 'translate(' + [ 0, d.y ] + ')'
      });
    }

 }

Scrollbar.prototype.setValue = function(value) {
	this.value = value;
	var new_y = this.scale(value);
	this.gThumb.attr("transform", function(d) {
		d.y = Math.min(0, new_y);
		return "translate("+[0, -d.y]+")";
	})
}
