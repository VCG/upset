/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/


$(EventManager).bind("filter-removed", function (event, data) {
    selections.getActive().filterCollection.renderFilters();
});


$(EventManager).bind("filter-added", function (event, data) {
});


$(EventManager).bind("filter-activated", function (event, data) {
});

var FilterConfigurations = {
    // subset filter
    subset: {
      name: "Subset",
      types: ["sets"],
      parameters: [ { name: "Subset", type: "subset", variable: "subset" } ],
      test: function( item, attribute, parameters ) {
            /* subset definition example:
                key = set id, value = yes or no
                { 0: 1, 1: 1, 4: 0, 512: 1 }
                sets not listed are treated as "*" (do not care)
             */

            var itemSets = attribute.values[item];

            // iterate over keys in subset definitions
            for (var id in parameters.subset) {
                if (parameters.subset.hasOwnProperty(id)) {
                    // set id is 1 => set is selected
                    if ( parameters.subset[id] === 1 && itemSets.indexOf( id ) < 0 ) {
                        // set id is selected but not found in item sets
                        return false;
                    }

                    if ( parameters.subset[id] === 0 && itemSets.indexOf( id ) >= 0 ) {
                        // set id is not selected but found in item sets
                        return false;
                    }
                }
            }

            return true;
        }
    },
    // string match filter
    stringMatch: {
      name: "Contains",
      types: ["string", "id"],
      parameters: [ { name: "String", type: "string", variable: "pattern", default: "" } ],
      test: function( item, attribute, parameters ) {
            return ( attribute.values[item].indexOf( parameters.pattern ) >= 0 );
        }
    },
    // exact string length filter
    stringLength: {
      name: "String Length",
      types: ["string", "id"],
      parameters: [ { name: "Length", type: "integer", variable: "len", default: 0 } ],
      test: function( item, attribute, parameters ) {
            return ( attribute.values[item].length === parameters.len );
        }
    },
    // string match filter
    stringRegex: {
      name: "Regular Expression",
      types: ["string", "id"],
      parameters: [ { name: "Pattern", type: "string", variable: "pattern", default: "." } ],
      test: function( item, attribute, parameters ) {
            return ( attribute.values[item].match( parameters.pattern ) !== null );
        }
    },
    // numeric range filter
    numericRange: {
      name: "Range",
      types: ["float", "integer"],
      parameters: [ { name: "Minimum", type: "float", variable: "min", default: 0 }, { name: "Maximum", type: "float", variable: "max", default: 1 } ],
      test: function( item, attribute, parameters ) {
            return ( attribute.values[item] >= parameters.min && attribute.values[item] <= parameters.max );
        }
    },
    // numeric minimum filter
    numericMinimum: {
      name: "Minimum",
      types: ["float", "integer"],
      parameters: [ { name: "Minimum", type: "float", variable: "min", default: 0 } ],
      test: function( item, attribute, parameters ) {
            return ( attribute.values[item] >= parameters.min );
        }
    },
    // numeric maximum filter
    numericMaximum: {
      name: "Maximum",
      types: ["float", "integer"],
      parameters: [ { name: "Maximum", type: "float", variable: "max", default: 0 } ],
      test: function( item, attribute, parameters ) {
            return ( attribute.values[item] <= parameters.max );
        }
    }
};



var FilterCollection = function( controllerElementId, filterElementId ) {
    var self = this;

    self.list = [];

    self.controllerElementId = controllerElementId;
    self.filterElementId = filterElementId;
};


FilterCollection.prototype.add = function( filter ) {
    var self = this;

    self.list.push( filter );

    $(EventManager).trigger("filter-added", { viewer: filter });
};


FilterCollection.prototype.remove = function( filter ) {
    var self = this;

    for ( var i = 0; i < self.list.length; ++i ) {
        if ( self.list[i].uuid === filter.uuid ) {
            self.list.splice(i, 1);

            $(EventManager).trigger("filter-removed", { viewer: filter });
        }
    }
};


FilterCollection.prototype.getIndex = function( filter ) {
    var self = this;

    for ( var i = 0; i < self.list.length; ++i ) {
        if ( self.list[i].uuid === filter.uuid ) {
            return ( i );
        }
    }

    return ( undefined );
};


FilterCollection.prototype.get = function( uuid ) {
    var self = this;

    for ( var i = 0; i < self.list.length; ++i ) {
        if ( self.list[i].uuid === uuid ) {
            return ( self.list[i] );
        }
    }

    return ( undefined );
};



// render the controller (i.e. list of viewers that can be added and a "new" button)
FilterCollection.prototype.renderController = function() {
    var self = this;
    var controllerElement = d3.select( self.controllerElementId );

    controllerElement.html("");

    // create header and controls
    var viewerElementHeader = controllerElement.append( "div" ).attr( "class", "filter-header" );

    viewerElementHeader.append( "div" )
            .attr( "class", "filter-editor-button level-1-button" )
            .attr( "id", "filter-add" )
            .on( "click", function() {
                var filterSelector = document.getElementById( 'filter-selector' );
                var configuration = filterSelector.options[filterSelector.selectedIndex].__data__;
                var attributeSelector = document.getElementById( 'attribute-selector' );
                var attribute = attributeSelector.options[attributeSelector.selectedIndex].__data__;
                var filter = new Filter( attribute, configuration );

                // if this is the first filter, make sure that the parent element (filters-list) is empty
                if ( self.list.length == 0 ) {
                    d3.select('#filters-list').html("");
                }

                self.add( filter );

                // add DOM nodes for filter viewer and editor
                d3.select(self.filterElementId).insert( 'div' ).attr('class', 'filter-editor').attr( 'id', filter.editorElementId.substring(1) );
                filter.renderEditor( d3.select( filter.editorElementId ), selections.getActive() );
            })
        .append( "i" ).
            attr( "class", "fa fw fa-plus" );

    var attributeSelect = controllerElement.append('select');
    var filterSelect = controllerElement.append('select');
    filterSelect.attr('id', 'filter-selector');

    attributeSelect.attr('id', 'attribute-selector')
        .selectAll('option')
            .data( attributes )
        .enter()
            .append('option')
            .attr('value', function (d, i) {
                return i;
            })
        .text(function (d) {
            return d.name;
        });

    attributeSelect.on('changeDataset', self.initializeFilterList );
    self.initializeFilterList();

};

FilterCollection.prototype.initializeFilterList = function() {
    var filterSelect = d3.select( "#filter-selector");
    filterSelect.html("");
    filterSelect.selectAll('option')
            .data( function() {
                // convert FilterConfiguration into array
                // return only those filters that can be applied to the selected attribute
                return $.map(FilterConfigurations, function(value, index) {
                    var selector = document.getElementById( 'attribute-selector' );
                    var attribute = selector.options[selector.selectedIndex].__data__;
                    if ( value.types.indexOf( attribute.type ) >= 0 ) {
                        return [value];
                    }
                });
            })
        .enter()
            .append('option')
            .attr('value', function (d, i) {
                return i;
            })
        .text(function (d) {
            return d.name;
        });
};

// render the active viewer
FilterCollection.prototype.renderFilters = function() {
    var self = this;

    var filterElement = d3.select( self.filterElementId );

    // clear element
    filterElement.html("");
    filterElement = filterElement.append( "div" ); //.attr( "class", "filter-active" );

    // check if there is a viewer
    if ( self.list.length === 0 ) {
        filterElement.append( "div" ).attr( "class", "info-message" ).html( 'No filters configured. Click <i class="fa fw fa-plus"></i> button to add a new filter.' );

        return self;
    }
    else {
        for ( var f = 0; f < self.list.length; ++f ) {
            var filter = self.list[f];
            filterElement.append( 'div' ).attr( 'id', filter.editorElementId.substring(1) );
            filter.renderViewer( d3.select( filter.editorElementId ), selections.getActive() );
        }
    }

    return self;
};

var Filter = function(attribute, configuration,parameterMap) {
    var self = this;

    self.attribute = attribute;
    self.uuid = Utilities.generateUuid();
    self.editorElementId = '#filter-editor-' + self.uuid;
    //self.viewerElementId = '#filter-viewer-' + self.uuid;
    self.configuration = configuration;
    self.parameterMap = {};

    if ( !parameterMap ) {
        self.initializeParameterMap();
    }
    else {
        self.parameterMap = parameterMap;
    }
};

Filter.prototype.initializeParameterMap = function() {
    var self = this;

    for ( var i = 0; i < self.configuration.parameters.length; ++i ) {
        var parameter = self.configuration.parameters[i];

        self.parameterMap[parameter.variable] = parameter.default;
    }
};

/*
Filter.prototype.getList = function( type ) {
    var typeList = [];

    if ( !type ) {
        for (var filter in this.list) {
            if (this.list.hasOwnProperty(filter)) {
                typeList.push(filter);
            }
        }
    }
    else {
        for (var filter in this.list) {
            if (this.list.hasOwnProperty(filter)) {
                if ( this.list[filter].types.indexOf( type ) >= 0 ) {
                    typeList.push(filter);
                }
            }
        }
    }

    return typeList;
};
*/


Filter.prototype.renderViewer = function( element, selection ) {
    var self = this;

    var parameters = self.parameterMap;
    var filterViewer = element;

    filterViewer.attr( 'class', 'filter-viewer' );

    filterViewer.html( '<div>' +
        '<span class="filter-button level-2-button filter-remove" data-filter-uuid="' + self.uuid + '""><i class="fa fw fa-times-circle"></i></span>' +
        '<span class="filter-button level-2-button filter-edit" data-filter-uuid="' + self.uuid + '""><i class="fa fw fa-pencil"></i></span>' +
        '&nbsp;<b>' + self.configuration.name + '</b>&nbsp;|&nbsp;' + self.attribute.name +'</div>');

    $('.filter-edit[data-filter-uuid="' + self.uuid + '"]').on( 'click', function(){
        self.renderEditor( element, selection, self.uuid );
    });

    $( '.filter-remove[data-filter-uuid="' + self.uuid + '"]').on( 'click', function(){
        $( self.editorElementId ).remove();
        selection.filterCollection.remove( self );
        selection.applyFilters();
    });


    var parameterType = undefined;
    var parameterName = undefined;
    for ( var parameterVariable in parameters ) {
        if ( parameters.hasOwnProperty(parameterVariable) ) {
            var parameterViewer = filterViewer.append( 'div' ).attr( 'class', 'filter-parameter-viewer' );

            // look up parameter type in filter instance
            for ( var p = 0; p < self.configuration.parameters.length; ++p ) {
                if ( self.configuration.parameters[p].variable === parameterVariable ) {
                    parameterType = self.configuration.parameters[p].type;
                    parameterName = self.configuration.parameters[p].name;
                }
            }

            this.renderParameterViewer( parameterViewer, parameterName, parameterType, parameters[parameterVariable] );
        }
    }
};

Filter.prototype.renderEditor = function( element, selection ) { // filterId, attributeId, parameters
    var self = this;

    var parameters = self.parameterMap;
    var filterEditor = element;

    filterEditor.html( '<div>' +
        '<span class="filter-button level-2-button filter-cancel" data-filter-uuid="' + self.uuid + '""><i class="fa fw fa-times"></i></span>' +
        '<span class="filter-button level-2-button filter-save" data-filter-uuid="' + self.uuid + '""><i class="fa fw fa-check"></i></span>' +
        '&nbsp;<b>' + self.configuration.name + '</b>&nbsp;|&nbsp;' + self.attribute.name +'</div>');

    $('.filter-save[data-filter-uuid="' + self.uuid + '"]').on( 'click', function(){
        self.parseParameterValues( selection );
        selection.applyFilters();
        self.renderViewer( element, selection );
    });

    $('.filter-cancel[data-filter-uuid="' + self.uuid + '"]').on( 'click', function(){
        self.renderViewer( element, selection );
    });

    var parameterType = undefined;
    var parameterName = undefined;
    for ( var parameterVariable in parameters ) {
        if ( parameters.hasOwnProperty(parameterVariable) ) {
            var parameterEditor = filterEditor.append( 'div' );

            // look up parameter type in filter instance
            for ( var p = 0; p < self.configuration.parameters.length; ++p ) {
                if ( self.configuration.parameters[p].variable === parameterVariable ) {
                    parameterType = self.configuration.parameters[p].type;
                    parameterName = self.configuration.parameters[p].name;
                }
            }

            self.renderParameterEditor( parameterEditor, parameterName, parameterType, parameters[parameterVariable], parameterVariable );
        }
    }
};


Filter.prototype.renderParameterViewer = function( element, parameterName, parameterType, parameterValue ) {

    switch ( parameterType ) {
        case 'float':
            element.html( '<i>' + parameterName + '</i> = ' + d3.format('f')(parameterValue) );
            break;
        case 'integer':
            element.html( '<i>' + parameterName + '</i> = ' + d3.format('d')(parameterValue) );
            break;
        case 'subset':
            var s = "";
            var subset = parameterValue;

            for (var id in subset) {
                if (subset.hasOwnProperty(id)) {
                    s += '<span title="' + setIdToSet[id].elementName + '">' + '<i class="' + this.subsetStateToClass( subset[id] ) + '"></i>';
                    s += '</span>&nbsp;';
                }
            }
            element.html( s );
            break;
        case 'string':
            // fall-through
        default:
            element.html( '<i>' + parameterName + '</i> = "' + parameterValue + '"' );
            break;
    }
};

Filter.prototype.parseParameterValues = function( selection ) {
    var self = this;
    var filterParameters = self.configuration.parameters;
    var filterInstanceParameters = self.parameterMap;

    for ( var i = 0; i < filterParameters.length; ++i ) {
        var value = self.parseParameterValue( filterParameters[i].variable, filterParameters[i].type );

        if ( value ) {
    //        console.log( 'Replacing ' + filterParameters[i].variable + ' (' + filterParameters[i].type + ') = "' + filterInstanceParameters[filterParameters[i].variable] + '" with "' + value + '"' );
            filterInstanceParameters[filterParameters[i].variable] = value;
        }
    }
}

Filter.prototype.parseParameterValue = function( parameterVariable, parameterType ) {
    var self = this;

    var filterEditor = $( self.editorElementId );

    var value = undefined;

    switch ( parameterType ) {
        case 'float':
            var parameterEditor = filterEditor.find('[data-filter-parameter-variable="' + parameterVariable + '"]' );
            value = parseFloat( $( parameterEditor ).val() );
            break;
        case 'integer':
            var parameterEditor = filterEditor.find('[data-filter-parameter-variable="' + parameterVariable + '"]' );
            value = parseInt( $( parameterEditor ).val(), 10 );
            break;
        case 'subset':
            value = {};
            var parameterEditor = filterEditor.find( ".subset-state-toggle-button" ).each(function() {
                value[this.dataset.subset] = +this.dataset.subsetState;
            });
         //   console.log( value );
            break;
        case 'string':
            // fall-through
        default:
            var parameterEditor = filterEditor.find('[data-filter-parameter-variable="' + parameterVariable + '"]' );
            value = $( parameterEditor ).val();
            break;
    }

    return ( value );
}

Filter.prototype.renderParameterEditor = function( element, parameterName, parameterType, parameterValue, parameterVariable ) {
    var self = this;
    var s = "";

    s += '<div data-filter-parameter-type="' + parameterType + '">';

    switch ( parameterType ) {
        case 'float':
            s += '<i>' + parameterName + '</i> = ' + '<input data-filter-parameter-variable="' + parameterVariable + '" type="number" step="0.1" value="' + d3.format('f')(parameterValue) + '"></input>';
            break;
        case 'integer':
            s +=  '<i>' + parameterName + '</i> = ' + '<input data-filter-parameter-variable="' + parameterVariable + '" type="number" step="1" value="' + d3.format('d')(parameterValue) + '"></input>';
            break;
        case 'subset':
            var subset = parameterValue;
            for (var id in subset) {
                if (subset.hasOwnProperty(id)) {
                    s += '<span class="subset-state-toggle-button" data-subset="' + id + '" data-subset-state="' + subset[id] + '">' + '<i class="' + this.subsetStateToClass( subset[id] ) + '"></i>';
                    s += ' ' + setIdToSet[id].elementName + ' <small>' + (setIdToSet[id].setSize === 0 ? '<i class="fa fa-warning"></i> 0 items' : '') + '</small>' + '</span><br>';
                }
            }
            break;
        case 'string':
            // fall-through
        default:
            s += '<i>' + parameterName + '</i> = ' + '<input data-filter-parameter-variable="' + parameterVariable + '" type="text" value="' + parameterValue + '"></input>';
            break;
    }

    s += '</div>';

    // add to DOM
    element.html(s);

    // attach events ...
    d3.selectAll( ".subset-state-toggle-button").on( "click", function(event) {
        this.dataset.subsetState = ( this.dataset.subsetState+1) % 3;
        d3.select(this).select('i').attr( "class", self.subsetStateToClass( this.dataset.subsetState ) );
    });
};


Filter.prototype.subsetStateToClass = function( state ) {
    var s = "";

    switch ( "" + state ) {
        case "0":
            s += 'fa fw fa-circle-o';
            break;
        case "1":
            s += 'fa fw fa-circle';
            break;
        case "2":
            s += 'fa fw fa-dot-circle-o';
            break;
        default:
            s += 'fa fw fa-question-circle';
            break;
    }

    return ( s );
}
