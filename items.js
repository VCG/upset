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