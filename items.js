function plotSelectionTabs( element, selections, activeSelection ) {
    // clear target element
    d3.select(element).html("");

    d3.select(element)
        .append('span')
        .attr('class', 'selection-button')
        .html('<i title="New selection" class="fa fw fa-plus"></i>')
        .on("click", function(event){
            createInitialSelection();
        });    

    if ( selections.getSize() <= 0 ) {
        d3.select(element).append('p' )
            .attr( 'class', 'selection-tab-list' )
            .html( 'No selections.' );

        return;
    }

    var table = d3.select(element)
        .append("table")
        .attr("class", "selection-tab-list");

    var tbody = table.append("tbody");

    var tabs = tbody.append("tr")
            .selectAll("td")
            .data(selections.list)
        .enter()
            .append("td")
                .attr("class", "selection-tab")
                .classed( { 'active': function(d,i) { return ( selections.isActive(d) ); } } )

            tabs.append("i")
                .attr( "class", "fa fa-square" )
                .style("color", function(d,i) { return ( selections.getColor( d ) ); } )
                .style( "margin-right", "2px");
            tabs.append("span")
                .text(function(d) { return d3.format("5d")( d.items.length ); })
                .on("click", function(k) { // is attribute object
                    //d3.selectAll("td").classed( { 'active': false } )
                    //d3.select(this.parentNode).classed( { 'active': true } )  
                    //plotSelectedItems( "#item-table", k );
                    selections.setActive( k );
                });
            tabs.append("i")
                .attr( "class", "fa fa-times-circle" )
                .style( "margin-left", "5px")
                .on("click", function(k) { // is attribute object
                    selections.removeSelection( k );
                });
}


function plotSelectedItems( elementId, selection ) { 

    var element = d3.select(elementId);
    // clear target element
    element.html("");

    //console.log( "Selection is " );
    //console.log( selection );
    //console.trace();

    if ( !selection ) {
        return;
    }

    //d3.select(element).html('<p>' + selection.items.length + ' of ' + depth + ' selected</p>')

    for ( var i = 0; i < selection.filters.length; ++i ) {
        filter.renderViewer(element, selection, selection.filters[i].uuid );
    }
    
    var table = element.append("table");
    var thead = table.append("thead");
    var tbody = table.append("tbody");

    thead.append("tr")
            .selectAll("th")
            .data(attributes)
        .enter()
            .append("th")
                .style("background-color", selections.getColor( selection ) )
                .text(function(d) { return d.name; })
                .on("click", function(k) { // is attribute object

                    if ( k.type === "float" || k.type === "integer" ) {
                        plotHistogram( k );
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
            .data(selection.items)
        .enter()
            .append("tr")
            .each(function(d,i) { 
                d3.select(this).selectAll("td")
                    .data(attributes)
                .enter()
                    .append("td")
                    .text(function(a) { return a.values[selection.items[i]] });
            });
}


function plotHistogram( attribute ) {
    var element = "#item-vis";

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
            .bins(x.ticks(20))
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