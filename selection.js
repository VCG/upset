/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 */


Selection = function (items, filters) {
    this.items = items || [];
    this.filters = filters || [];
    this.id = undefined;
};

Selection.fromSubset = function (subset) {
    // extract a subset definition for use with the subset filter
    var subsetDefinition = {};
    for (var x = 0; x < subset.length; ++x) {
        subsetDefinition[usedSets[x].id] = subset[x];
    }

    var filterList = [];

    // create subset filter and create new selection based on all items
    var selection = new Selection(allItems);

    filterList.push({ attributeId: attributes.length - 1, id: "subset", parameters: { subset: subsetDefinition }, uuid: Utilities.generateUuid() });

    for (var a = 0; a < attributes.length - 1; ++a) {
        if (attributes[a].type === 'integer' || attributes[a].type === 'float') {
            filterList.push({ attributeId: a, id: "numericRange", parameters: { min: attributes[a].min, max: attributes[a].max }, uuid: Utilities.generateUuid() });
        }

        if (attributes[a].type === 'string' || attributes[a].type === 'id') {
            filterList.push({ attributeId: a, id: "stringRegex", parameters: { pattern: "." }, uuid: Utilities.generateUuid() });
        }
    }

    selection.filters = filterList;
    selections.addSelection(selection);
    selection.applyFilters();
    selections.setActive(selection);

    //d3.select(this).style("fill", selections.getColor(selection));

    // === Experiments ===
    // create a set count filter and create new selection based on previous subset
    //selections.addSelection(selection.createSelection( attributes.length-2, "numericRange", { min: "1", max: "1" } ));                

    // create a regex filter on name and create new selection based on previous subset
    //selections.addSelection(selection.createSelection( 0, "stringRegex", { pattern: "^[A-B].+$" } ));                

    return selection;
}

Selection.prototype.createSelection = function (attributeId, filterId, parameters) {
    var newItems = [];
    var filterInstance = filter.get(filterId);
    for (var i = 0; i < this.items.length; ++i) {
        if (filterInstance.test(this.items[i], attributes[attributeId], parameters)) {
            newItems.push(this.items[i]);
        }
    }
    console.log(filter);
    return ( new Selection(newItems, this.filters.concat([
        { id: filterId, parameters: parameters, attributeId: attributeId, uuid: Utilities.generateUuid() }
    ])) );
};

Selection.prototype.applyFilters = function () {

    // start over with all items in the data set
    this.items = allItems;

    for (var f = 0; f < this.filters.length; ++f) {
        var filterInstance = this.filters[f];
        var newItems = [];

        for (var i = 0; i < this.items.length; ++i) {
            if (filter.get(filterInstance.id).test(this.items[i], attributes[filterInstance.attributeId], filterInstance.parameters)) {
                newItems.push(this.items[i]);
            }
        }

        this.items = newItems;
    }

    $(EventManager).trigger("item-selection-updated", { selection: this });
}

Selection.prototype.mapToSubsets = function (subsetList) {
    for (var i = 0; i < subsetList.length; ++i) {
        var subset = subsetList[i];

        // ignore empty subsets
        if (subset.setSize == 0) {
            continue;
        }

        var subsetDefinition = {};
        for (var x = 0; x < subset.combinedSets.length; ++x) {
            subsetDefinition[usedSets[x].id] = subset.combinedSets[x];
        }

        var subsetFilter = filter.get('subset');
        var mappedItems = [];

        for (var j = 0; j < this.items.length; ++j) {
            if (subsetFilter.test(this.items[j], attributes[attributes.length - 1], { 'subset': subsetDefinition })) {
                mappedItems.push(this.items[j]);
            }
            else {

            }
        }

        subset.selections[this.id] = mappedItems;
    }
}

Selection.prototype.unmapFromSubsets = function (subsetList) {
    for (var i = 0; i < subsetList.length; ++i) {
        var subset = subsetList[i];

        delete subset.selections[this.id];
    }
}

Selection.prototype.getFilter = function (uuid) {
    for (var i = 0; i < this.filters.length; ++i) {
        if (this.filters[i].uuid === uuid) {
            return ( this.filters[i] );
        }
    }

    return undefined;
}

// should be a singleton
SelectionList = function (palette) {
    var self = this;

    self.list = [];
    self.colors = {};
    self.active = {};
    self.palette = palette || d3.scale.category10().range().slice();

    console.log("Palette Length " + self.palette);
};

SelectionList.prototype.getSelections = function () {
    var self = this;
    return selections.list;
}

SelectionList.prototype.addSelection = function (selection) {
    var self = this;

    selection.id = self._nextId();
    self.list.push(selection);

    self.colors[selection.id] = self._nextColor();

    $(EventManager).trigger("item-selection-added", { selection: selection });

    return self;
};

SelectionList.prototype.removeSelection = function (selection) {
    var self = this;

    for (var i = 0; i < this.list.length; ++i) {
        if (self.list[i] === selection) {
            console.log('Deleting selection ' + i + '.');

            // remove selection from list
            self.list.splice(i, 1);

            // return color to palette
            self.palette.push(self.colors[selection.id]);

            // remove selection from color map
            delete self.colors[selection.id];

            $(EventManager).trigger("item-selection-removed", { selection: selection, index: i });

            if (self.isActive(selection)) {
                if (self.list.length > 0) {
                    self.setActive(( i > 0 ? self.list[i - 1] : self.list[0] ));
                }
                else {
                    self.setActive(undefined);
                }
            }

            return;
        }
    }

    console.log('Unable to delete selection.');
};

SelectionList.prototype.getSelectionIndex = function (selection) {
    var self = this;

    for (var i = 0; i < self.list.length; ++i) {
        if (self.list[i] === selection) {
            return i;
        }
    }

    return undefined;
};

SelectionList.prototype.getSelectionIndexFromUuid = function (uuid) {
    var self = this;

    for (var i = 0; i < self.list.length; ++i) {
        if (self.list[i].id === uuid) {
            return i;
        }
    }

    return undefined;
};

SelectionList.prototype.getSelectionFromUuid = function (uuid) {
    var self = this;

    try {
        return ( self.list[self.getSelectionIndexFromUuid(uuid)] );
    }
    catch (error) {
        // ignore
    }

    return undefined;
};

SelectionList.prototype.getSelection = function (index) {
    var self = this;

    try {
        return ( self.list[index] );
    }
    catch (error) {
        // ignore
    }

    return undefined;
};

SelectionList.prototype.getColorFromUuid = function (uuid) {
    var self = this;

    try {
        return ( self.colors[uuid] );
    }
    catch (error) {
        // ignore
    }

    return undefined;
};

SelectionList.prototype.getColor = function (selection) {
    var self = this;

    try {
        return ( self.colors[selection.id] );
    }
    catch (error) {
        // ignore
    }

    return undefined;
};

SelectionList.prototype.getSize = function () {
    var self = this;

    return self.list.length;
};

SelectionList.prototype.isActive = function (selection) {
    var self = this;

    return ( self.active === selection );
};

SelectionList.prototype.isActiveByUuid = function (uuid) {
    var self = this;
    return ( self.active.id === uuid );
};

SelectionList.prototype.getActive = function () {
    var self = this;

    return ( self.active );
};

SelectionList.prototype.setActive = function (selection) {
    var self = this;

    self.active = selection;

    $(EventManager).trigger("item-selection-activated", { selection: selection });

    return ( self );
};

SelectionList.prototype.setActiveByUuid = function (uuid) {
    var self = this;

    self.active = self.getSelectionFromUuid(uuid);

    $(EventManager).trigger("item-selection-activated", { selection: self.active });

    return ( self );
};

SelectionList.prototype._nextColor = function () {
    var self = this;

    // use color pool and return black once pool is empty
    if (self.palette.length > 0) {
        // first available color
        return self.palette.splice(0, 1)[0];
    }

    return "#000";
};

SelectionList.prototype._nextId = function () {
    return Utilities.generateUuid();
};
