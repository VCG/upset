function plotSelectedItems() {

    var area = $( '#item-table' );
    
    area.html( "" );

    var s = '<table><thead><tr><th>#</th><th>Id</th>';

    for ( var a = 0; a < attributes.length; ++a ) {
        s += '<th>' + attributes[a].name + '</th>';
    }

    area.append( '</tr></thead><tbody>' );

    for ( var i = 0; i < selectedItems.length; ++i ) {
        s +=  '<tr id="' + ( 'item-' + i ) + '"><td><span class="item-index">' + (i+1) + '</span></td><td><span class="item-id">' + selectedItems[i] + '</span></td>';

        for ( var a = 0; a < attributes.length; ++a ) {
            s += '<td><span class="item-label">' + attributes[a].values[selectedItems[i]] + '</span></td>';
        }

        s += '</tr>';
    }

    s += '</tbody></table>';

    area.append( s );
}