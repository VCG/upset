/**
 * Author: Nils Gehlenborg, nils@hms.harvard.edu
 */

/**
 * Venn Diagram
 * Based on https://gist.github.com/mbostock/1067636.
 */


var isActive = function( areaSets, highlightSubsets ) {

	if ( !highlightSubsets ) {
		return false;
	}

	for ( var s = 0; s < highlightSubsets.length; ++s ) {
		var hitCounter = 0;
		for ( var i = 0; i < areaSets.length; ++i ) {
			if ( areaSets[i] === highlightSubsets[s].combinedSets[i] ) {
				++hitCounter;
			}		
		}
		if ( hitCounter === areaSets.length ) {
			return ( true );
		}		
	}

	return ( false );
}

var plotVenn = function(element, radius, highlightSubsets ) {

	var width = radius * 550/180 + radius;
	var height = radius * 300/180 + radius + .5*radius;

	d3.select(element).html("");

	var svg = d3.select(element).append("svg:svg")
	    .attr("width", width)
	    .attr("height", height);

	var vis = svg.append("svg:rect")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [0,0,0], highlightSubsets ) ? "venn-zero-set-area-active" : "venn-zero-set-area" ); } );
	    	//.classed( { "active": isActive( [0,0,0], highlightSubsets ) } );
	 
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
	    .attr("class", function() { return ( isActive( [1,0,0], highlightSubsets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );
	    //.style("fill", "#ccc" );
	    //.style("fill", "#ff0000");
	 
	svg.append("svg:rect")
	    .attr("clip-path", "url(#circle2)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [0,1,0], highlightSubsets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );
	    //.style("fill", function() { return ( ) } );
	    //.style("fill", "#00ff00");
	 
	svg.append("svg:rect")
	    .attr("clip-path", "url(#circle3)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [0,0,1], highlightSubsets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );
	    //.style("fill", "#0000ff");
	 
	svg.append("svg:g")
	    .attr("clip-path", "url(#circle1)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle2)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [1,1,0], highlightSubsets ) ? "venn-two-set-area-active" : "venn-two-set-area" ); } );
	 
	svg.append("svg:g")
	    .attr("clip-path", "url(#circle2)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle3)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [0,1,1], highlightSubsets ) ? "venn-two-set-area-active" : "venn-two-set-area" ); } );
	 
	svg.append("svg:g")
	    .attr("clip-path", "url(#circle3)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [1,0,1], highlightSubsets ) ? "venn-two-set-area-active" : "venn-two-set-area" ); } );
	 
	svg.append("svg:g")
	    .attr("clip-path", "url(#circle3)")
	  .append("svg:g")
	    .attr("clip-path", "url(#circle2)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( isActive( [1,1,1], highlightSubsets ) ? "venn-three-set-area-active" : "venn-three-set-area" ); } );
}