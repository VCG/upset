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
    }
};