function plotSelectionTabs( element, selections, activeSelection ) {
    // clear target element
    d3.select(element).html("");

    if ( selections.getSize() <= 0 ) {
        d3.select(element).append('div' )
            .attr( 'class', 'info-message' )
            .html( 'No queries. Click <i class="fa fw fa-plus"></i> button to add a new query.' );

        d3.select('#filters-list').html("");
        d3.select('#filters-list').append( "div" ).attr( "class", "info-message" ).html( 'No active query.' );
        d3.select('#filters-controls').html("");
    }
    else {
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
                    .on("click", function(k) { // is attribute object
                        // check if selection has been deleted or not
                        if ( selections.getSelectionFromUuid( k.id ) ) {
                            selections.setActive( k );
                        }
                    });

                tabs.append("i")
                    .attr( "class", "fa fa-square" )
                    .style("color", function(d,i) { return ( selections.getColor( d ) ); } )
                    .style( "margin-right", "2px");
                tabs.append("span")
                    .text(function(d) { return d3.format("5d")( d.items.length ); });
                tabs.append("i")
                    .attr( "class", "fa fa-times-circle" )
                    .style( "margin-left", "5px")
                    .on("click", function(k) { // is attribute object
                        selections.removeSelection( k );
                    });
    }



    d3.select('#selection-controls').html("");
    d3.select('#selection-controls')
        .append('div')
        .attr('class', 'selection-button level-1-button')
        .attr('title', 'Create element query' )
        .html('<i class="fa fw fa-plus"></i>')
        .on("click", function(event){
            createInitialSelection();
        });
}


function plotSelectedItems( elementId, selection ) {

    var element = d3.select(elementId);
    // clear target element
    element.html("");

    if ( !selection || selections.getSize() === 0 || !selections.getColor( selection ) ) {
        element.append( "div" ).attr( "class", "info-message" ).html( 'No active query.' );
        return;
    }

    //d3.select(element).html('<p>' + selection.items.length + ' of ' + depth + ' selected</p>')

    /*
    for ( var i = 0; i < selection.filters.length; ++i ) {
        filter.renderViewer(element, selection, selection.filters[i].uuid );
    }
    */
    selection.filterCollection.renderController(d3.select("filters-controller"));

    var table = element.append("table");
    var thead = table.append("thead");
    var tbody = table.append("tbody");

    var selectionColor = parseInt( selections.getColor( selection ).substring(1), 16 );
    //console.log( selectionColor + " --- " + selections.getColor( selection ) + " --- " + ( ( selectionColor << 24 ) >>> 24 ).toString(16) );
    //console.log( 'rgba(' + ( ( ( selectionColor << 8 ) >> 24 ) >>>0 ) + ',' + ( ( ( selectionColor << 16 ) >> 24 ) >>> 0 ) + ',' + ( ( ( selectionColor << 24 ) >> 24 ) >>> 0 ) + ', 0.25)' );

    thead.append("tr")
            .selectAll("th")
            .data(attributes.slice(0,attributes.length-1)) // don't show set column
        .enter()
            .append("th")
                .style("background-color", 'rgba(' + ( ( ( selectionColor << 8 ) >> 24 ) >>>0 ) + ',' + ( ( ( selectionColor << 16 ) >> 24 ) >>> 0 ) + ',' + ( ( selectionColor << 24 ) >>> 24 ) + ', 0.5)' )
                .style("border-bottom", "3px solid " + selections.getColor( selection ) )
                .attr("class", "item-table-header" )
                .text(function(d) { return d.name; })
                .on("click", function(k) { // is attribute object

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
            .data(selection.items.slice(0,100))
        .enter()
            .append("tr")
            .each(function(d,i) {
                d3.select(this).selectAll("td")
                    .data(attributes.slice(0,attributes.length-1))
                .enter()
                    .append("td")
                    .text(function(a) { return a.values[selection.items[i]] });
            });
}
