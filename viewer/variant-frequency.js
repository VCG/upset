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
    parameters: [{
            name: "Show Matrix",
            type: "boolean",
            variable: "showMatrix"
        }],
    render: function( elementId, selections, attributes, attributeMap, parameterMap ) {
        var data = [];

        var attributeReference = attributes[attributeMap.reference];
        var attributeAlternative = attributes[attributeMap.alternative];

        // create data structure: array of pair arrays for each selection
        for ( var s = 0; s < selections.getSize(); ++s ) {

            var max = 0;

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

                if ( values[referenceIndex][alternativeIndex] > max ) {
                    max = values[referenceIndex][alternativeIndex];
                }

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
            values.max = max;

            data.push( values );
        }

        d3.select( elementId ).html( "" );
        var viewer = d3.select( elementId );

        viewer.selectAll( 'p' )
                .data( data )
            .enter()
                .append( 'p' )
                .html( function( d ) {  return ( 'ti/tv = ' + d3.round( d.transitions / d.transversions, 3 ) + ' (' + d.transitions + '/' + d.transversions + ')' ); } )
                .style( "color", function( d ) { return ( d.color ); } );

        if (!parameterMap.showMatrix) {
            return;
        }

        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var size = 20;

        for ( var s = 0; s < selections.getSize(); ++s ) {

            var x = d3.scale.ordinal()
                .domain(['A', 'C', 'G', 'T'])
                .rangePoints([0.5*size,3.5*size]);

            var y = d3.scale.ordinal()
                .domain(['A', 'C', 'G', 'T'])
                .rangePoints([0.5*size,3.5*size]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var color = d3.scale.linear()
                .domain([0,data[s].max])
                .range(["#e8e8e8", "#080808"]);

            var svg = d3.select(elementId).append("svg")
                .attr("width", size * 5 + margin.left + margin.right)
                .attr("height", size * 5 + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + size*4 + ")")
                .attr('stroke-width','0')
                .call(xAxis)
            .append("text")
              .attr("transform", "translate(0," + (size+10) + ")" )
              .style("text-anchor", "start")
              .text("Ref Allele");

            svg.append("g")
                .attr("class", "y axis")
                .attr('stroke-width','0')
                .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -10-size)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Alt Allele");

            var hm = svg.append("svg:g");
            var hmrows = hm.selectAll("g")
                    .data(data)
                    .enter().append("svg:g")
                    .attr("transform", function(d, i) {
                            return "translate(0," + (size * i) + ")";
                        });

            var hmcells = hmrows.selectAll("g")
                    .data(function(d,i) { return d; })
                .enter().append("svg:g")
                    .attr("transform", function(d, i) {
                            return "translate(" + (size * i) + ",0)";
                        });

            hmcells = hmcells.selectAll('rect')
                    .data(function(d,i) { return d; })
                .enter().append("svg:rect")
                    .attr("width", size)
                    .attr("height", size)
                    .attr("transform", function(d, i) {
                            return "translate(0," + (size * i) + ")";
                        })
                    .attr('fill', function(d,i) { return( color(d) ); })
                    .attr('stroke', 'white');
        }
    }
};
