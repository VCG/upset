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
                    type: "boolean",
                    variable: "smallMultiples"
                }],
            render: function( element, selections, attributeMap, parameterMap ) {
                // D3 code to render items
            }   
        },
        testplot: {
            name: "Testplot",
            attributes: [{
                    name: "x-axis",
                    type: "numeric",
                    variable: "xAxis"
                },
                {
                    name: "y-axis",
                    type: "numeric"
                    variable: "yAxis"
                }],
            parameters: [
                {
                    name: "String",
                    type: "string",
                    variable: "stringVar",
                    default: "emptystring"
                },
                {
                    name: "Integer",
                    type: "integer",
                    variable: "integerVar",
                    default: 0
                },
                {
                    name: "Float",
                    type: "float",
                    variable: "floatVar",
                    default: 1.5
                },
                {
                    name: "Boolean",
                    type: "boolean",
                    variable: "booleanVar",
                    default: true
                }
                ],
            render: function( element, selections, attributeMap, parameterMap ) {
                // D3 code to render items
            }   
        }        
    };

ItemViewer = function( configuration ) {
    var self = this;

    self.configuration = configuration;
    self.uuid = Utilities.generateUuid();
    self.attributeMap = {};
    self.parameterMap = {};

    self.initializeParameterMap();
};

ItemViewer.prototype.initializeParameterMap = function() {
    var self = this;

    for ( var i = 0; i < self.configuration.parameters.length; ++i ) {
        var parameter = self.configuration.parameters[i];

        self.parameterMap[parameter.variable] = parameter.default;
    }    
}


ItemViewer.prototype.renderViewer = function( element, selections ) {
    var self = this;

    self.configuration.render( element, selections, self.attributeMap, self.parameterMap )
};


ItemViewer.prototype.renderEditor = function( element, attributes ) {
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

    for ( var i = 0; i < self.configuration.attributes.length; ++i ) {
        var attribute = self.configuration.attributes[i];
        var attributeEditor = editor.append( 'div' ).style( "margin-left", "10px");
        self.renderAttributeEditor( attributeEditor, attributes, attribute, self.attributeMap[attribute.variable] );
    }

    for ( var i = 0; i < self.configuration.parameters.length; ++i ) {
        var parameter = self.configuration.parameters[i];
        var parameterEditor = editor.append( 'div' ).style( "margin-left", "10px");
        self.renderParameterEditor( parameterEditor, parameter, self.parameterMap[parameter.variable] );
    }
};


ItemViewer.prototype.parseParameterValues = function() {
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

ItemViewer.prototype.parseParameterValue = function( parameterVariable, parameterType ) {
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

ItemViewer.prototype.renderParameterEditor = function( element, name, type, parameter, value ) {
    var self = this;
    var s = "";
    
    s += '<div data-item-viewer-parameter-type="' + parameter.type + '">';
    
    switch ( parameter.type ) {
        case 'float':
            s += parameter.name + ' ' + '<input data-item-viewer-parameter-variable="' + parameter.variable + '" type="number" step="0.1" value="' + d3.format('f')(value) + '"></input>';
            break;
        case 'integer':
            s +=  parameter.name + ' ' + '<input data-item-viewer-parameter-variable="' + parameter.variable + '" type="number" step="1" value="' + d3.format('d')(value) + '"></input>';
            break;
        case 'boolean':
            s +=  parameter.name + ' ' + '<input data-item-viewer-parameter-variable="' + parameter.variable + '" type="checkbox" ' + ( value ? "checked" : "" ) + '></input>';
            break;
        case 'string':
            // fall-through
        default:
            s += parameter.name + ' ' + '<input data-filter-parameter-variable="' + parameter.variable + '" type="text" value="' + value + '"></input>';
            break;
    }

    s += '</div>'; 

    // add to DOM
    element.html(s);

    // attach events ...
    // none right now
};


ItemViewer.prototype.renderAttributeEditor = function( element, attributes, attribute, value ) {
    var self = this;
    var s = "";
    
    s += '<div data-item-viewer-attribute-type="' + attribute.type + '">';
    
    s += '<b>' + attribute.name + '</b>' + '<select>';
    for ( var i = 0; i < attributes.length; ++i ) {
        if ( Attribute.matchesType( attributes[i].type, attribute.type ) ) {
            s += '<option value="' + i + '" >' + attributes[i].name + '</option>';
        }
    }
    s += "</select>";

    s += '</div>'; 

    // add to DOM
    element.html(s);

    // attach events ...
    // none right now
};
