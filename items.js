function plotSelectedItems() {

    var area = $( '#item-table' );
    
    area.html( "" );

    var s = '';

    s += '<p>Selection size: ' + selectedItems.length + ' of ' + depth + '</p>'

    s += '<table><thead><tr><th>#</th><th>Id</th>';

    for ( var a = 0; a < attributes.length; ++a ) {
        s += '<th class="attribute-header" data-attribute-id="' + a + '">' + attributes[a].name + '</th>';
    }

    area.append( '</tr></thead><tbody>' );

    for ( var i = 0; i < selectedItems.length; ++i ) {
        s +=  '<tr class="item-row" data-item-id="' + selectedItems[i] + '"><td><span class="item-index">' + (i+1) + '</span></td><td><span class="item-id">' + selectedItems[i] + '</span></td>';

        for ( var a = 0; a < attributes.length; ++a ) {
            s += '<td><span class="item-label">' + attributes[a].values[selectedItems[i]] + '</span></td>';
        }

        s += '</tr>';
    }

    s += '</tbody></table>';

    area.append( s );

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
}

$(EventManager).bind( "attribute-selection-added", function( event, data ) {
    console.log( "attribute " + attributes[data.id].name + " was added to selection." );
});

$(EventManager).bind( "attribute-selection-removed", function( event, data ) {
    console.log( "attribute " + attributes[data.id].name + " was removed from selection." );
});