/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/


Selection = function( items, filters ) {
    this.items = items || [];
    this.filters = filters || [];
    this.id = undefined;
};


Selection.prototype.createSelection = function( attributeId, filterId, parameters ) {
    var newItems = [];
    var filterInstance = filter.get(filterId);
    for ( var i = 0; i < this.items.length; ++i ) {
        if ( filterInstance.test( this.items[i], attributes[attributeId], parameters ) ) {
            newItems.push(this.items[i]);
        }
    }
    console.log( filter );
    return ( new Selection( newItems, this.filters.concat( [ { id: filterId, parameters: parameters, attributeId: attributeId, uuid: Utilities.generateUuid() } ] ) ) );
};

Selection.prototype.applyFilters = function() {
    
    // start over with all items in the data set
    this.items = allItems;

    for ( var f = 0; f < this.filters.length; ++f ) {
        var filterInstance = this.filters[f];
        var newItems = [];

        for ( var i = 0; i < this.items.length; ++i ) {
            if ( filter.get(filterInstance.id).test( this.items[i], attributes[filterInstance.attributeId], filterInstance.parameters ) ) {
                newItems.push(this.items[i]);
            }
        }    

        this.items = newItems;
    }

    $(EventManager).trigger( "item-selection-updated", { selection: this } );
}


Selection.prototype.mapToSubsets = function( subsetList ) {
    for ( var i = 0; i < subsetList.length; ++i ) {
        var subset = subsetList[i];

        // ignore empty subsets
        if ( subset.setSize == 0 ) {
            continue;
        }

        var subsetDefinition = {};
        for (var x = 0; x < subset.combinedSets.length; ++x) {
            subsetDefinition[usedSets[x].id] = subset.combinedSets[x];
        }
        
        var subsetFilter = filter.get('subset');
        var mappedItems = [];

        for ( var j = 0; j < this.items.length; ++j ) {
            if ( subsetFilter.test( this.items[j], attributes[attributes.length-1], { 'subset': subsetDefinition } ) ) {
                mappedItems.push(this.items[j]);
            }
            else {

            }
        }        

        subset.selections[this.id] = mappedItems;
    }
}

Selection.prototype.unmapFromSubsets = function( subsetList ) {
    for ( var i = 0; i < subsetList.length; ++i ) {
        var subset = subsetList[i];

        delete subset.selections[this.id];
    }
}


Selection.prototype.getFilter = function( uuid ) {
    for ( var i = 0; i < this.filters.length; ++i ) {
        if ( this.filters[i].uuid === uuid ) {
            return ( this.filters[i] );
        }
    }

    return undefined;
}


// should be a singleton
function SelectionList( palette ) {
    this.list = [];
    this.colors = {};
    this.palette = palette || d3.scale.category10().range();

    this.addSelection = function( selection ) {
        selection.id = this._nextId();
        this.list.push( selection );        

        this.colors[selection.id] = this._nextColor();

        $(EventManager).trigger( "item-selection-added", { selection: selection } );            

        return this;        
    };

    this.removeSelection = function( selection ) {
        for ( var i = 0; i < this.list.length; ++i ) {
            if ( this.list[i] === selection ) {
                console.log( 'Deleting selection ' + i + '.' );
                
                // remove selection from list
                this.list.splice(i,1);

                // return color to palette
                this.palette.push(this.colors[selection.id]);

                // remove selection from color map
                delete this.colors[selection.id];

                $(EventManager).trigger( "item-selection-removed", { selection: selection, index: i } );            

                return;
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

    this.getSelectionIndexFromUuid = function(uuid){
        for ( var i = 0; i < this.list.length; ++i ) {
            if ( this.list[i].id === uuid ) {
                return i;
            }        
        }

        return undefined;
    }

    this.getSelectionFromUuid = function(uuid) {
        try {
            return ( this.list[this.getSelectionIndexFromUuid(uuid)] );
        }
        catch ( error ) {
            // ignore
        }

        return undefined;
    };    

    this.getSelection = function(index) {
        try {
            return ( this.list[index] );
        }
        catch ( error ) {
            // ignore
        }

        return undefined;
    };

    this.getColorFromUuid = function( uuid ) {
        try {
            return ( this.colors[uuid] );
        }
        catch ( error ) {
            // ignore
        }

        return undefined;
    }

    this.getColor = function( selection ) {
        try {
            return ( this.colors[selection.id] );
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
        // use color pool and return black once pool is empty
        if ( this.palette.length > 0 ) {
            // first available color
            return this.palette.splice(0,1)[0];
        }

        return "#000";
    }

    this._nextId = function() {
        return Utilities.generateUuid();
    }
}
