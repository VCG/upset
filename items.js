function plotSelectionTabs( element, selections, activeSelection ) {
    // clear target element
    d3.select(element).html("");

    d3.select(element)
        .append('span')
        .attr('class', 'selection-button')
        .html('<i title="New selection" class="fa fw fa-plus"></i>')
        .on("click", function(event){
            console.log( d3.select(this) );
            createInitialSelection();
        });    

    if ( selections.getSize() <= 0 ) {
        d3.select(element).append('p' )
            .attr( 'class', 'selection-tab-list' )
            .html( 'No selections. Click <i class="fa fw fa-plus"></i> button to add a new selection.' );

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


function plotSelectedItems( elementId, selection ) { 

    var element = d3.select(elementId);
    // clear target element
    element.html("");

    if ( !selection ) {
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

    thead.append("tr")
            .selectAll("th")
            .data(attributes.slice(0,attributes.length-1)) // don't show set column
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