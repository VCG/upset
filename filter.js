/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/

Filter = function() {
    // do nothing

    this.list = {
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

                //console.log( item ) ;
                var itemSets = attribute.values[item];

                // iterate over keys in subset definitions
                for (var id in parameters.subset) {
                    if (parameters.subset.hasOwnProperty(id)) {
                        // set id is 1 => set is selected
                        if ( parameters.subset[id] === 1 && itemSets.indexOf( +id ) < 0 ) {
                            // set id is selected but not found in item sets
                            return false;
                        }

                        if ( parameters.subset[id] === 0 && itemSets.indexOf( +id ) >= 0 ) {
                            // set id is not selected but found in item sets
                            return false;
                        }
                    }
                }

                return true;
            }   
        },
        // exact string length filter
        stringLength: {
          name: "Length",
          types: ["string", "id"],
          parameters: [ { name: "Length", type: "integer", variable: "len" } ],
          test: function( item, attribute, parameters ) {
                return ( attribute.values[item].length === parameters.len );
            }   
        },
        // string match filter
        stringMatch: {
          name: "Find",
          types: ["string", "id"],
          parameters: [ { name: "String", type: "string", variable: "pattern" } ],
          test: function( item, attribute, parameters ) {
                return ( attribute.values[item].indexOf( parameters.pattern ) >= 0 );
            }   
        },
        // string match filter
        stringRegex: {
          name: "Regular Expression",
          types: ["string", "id"],
          parameters: [ { name: "Pattern", type: "string", variable: "pattern" } ],
          test: function( item, attribute, parameters ) {
                return ( attribute.values[item].match( parameters.pattern ) !== null );
            }   
        },
        // numeric range filter
        numericRange: {
          name: "Range",
          types: ["float", "integer"],
          parameters: [ { name: "Minimum", type: "float", variable: "min" }, { name: "Maximum", type: "float", variable: "max" } ],
          test: function( item, attribute, parameters ) {
                return ( attribute.values[item] >= parameters.min && attribute.values[item] <= parameters.max );
            }           
        }
    }
};

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


Filter.prototype.get = function( filter ) {
    return ( this.list[filter] );
};


Filter.prototype.renderViewer = function( element, selection, filterUuid ) { // filterId, attributeId, parameters
    var self = this;

    var filterId = selection.getFilter( filterUuid ).id;
    var attributeId = selection.getFilter( filterUuid ).attributeId;
    var parameters = selection.getFilter( filterUuid ).parameters;

    var filterInstance = self.get( filterId );
    var filterViewer = element.select('#filter-' + filterUuid );
    if ( filterViewer.empty() ) {
        filterViewer = element.append('div').attr( 'id', 'filter-' + filterUuid );
    }

    filterViewer.html( '<div><u>' + attributes[attributeId].name +'</u>: <b>' + filterInstance.name + '</b> (<i>' + filterInstance.types + '</i>)&nbsp;' + 
        '<span class="filter-button filter-edit" data-filter-uuid="' + filterUuid + '""><i class="fa fw fa-pencil"></i></span>' +
        '</div>');

    d3.selectAll( '.filter-edit' ).on( 'click', function(event){
        self.renderEditor( element, selection, this.dataset.filterUuid );
    });

    var parameterType = undefined;
    var parameterName = undefined;
    for ( var parameterVariable in parameters ) {
        if ( parameters.hasOwnProperty(parameterVariable) ) {
            var parameterViewer = filterViewer.append( 'div' ).style( "margin-left", "10px");

            // look up parameter type in filter instance
            for ( var p = 0; p < filterInstance.parameters.length; ++p ) {
                if ( filterInstance.parameters[p].variable === parameterVariable ) {
                    parameterType = filterInstance.parameters[p].type;
                    parameterName = filterInstance.parameters[p].name;
                }
            }

            this.renderParameterViewer( parameterViewer, parameterName, parameterType, parameters[parameterVariable] );
        }
    }
};

Filter.prototype.renderEditor = function( element, selection, filterUuid ) { // filterId, attributeId, parameters
    var self = this;

    var filterId = selection.getFilter( filterUuid ).id;
    var attributeId = selection.getFilter( filterUuid ).attributeId;
    var parameters = selection.getFilter( filterUuid ).parameters;

    var filterInstance = self.get( filterId );
    var filterEditor = element.select('#filter-' + filterUuid );
    if ( filterEditor.empty() ) {
        filterEditor = element.append('div').attr( 'id', 'filter-' + filterUuid );
    }

    filterEditor.html( '<div><u>' + attributes[attributeId].name +'</u>: <b>' + filterInstance.name + '</b> (<i>' + filterInstance.types + '</i>)' + 
        '&nbsp;<span class="filter-button filter-save" data-filter-uuid="' + filterUuid + '""><i class="fa fw fa-check"></i></span>' +
        '&nbsp;<span class="filter-button filter-cancel" data-filter-uuid="' + filterUuid + '""><i class="fa fw fa-times"></i></span>' +
        '</div>');

    d3.selectAll( '.filter-save' ).on( 'click', function(event){
        self.parseParameterValues( this.dataset.filterUuid, selection );
        selection.applyFilters();
        self.renderViewer( element, selection, this.dataset.filterUuid );
    });

    d3.selectAll( '.filter-cancel' ).on( 'click', function(event){
        self.renderViewer( element, selection, this.dataset.filterUuid );
    });

    var parameterType = undefined;
    var parameterName = undefined;
    for ( var parameterVariable in parameters ) {
        if ( parameters.hasOwnProperty(parameterVariable) ) {
            var parameterEditor = filterEditor.append( 'div' ).style( "margin-left", "10px");

            // look up parameter type in filter instance
            for ( var p = 0; p < filterInstance.parameters.length; ++p ) {
                if ( filterInstance.parameters[p].variable === parameterVariable ) {
                    parameterType = filterInstance.parameters[p].type;
                    parameterName = filterInstance.parameters[p].name;
                }
            }

            self.renderParameterEditor( parameterEditor, parameterName, parameterType, parameters[parameterVariable], parameterVariable );
        }
    }
};


Filter.prototype.renderParameterViewer = function( element, parameterName, parameterType, parameterValue ) {
    
    switch ( parameterType ) {
        case 'float':
            element.html( parameterName + ' (' + parameterType + '): ' + d3.format('f')(parameterValue) );
            break;
        case 'integer':
            element.html( parameterName + ' (' + parameterType + '): ' + d3.format('d')(parameterValue) );
            break;
        case 'subset':
            var s = "";
            var subset = parameterValue;

            for (var id in subset) {
                if (subset.hasOwnProperty(id)) {
                    s += ( subset[id] === 1 ? '<i class="fa fw fa-square"></i>' : '<i class="fa fw fa-square-o"></i>' ) + ' '; // + id + '  ';
                }
            }
            element.html( s );
            break;
        case 'string':
            // fall-through
        default:
            element.html( parameterName + ' (' + parameterType + '): ' + parameterValue );
            break;
    }
};

Filter.prototype.parseParameterValues = function( filterUuid, selection ) {
    var self = this;
    var filterParameters = self.get( selection.getFilter( filterUuid ).id ).parameters;
    var filterInstanceParameters = selection.getFilter( filterUuid ).parameters;

    for ( var i = 0; i < filterParameters.length; ++i ) {
        var value = self.parseParameterValue( filterUuid, filterParameters[i].variable, filterParameters[i].type );

        if ( value ) {
            console.log( 'Replacing ' + filterParameters[i].variable + ' (' + filterParameters[i].type + ') = "' + filterInstanceParameters[filterParameters[i].variable] + '" with "' + value + '"' );
            filterInstanceParameters[filterParameters[i].variable] = value;
        }
    }
}

Filter.prototype.parseParameterValue = function( filterUuid, parameterVariable, parameterType ) {
    var filterEditor = d3.select('#filter-' + filterUuid );
    if ( filterEditor.empty() ) {
        return undefined;
    }

    var value = undefined;

    switch ( parameterType ) {
        case 'float':
            var parameterEditor = $('[data-filter-parameter-variable="' + parameterVariable + '"]' );
            value = parseFloat( $( parameterEditor ).val() );
            break;
        case 'integer':
            var parameterEditor = $('[data-filter-parameter-variable="' + parameterVariable + '"]' );
            value = parseInt( $( parameterEditor ).val(), 10 );
            break;
        case 'string':
            // fall-through
        default:
            var parameterEditor = $('[data-filter-parameter-variable="' + parameterVariable + '"]' );
            value = $( parameterEditor ).val();
            break;
    }

    return ( value );
}

Filter.prototype.renderParameterEditor = function( element, parameterName, parameterType, parameterValue, parameterVariable ) {

    var s = "";
    
    s += '<div data-filter-parameter-type="' + parameterType + '">';
    
    switch ( parameterType ) {
        case 'float':
            s += parameterName + ' (' + parameterType + '): ' + '<input data-filter-parameter-variable="' + parameterVariable + '" type="number" step="1" value="' + d3.format('f')(parameterValue) + '"></input>';
            break;
        case 'integer':
            s +=  parameterName + ' (' + parameterType + '): ' + '<input data-filter-parameter-variable="' + parameterVariable + '" type="number" step="1" value="' + d3.format('d')(parameterValue) + '"></input>';
            break;
        case 'subset':        
            var subset = parameterValue;

            for (var id in subset) {                
                if (subset.hasOwnProperty(id)) {
                    s += ( subset[id] === 1 ? '<i class="fa fw fa-square"></i>' : '<i class="fa fw fa-square-o"></i>' ); // + id + '  ';
                    s += ' ' + setIdToSet[id].elementName + '<br>';
                }
            }
            break;
        case 'string':
            // fall-through
        default:
            s += parameterName + ' (' + parameterType + '): ' + '<input data-filter-parameter-variable="' + parameterVariable + '" type="text" value="' + parameterValue + '"></input>';
            break;
    }

    s += '</div>'; 

    // add to DOM
    element.html(s);

    // attach events ...
};

