/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/

ItemViewerConfigurations = {
        scatterplot: {
            name: "Scatterplot",
            attributes: [{
                    name: "x-axis",
                    type: "numeric"
                },
                {
                    name: "y-axis",
                    type: "numeric"
                }],
            parameters: [{
                    name: "Small Multiples?",
                    type: "boolean"
                }],
            render: function( element, selections, attributeMap, parameterMap ) {
                // D3 code to render items
            }   
        }
    }
];


ItemViewer = function( configuration ) {
    var self = this;

    self.configuration = configuration;
    self.uuid = Utilities.generateUuid();
    self.attributeMap = {};
    self.parameterMap = {};
};


ItemViewer.prototype.renderViewer = function( element, selections ) {
    self.configuration.render( element, selections, self.attributeMap, self.parameterMap )
};


ItemViewer.prototype.renderEditor = function( element ) {
    var self = this;

    var editor = element.select('#item-viewer-editor-' + self.uuid );

    if ( editor.empty() ) {
        editor = element.append('div').attr( 'id', 'item-viewer-editor-' + self.uuid );
    }

    editor.html( '<div>' + 
        '<b>' + self.configuration.name +'</b>' + 
        '&nbsp;<span class="item-viewer-editor-button item-viewer-editor-save" data-viewer-uuid="' + self.uuid + '""><i class="fa fw fa-check"></i></span>' +
        '&nbsp;<span class="item-viewer-editor-button item-viewer-editor-cancel" data-viewer-uuid="' + self.uuid + '""><i class="fa fw fa-times"></i></span>' +
        '</div>');

    d3.selectAll( '.item-viewer-editor-save' ).on( 'click', function(event){
        self.parseParameterValues( this.dataset.filterUuid, selection );
        selection.applyFilters();
        self.renderViewer( element, selection, this.dataset.filterUuid );
    });

    d3.selectAll( '.item-viewer-editor-cancel' ).on( 'click', function(event){
    });

    var parameters = self.configuration.parameters;
    var parameterType = undefined;    
    var parameterName = undefined;
    for ( var parameterVariable in parameters ) {
        if ( parameters.hasOwnProperty(parameterVariable) ) {
            var parameterEditor = editor.append( 'div' ).style( "margin-left", "10px");

            // look up parameter type in configuration
            for ( var p = 0; p < parameters.length; ++p ) {
                if ( parameters[p].variable === parameterVariable ) {
                    parameterType = parameters[p].type;
                    parameterName = parameters[p].name;
                }
            }

            self.renderParameterEditor( editor, parameterName, parameterType, parameters[parameterVariable], parameterVariable );
        }
    }
};


Filter.prototype.parseParameterValues = function() {
    var self = this;
    var parameters = self.configuration.parameters;

    for ( var i = 0; i < parameters.length; ++i ) {
        var value = self.parseParameterValue( parameters[i].variable, parameters[i].type );

        if ( value ) {
            console.log( 'Replacing ' + parameters[i].variable + ' (' + parameters[i].type + ') = "' + self.parameterMap[parameters[i].variable] + '" with "' + value + '"' );
            parameterMap[parameters[i].variable] = value;
        }
    }
}

Filter.prototype.parseParameterValue = function( parameterVariable, parameterType ) {
    var editor = d3.select('#item-viewer-editor-' + self.uuid );
    if ( editor.empty() ) {
        return undefined;
    }

    var value = undefined;

    switch ( parameterType ) {
        case 'float':
            var editor = $('[data-item-viewer-parameter-variable="' + parameterVariable + '"]' );
            value = parseFloat( $( editor ).val() );
            break;
        case 'integer':
            var editor = $('[data-item-viewer-parameter-variable="' + parameterVariable + '"]' );
            value = parseInt( $( editor ).val(), 10 );
            break;
        case 'boolean':
            var editor = $('[data-item-viewer-parameter-variable="' + parameterVariable + '"]' );
            value = $( editor ).is(':checked');
            break;
        case 'string':
            // fall-through
        default:
            var editor = $('[data-item-viewer-parameter-variable="' + parameterVariable + '"]' );
            value = $( editor ).val();
            break;
    }

    return ( value );
}

Filter.prototype.renderParameterEditor = function( element, parameterName, parameterType, parameterValue, parameterVariable ) {
    var self = this;
    var s = "";
    
    s += '<div data-item-viewer-parameter-type="' + parameterType + '">';
    
    switch ( parameterType ) {
        case 'float':
            s += parameterName + ' ' + '<input data-item-viewer-parameter-variable="' + parameterVariable + '" type="number" step="0.1" value="' + d3.format('f')(parameterValue) + '"></input>';
            break;
        case 'integer':
            s +=  parameterName + ' ' + '<input data-item-viewer-parameter-variable="' + parameterVariable + '" type="number" step="1" value="' + d3.format('d')(parameterValue) + '"></input>';
            break;
        case 'boolean':
            s +=  parameterName + ' ' + '<input data-item-viewer-parameter-variable="' + parameterVariable + '" type="checkbox" ' + ( parameterValue ? "checked" : "" ) + '></input>';
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
    // none right now
};
