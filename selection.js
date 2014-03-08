/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/


function Selection( items ) {
    this.items = items || [];
}


// should be a singleton
function SelectionList( colors ) {
    this.list = [];
    this.colorMap = {};
    this.colors = colors || d3.scale.category10().range();

    this.addSelection = function( selection ) {
        this.colorMap[this.list.length] = this._nextColor();
        console.log( this.colorMap );
        this.list.push( selection );        

        $(EventManager).trigger( "item-selection-added", { selection: selection } );            

        return this;        
    };

    this.removeSelection = function( selection ) {
        for ( var i = 0; i < this.list.length; ++i ) {
            if ( this.list[i] === selection ) {
                console.log( 'Deleting selection ' + i + '.' );
                
                // remove selection from list
                this.list.splice(i,1);

                // remove selection from color map
                delete this.colorMap[selection];
            }
        }
        
        console.log( 'Unable to delete selection.' );
    };

    this.getSelectionIndex = function(selection){
        for ( var i = 0; i < this.list.length; ++i ) {
            if ( this.list[i] === selection ) {
                return i;
            }        
        }

        return undefined;
    }

    this.getSelection = function(index) {
        try {
            return ( this.list[index] );
        }
        catch ( error ) {
            // ignore
        }

        return undefined;
    };

    this.getColor = function( selection ) {
        try {
            return ( this.colorMap[this.getSelectionIndex(selection)] );
        }
        catch ( error ) {
            // ignore
        }

        return undefined;
    }

    this.getSize = function() {
        return this.list.length;
    }

    this._nextColor = function() {
        /*
        // assign colors using round-robin approach
        // minimizes re-use of colors
        var color = this.colors.splice(0,1)[0];
        this.color.push(color);
        return ( color );
        */

        // assign colors based on selection creation order
        // minimizes chance to have same color assigned to two or more selections
        return this.colors[this.list.length];
    }
}
