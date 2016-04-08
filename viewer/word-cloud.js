var wordCloudConfiguration = {
    name: "Word Cloud",
    attributes: [{
            name: "Text",
            type: "id",
            variable: "text"
        }],
    parameters: [],
    render: function( elementId, selections, attributes, attributeMap, parameterMap ) {
        // based on https://github.com/jasondavies/d3-cloud/blob/master/examples/simple.html
        var attribute = attributes[attributeMap.text];

        var fill = d3.scale.category20();

        // create data structure: array of pair arrays for each selection
        var data = [];
        for ( var s = 0; s < selections.getSize(); ++s ) {

            var values = [];
            var selection = selections.getSelection(s);

            for ( var i = 0; i < selection.items.length; ++i ) {
                //console.log( attribute.values[selection.items[i]].split(" ") );
                values = values.concat( attribute.values[selection.items[i]].split(" ") );
            }


            values.color = selections.getColor( selection );
            data.push( values );
        }


        d3.select( elementId ).html("");
        d3.layout.cloud().size([300, 200])
            .words(data[0].map(function(d) {
            return {text: d, size: 3 + Math.random() * 7};
            }))
            .padding(5)
            //.timeInterval(1)
            .rotate(function() { return ~~(Math.random() * 2) * 30; })
            .font("Helvetica")
            .fontSize(function(d) { return d.size; })
            .on("end", draw)
            .start();

        function draw(words) {
            d3.select( elementId ).append("svg")
                .attr("width", 300)
                .attr("height", 200)
                .append("g")
                    .attr("transform", "translate(150,100)")
                    .selectAll("text")
                        .data(words)
                .enter().append("text")
                    .style("font-size", function(d) { return d.size + "px"; })
                    .style("font-family", "Helvetica")
                    .style("fill", function(d, i) { return fill(i); })
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                .text(function(d) { return d.text; });
        }
    }
};
