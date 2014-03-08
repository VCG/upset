function plotSelectedItems() { 
    var element = "#item-table";

    // clear target element
    d3.select(element).html("");

    d3.select(element).html('<p>' + selectedItems.length + ' of ' + depth + ' selected</p>')
    
    var table = d3.select(element).append("table");
    var thead = table.append("thead");
    var tbody = table.append("tbody");

    thead.append("tr")
            .selectAll("th")
            .data(attributes)
        .enter()
            .append("th")
                .text(function(d) { return d.name; })
                .on("click", function(k) { // is attribute object

                    if ( k.type === "float" || k.type === "integer" ) {
                        plotHistogram( k, selectedItems );
                    }

                    thead.selectAll('th').data(attributes).text(function(d) { return d.name; });
                    d3.select(this).html( ( k.sort > 0 ? "&#x25B2;" : "&#x25BC;" ) + " " + k.name );
                    rows.sort( function(a, b) { 
                        switch ( k.type ) {
                            case 'integer':
                                // fall-through
                            case 'float':
                                return k.sort * ( k.values[a] - k.values[b] );
                            case 'id':
                                // fall-through
                            case 'string':
                                // fall-through
                            default:
                                if ( k.values[a] < k.values[b] ) {
                                    return k.sort * -1;
                                }
                                if ( k.values[a] > k.values[b] ) {
                                    return k.sort * 1;
                                }
                                
                                return 0;
                        }
                    });
                    // switch sort order
                    k.sort = k.sort * -1;
                });

    var rows = tbody.selectAll("tr")
            .data(selectedItems)
        .enter()
            .append("tr")
            .each(function(d,i) { 
                d3.select(this).selectAll("td")
                    .data(attributes)
                .enter()
                    .append("td")
                    .text(function(a) { return a.values[selectedItems[i]] });
            });

}


function plotHistogram( attribute, selectedItems ) {
    var element = "#item-vis";

    var values = [];

    for ( var i = 0; i < selectedItems.length; ++i ) {
        values.push( attribute.values[selectedItems[i]] );
    }

    // A formatter for counts.
    var format = d3.format(".00r");
    
    if ( attribute.type === "float" ) {
        format = d3.format(",.00r");
    }
    if ( attribute.type === "integer" ) {
        format = d3.format("d");
    }

    var margin = {top: 0, right: 10, bottom: 20, left: 10},
        width = 300 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain([attribute.min, attribute.max])
        .range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(20))
        (values);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    // clear
    d3.select(element).html("");

    var svg = d3.select(element).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    console.log( data );

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[0].dx+attribute.min) - 1 )
        .attr("height", function(d) { return height - y(d.y); });

    /*
    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", x(data[0].dx) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return format(d.y); });
    */

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
}

/*
    $( ".attribute-header" ).on( "click", function(){
        if ( !selectedAttributes[this.getAttribute( 'data-attribute-id' )] ) {
            selectedAttributes[this.getAttribute( 'data-attribute-id' )] = true;

            $(EventManager).trigger( "attribute-selection-added", { id: this.getAttribute( 'data-attribute-id' ) } );
        }
        else {
            delete selectedAttributes[this.getAttribute( 'data-attribute-id' )];   

            $(EventManager).trigger( "attribute-selection-removed", { id: this.getAttribute( 'data-attribute-id' ) } );            
        }

        $(this).toggleClass( 'selected' );
    });


$(EventManager).bind( "attribute-selection-added", function( event, data ) {
    console.log( "attribute " + attributes[data.id].name + " was added to selection." );
});

$(EventManager).bind( "attribute-selection-removed", function( event, data ) {
    console.log( "attribute " + attributes[data.id].name + " was removed from selection." );
});
*/