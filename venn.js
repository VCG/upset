/**
 * Author: Nils Gehlenborg, nils@hms.harvard.edu
 */

/**
 * Venn Diagram
 * Based on https://gist.github.com/mbostock/1067636.
 */


var isActive = function( areaSubset, highlightSubset ) {
	var hitCounter = 0;

	for ( var i = 0; i < areaSubset.length; ++i ) {
		if ( areaSubset[i] === highlightSubset[i] ) {
			++hitCounter;
		}
	}

	return ( hitCounter === areaSubset.length ? true : false );
}

var plotVenn = function(element, radius, highlightSubset ) {

	var width = radius * 550/180 + radius;
	var height = radius * 300/180 + radius + .5*radius;

	d3.select(element).html("");

	var svg = d3.select(element).append("svg:svg")
	    .attr("width", width)
	    .attr("height", height);

	var vis = svg.append("svg:rect")
		    .attr("width", width)
		    .attr("height", height)
	    	.attr("class", "venn-zero-set-area");
	    	//.classed( { "active": isActive( [0,0,0], highlightSubset ) } );
	 
	var defs = svg.append("svg:defs");
	 
	defs.append("svg:clipPath")
	    .attr("id", "circle1")
	  .append("svg:circle")
	    .attr("cx", radius * 350/180 - .5 * radius )
	    .attr("cy", radius * 200/180 + .25 * radius )
	    .attr("r", radius /*180*/);

	defs.append("svg:clipPath")
	    .attr("id", "circle2")
	  .append("svg:circle")
	    .attr("cx", radius * 550/180 - .5 * radius )
	    .attr("cy", radius * 200/180 + .25 * radius)
	    .attr("r", radius /*180*/);
	 
	defs.append("svg:clipPath")
	    .attr("id", "circle3")
	  .append("svg:circle")
	    .attr("cx", radius * 450/180 - .5 * radius )
	    .attr("cy", radius * 300/180 + .25 * radius)
	    .attr("r", radius /*180*/);
	 
	svg.append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [1,0,0], highlightSubset.combinedSets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );
	    //.style("fill", "#ccc" );
	    //.style("fill", "#ff0000");
	 
	svg.append("svg:rect")
	    .attr("clip-path", "url(#circle2)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [0,1,0], highlightSubset.combinedSets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );
	    //.style("fill", function() { return ( ) } );
	    //.style("fill", "#00ff00");
	 
	svg.append("svg:rect")
	    .attr("clip-path", "url(#circle3)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [0,0,1], highlightSubset.combinedSets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );
	    //.style("fill", "#0000ff");
	 
	svg.append("svg:g")
	    .attr("clip-path", "url(#circle1)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle2)")
	    .attr("width", width)
	    .attr("height", height)
	    //.style("fill", "#aaa");	    
	    .attr("class", "venn-two-set-area" );
	    //.style("fill", "#ffff00");
	 
	svg.append("svg:g")
	    .attr("clip-path", "url(#circle2)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle3)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "venn-two-set-area" );
	    //.style("fill", "#aaa");	    
	    //.style("fill", "#00ffff");
	 
	svg.append("svg:g")
	    .attr("clip-path", "url(#circle3)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "venn-two-set-area" );
	    //.style("fill", "#aaa");	    
	    //.style("fill", "#ff00ff");
	 
	svg.append("svg:g")
	    .attr("clip-path", "url(#circle3)")
	  .append("svg:g")
	    .attr("clip-path", "url(#circle2)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "venn-three-set-area" );
	    //.style("fill", "#999");	    
	    //.style("fill", "#ffffff");	
}