var variantFrequencyConfiguration = {
    name: "Transition/Transversion Ratio",
    attributes: [{
            name: "Reference Allele",
            type: "string",
            variable: "reference"
        },
        {
            name: "Alternative Allele",
            type: "string",
            variable: "alternative"
        }],
    parameters: [],
    render: function( elementId, selections, attributes, attributeMap, parameterMap ) {
        var data = [];

        var attributeReference = attributes[attributeMap.reference];
        var attributeAlternative = attributes[attributeMap.alternative];

        // create data structure: array of pair arrays for each selection
        for ( var s = 0; s < selections.getSize(); ++s ) {

            var values =
                [
                    [0,0,0,0], //A -> A, C, G, T
                    [0,0,0,0], //C -> A, C, G, T
                    [0,0,0,0], //G -> A, C, G, T
                    [0,0,0,0]  //T -> A, C, G, T 
                ];

            var transitions = 0;
            var transversions = 0;

            var nucleotideIndexMap = { A: 0, C: 1, G: 2, T: 3 };

            var selection = selections.getSelection(s);

            for ( var i = 0; i < selection.items.length; ++i ) {
                var referenceIndex = nucleotideIndexMap[attributeReference.values[selection.items[i]]];
                var alternativeIndex = nucleotideIndexMap[attributeAlternative.values[selection.items[i]]];
                values[referenceIndex][alternativeIndex] += 1;

                var change = attributeReference.values[selection.items[i]] + attributeAlternative.values[selection.items[i]];

                if ( change === "AG" || change === "GA" || change === "CT" || change === "TC" ) {
                    transitions += 1;
                }
                else {
                    transversions += 1;
                }

            }

            values.color = selections.getColor( selection );
            values.transitions = transitions;
            values.transversions = transversions;

            data.push( values );
        }      
        
        d3.select( elementId ).html( "" );
        var viewer = d3.select( elementId ); 

        viewer.selectAll( 'p' )
                .data( data )
            .enter()
                .append( 'p' )
                .html( function( d ) {  return ( 'ti/tv = ' + ( d.transitions / d.transversions ) + ' (' + d.transitions + '/' + d.transversions + ')' ); } )
                .style( "color", function( d ) { return ( d.color ); } );

        /*
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .domain([0, 1, 2, 3])
            .rangeBands([0, 1,2,3]);

        var y = d3.scale.ordinal()
            .domain([0, 1, 2, 3])
            .rangeBands([0, 1,2,3]);

        var z = d3.scale.ordinal()
            .domain([0, 1, 2, 3])
            .rangeBands([0, 1,2,3]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10, "%");

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Frequency");

          svg.selectAll(".bar")
              .data(data)
            .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d) { return x(d.letter); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d.frequency); })
              .attr("height", function(d) { return height - y(d.frequency); });            
        */
    }
};