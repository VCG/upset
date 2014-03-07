function plotSelectedItems() {

    var area = $( '#item-table' );
    
    area.html( "" );

    area.append( '<table>' );
    area.append( '<thead><tr><th>#</th><th>Id</th><th>Name</th></tr></thead>' )
    area.append( '<tbody>' );

    for ( var i = 0; i < selectedItems.length; ++i ) {
        area.append( '<tr><td><span class="item-index">' + (i+1) + '</span></td><td><span class="item-id">' + selectedItems[i] + '</span></td><td><span class="item-label" id="' + ( 'item-' + i ) + '">' + labels[selectedItems[i]] + '</span></td></tr>' )
    }

    area.append( '</tbody>' );
    area.append( "</table>" );
}