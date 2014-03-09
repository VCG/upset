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
          types: ["string"],
          parameters: [ { name: "Length", type: "integer", variable: "len" } ],
          test: function( item, attribute, parameters ) {
                return ( attribute.values[item].length === parameters.len );
            }   
        },
        // string match filter
        stringMatch: {
          name: "Find",
          types: ["string"],
          parameters: [ { name: "String", type: "string", variable: "pattern" } ],
          test: function( item, attribute, parameters ) {
                return ( attribute.values[item].indexOf( parameters.pattern ) >= 0 );
            }   
        },
        // string match filter
        stringRegex: {
          name: "Regular Expression",
          types: ["string"],
          parameters: [ { name: "String", type: "string", variable: "pattern" } ],
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


Filter.prototype.renderViewer = function( element, filterId, attributeId, parameters ) {
    var filterInstance = this.get( filterId );
    var filterViewer = element.append("div");

    filterViewer.html( '<div><u>' + attributes[attributeId].name +'</u>: <b>' + filterInstance.name + '</b> (<i>' + filterInstance.types + '</i>)</div>');

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

