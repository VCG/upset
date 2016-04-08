/**
 * Author: Nils Gehlenborg, nils@hms.harvard.edu
 */

/**
 * Venn Diagram
 * Based on https://gist.github.com/mbostock/1067636.
 */


var VennDiagram = function( element, radius ) {
	this.element = element;
	this.radius = radius;
};

VennDiagram.prototype.isActive = function( areaSets, highlightSubsets ) {
	var self = this;

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
};


VennDiagram.prototype.plot = function( highlightSubsets, setCount ) {
	var self = this;

	if ( setCount === 2 ) {
		self.plot2Set( highlightSubsets );
	}
	else if ( setCount === 3 ) {
		self.plot3Set( highlightSubsets );
	}
	else {
	//	console.error( "Venn diagram is only implemented for 2 or 3 sets." );
	}
}

VennDiagram.prototype.plot2Set = function( highlightSubsets ) {
	var self = this;

	var width = self.radius * 550/180 + self.radius;
	var height = self.radius * 200/180 + self.radius + .75*self.radius;

	d3.select(self.element).html("");

	var svg = d3.select(self.element).append("svg:svg")
	    .attr("width", width)
	    .attr("height", height);

	var vis = svg.append("svg:g")
	    .attr("width", width)
	    .attr("height", height)
	    //.attr( "transform", "scale(0.5)");

	vis.append("svg:rect")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [0,0], highlightSubsets ) ? "venn-zero-set-area-active" : "venn-zero-set-area" ); } );

	var defs = svg.append("svg:defs");

	defs.append("svg:clipPath")
	    .attr("id", "circle1")
	  .append("svg:circle")
	    .attr("cx", self.radius * 350/180 - .5 * self.radius )
	    .attr("cy", self.radius * 200/180 + .25 * self.radius )
	    .attr("r", self.radius /*180*/);

	defs.append("svg:clipPath")
	    .attr("id", "circle2")
	  .append("svg:circle")
	    .attr("cx", self.radius * 550/180 - .5 * self.radius )
	    .attr("cy", self.radius * 200/180 + .25 * self.radius)
	    .attr("r", self.radius /*180*/);


	vis.append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [1,0], highlightSubsets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );

	vis.append("svg:rect")
	    .attr("clip-path", "url(#circle2)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [0,1], highlightSubsets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );

	vis.append("svg:g")
	    .attr("clip-path", "url(#circle1)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle2)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [1,1], highlightSubsets ) ? "venn-two-set-area-active" : "venn-two-set-area" ); } );
}


VennDiagram.prototype.plot3Set = function( highlightSubsets ) {
	var self = this;

	var width = self.radius * 550/180 + self.radius;
	var height = self.radius * 300/180 + self.radius + .5*self.radius;

	d3.select(self.element).html("");

	var svg = d3.select(self.element).append("svg:svg")
	    .attr("width", width)
	    .attr("height", height);

	var vis = svg.append("svg:g")
	    .attr("width", width)
	    .attr("height", height)
	    //.attr( "transform", "scale(0.5)");

	vis.append("svg:rect")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [0,0,0], highlightSubsets ) ? "venn-zero-set-area-active" : "venn-zero-set-area" ); } );

	var defs = svg.append("svg:defs");

	defs.append("svg:clipPath")
	    .attr("id", "circle1")
	  .append("svg:circle")
	    .attr("cx", self.radius * 350/180 - .5 * self.radius )
	    .attr("cy", self.radius * 200/180 + .25 * self.radius )
	    .attr("r", self.radius /*180*/);

	defs.append("svg:clipPath")
	    .attr("id", "circle2")
	  .append("svg:circle")
	    .attr("cx", self.radius * 550/180 - .5 * self.radius )
	    .attr("cy", self.radius * 200/180 + .25 * self.radius)
	    .attr("r", self.radius /*180*/);

	defs.append("svg:clipPath")
	    .attr("id", "circle3")
	  .append("svg:circle")
	    .attr("cx", self.radius * 450/180 - .5 * self.radius )
	    .attr("cy", self.radius * 300/180 + .25 * self.radius)
	    .attr("r", self.radius /*180*/);

	vis.append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [1,0,0], highlightSubsets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );

	vis.append("svg:rect")
	    .attr("clip-path", "url(#circle2)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [0,1,0], highlightSubsets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );

	vis.append("svg:rect")
	    .attr("clip-path", "url(#circle3)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [0,0,1], highlightSubsets ) ? "venn-one-set-area-active" : "venn-one-set-area" ); } );

	vis.append("svg:g")
	    .attr("clip-path", "url(#circle1)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle2)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [1,1,0], highlightSubsets ) ? "venn-two-set-area-active" : "venn-two-set-area" ); } );

	vis.append("svg:g")
	    .attr("clip-path", "url(#circle2)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle3)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [0,1,1], highlightSubsets ) ? "venn-two-set-area-active" : "venn-two-set-area" ); } );

	vis.append("svg:g")
	    .attr("clip-path", "url(#circle3)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [1,0,1], highlightSubsets ) ? "venn-two-set-area-active" : "venn-two-set-area" ); } );

	vis.append("svg:g")
	    .attr("clip-path", "url(#circle3)")
	  .append("svg:g")
	    .attr("clip-path", "url(#circle2)")
	  .append("svg:rect")
	    .attr("clip-path", "url(#circle1)")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", function() { return ( self.isActive( [1,1,1], highlightSubsets ) ? "venn-three-set-area-active" : "venn-three-set-area" ); } );
}
