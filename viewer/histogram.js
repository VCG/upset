var histogramConfiguration = {
    name: "Histogram",
    attributes: [{
            name: "Variable",
            type: "numeric",
            variable: "variable"                    
        }],
    parameters: [/*{
            name: "Small Multiples?",
            type: "boolean",
            variable: "smallMultiples"
        }*/{
            name: "Bins",
            type: "integer",
            variable: "bins",
            default: 20
        }],
    render: function( elementId, selections, attributes, attributeMap, parameterMap ) {

        var attribute = attributes[attributeMap.variable];

        // A formatter for counts.
        var format = d3.format(".00r");
        
        if ( attribute.type === "float" ) {
            format = d3.format(",.00r");
        }
        if ( attribute.type === "integer" ) {
            format = d3.format("d");
        }

        var margin = {top: 10, right: 10, bottom: 35, left: 45},
            width = 300 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .domain([attribute.min, attribute.max])
            .range([0, width]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        // clear
        d3.select( elementId ).html("");

        var svg = d3.select( elementId ).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var histograms = [];

        // for each selection
        for ( var s = 0; s < selections.getSize(); ++s ) {

            var values = [];
            var selection = selections.getSelection(s);

            for ( var i = 0; i < selection.items.length; ++i ) {
                values.push( attribute.values[selection.items[i]] );
            }

            // Generate a histogram using twenty uniformly-spaced bins.
            var histogram = d3.layout.histogram()
                .frequency(false)
                .bins(x.ticks(parameterMap.bins))
                (values);

            // interleave by shifting bar positions and adjusting bar widths
            for ( var i = 0; i < histogram.length; ++i ) {
                histogram[i].color = selections.getColor( selection );
                histogram[i].dx = histogram[i].dx/selections.getSize();
                histogram[i].x = histogram[i].x + s*histogram[i].dx
            }

            histograms.push( histogram );
        }

        var y = d3.scale.linear()
            .domain([0, d3.max(histograms, function(histogram) { return d3.max( histogram, function(d) { return d.y; } ); })])
            .range([height, 0]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var histogram = svg.selectAll(".histogram")
                .data( histograms )
            .enter().append("g")
                .attr("class", "histogram");

        var bar = histogram.selectAll(".bar")   
                .data( function( d ) { return ( d ); } )
            .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
        
        bar.append("rect")
            .attr("x", 1)
            .attr("width", function(d) { return x(d.dx+attribute.min) - 1; }) //x(histograms[0].dx+attribute.min) - 1
            .attr("height", function(d) { return height - y(d.y); })
            .style('fill-opacity', 0.75 )
            .style('fill', function(d){ return (d.color) } );

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
              .attr("transform", "translate(0," + 30 + ")" )
              .style("text-anchor", "start")
              .text(attribute.name);
        
        svg.append("g")
            .attr("class", "x axis")
            //.attr('stroke-width','1')
            .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -margin.left)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Frequency");


    }
};