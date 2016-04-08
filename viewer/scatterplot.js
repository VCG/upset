var scatterplotConfiguration = {
    name: "Scatterplot",
    attributes: [{
            name: "x",
            type: "numeric",
            variable: "x"
        },
        {
            name: "y",
            type: "numeric",
            variable: "y"
        }],
    parameters: [{
            name: "Log Scale X",
            type: "boolean",
            variable: "logScaleX",
            default: false
        },
        {
            name: "Log Scale Y",
            type: "boolean",
            variable: "logScaleY",
            default: false
        }],
    render: function( elementId, selections, attributes, attributeMap, parameterMap ) {
        // based on http://bl.ocks.org/bunkat/2595950

        var data = [];

        var attributeX = attributes[attributeMap.x];
        var attributeY = attributes[attributeMap.y];

        // create data structure: array of pair arrays for each selection
        for ( var s = 0; s < selections.getSize(); ++s ) {

            var values = [];
            var selection = selections.getSelection(s);

            for ( var i = 0; i < selection.items.length; ++i ) {
                values.push( [ attributeX.values[selection.items[i]], attributeY.values[selection.items[i]]] );
            }

            values.color = selections.getColor( selection );

            data.push( values );
        }

        var margin = {top: 10, right: 20, bottom: 35, left: 45},
            width = 350 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var x;

        if ( parameterMap.logScaleX ) {
            x = d3.scale.log()
                .domain([attributeX.min, attributeX.max])
                .range([0, width]);
        }
        else {
            x = d3.scale.linear()
                .domain([attributeX.min, attributeX.max])
                .range([0, width]);
        }

        var y;

        if ( parameterMap.logScaleY ) {
            y = d3.scale.log()
                .domain([attributeY.min, attributeY.max])
                .range([ height, 0 ]);
        }
        else {
            y = d3.scale.linear()
                .domain([attributeY.min, attributeY.max])
                .range([ height, 0 ]);
        }

        d3.select( elementId ).html("");

        var chart = d3.select( elementId )
        .append('svg:svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'chart')

        var main = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main')

        // draw the x axis
        var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

        main.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'main axis date')
            .call(xAxis)
            .append("text")
                .attr("transform", "translate(0," + 30 + ")" )
                .style("text-anchor", "start")
                .text(attributeX.name);



        // draw the y axis
        var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

        main.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'main axis date')
            .call(yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text( attributeY.name );

        var g = main.append("svg:g");

        var selectionGroup = g.selectAll( '.selection-group' )
            .data(data)
          .enter()
            .append( 'g' )
            .attr( 'class', '.selection-group' )
            .style('fill-opacity', 0.5 )
            .attr("fill", function(d) {  return ( d.color ); } );

        var marks = selectionGroup.selectAll( '.element-mark' )
                .data( function( d ) { return ( d ); } )
            .enter()
                .append("svg:circle")
                    .attr("cx", function (d,i) { return x(d[0]); } )
                    .attr("cy", function (d,i) { return y(d[1]); } )
                    .attr("r", 2);
    }
};
