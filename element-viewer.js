/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/

var ElementViewerConfigurations = {
    scatterplot: scatterplotConfiguration,
    histogram: histogramConfiguration,
    wordCloud: wordCloudConfiguration,
    variantFrequency: variantFrequencyConfiguration,
};


$(EventManager).bind("element-viewer-removed", function (event, data) {
});


$(EventManager).bind("element-viewer-added", function (event, data) {
});


$(EventManager).bind("element-viewer-activated", function (event, data) {
    elementViewers.renderViewer();
});


var ElementViewerCollection = function( controllerElementId, viewerElementId ) {
    var self = this;

    self.list = [];
    self.activeIndex = undefined;

    self.controllerElementId = controllerElementId;
    self.viewerElementId = viewerElementId;
};

ElementViewerCollection.prototype.reset = function() {
    var self = this;

    self.list = [];
    self.activeIndex = undefined;
};



ElementViewerCollection.prototype.add = function( elementViewer, isActive ) {
    var self = this;

    isActive = isActive | false;

    self.list.push( elementViewer );

    $(EventManager).trigger("element-viewer-added", { viewer: elementViewer });

    if ( isActive ) {
        self.setActiveIndex( self.list.length - 1 );
    }
};


ElementViewerCollection.prototype.remove = function( elementViewer ) {
    var self = this;

    for ( var i = 0; i < self.list.length; ++i ) {
        if ( self.list[i].uuid === elementViewer.uuid ) {
            self.list.splice(i, 1);

            $(EventManager).trigger("element-viewer-removed", { viewer: elementViewer });

            if ( i === self.activeIndex ) {
                if (self.list.length > 0) {
                    self.setActiveIndex( i - 1 );
                }
                else {
                    self.setActiveIndex(undefined);
                }
            }
        }
    }
};


ElementViewerCollection.prototype.activateNext = function() {
    var self = this;

    if ( self.activeIndex < self.list.length - 1 ) {
        self.setActiveIndex( self.activeIndex + 1 );
    }
    else if ( self.activeIndex === self.list.length -1 ) {
        self.setActiveIndex( 0 );
    }
    else {
        self.setActiveIndex( undefined );
    }
};

ElementViewerCollection.prototype.activatePrevious = function() {
    var self = this;

    if ( self.activeIndex > 0 ) {
        self.setActiveIndex( self.activeIndex - 1 );
    }
    else if ( self.activeIndex === 0 ) {
        self.setActiveIndex( self.list.length - 1 );
    }
    else {
        self.setActiveIndex( undefined );
    }
};


ElementViewerCollection.prototype.getIndex = function( elementViewer ) {
    var self = this;

    for ( var i = 0; i < self.list.length; ++i ) {
        if ( this.list[i].uuid === elementViewer.uuid ) {
            return ( i );
        }
    }

    return ( undefined );
};


ElementViewerCollection.prototype.setActiveIndex = function( index ) {
    var self = this;

    if ( index < self.list.length && index >= 0 && self.activeIndex !== index ) {
        self.activeIndex = index;

        $(EventManager).trigger("element-viewer-activated", { viewer: self.list[self.activeIndex], index: index });
    }
};


ElementViewerCollection.prototype.setActive = function( elementViewer ) {
    var self = this;

    var index = self.getIndex( elementViewer );

    if ( index ) {
        self.setActiveIndex( index );
    }

    return ( index );
};


ElementViewerCollection.prototype.getActive = function() {
    var self = this;

    if ( self.activeIndex === undefined ) {
        return undefined;
    }

    return ( self.list[self.activeIndex] );
};

// render the controller (i.e. list of viewers that can be added and a "new" button)
ElementViewerCollection.prototype.renderController = function() {
    var self = this;
    var controllerElement = d3.select( self.controllerElementId );

    controllerElement.html("");

    // create header and controls
    var viewerElementHeaderLeft = controllerElement.append( "div" ).attr( "class", "element-viewer-header" );

    viewerElementHeaderLeft.append( "div" )
            .attr( "class", "element-viewer-editor-button level-1-button" )
            .attr( "id", "element-viewer-add" )
            .on( "click", function() {
                var selector = document.getElementById( 'element-viewer-selector' );
                var elementViewerConfiguration = selector.options[selector.selectedIndex].__data__;
                var elementViewer = new ElementViewer( attributes, selections, elementViewerConfiguration );
                self.add( elementViewer );
                var index = self.getIndex( elementViewer );
                self.activeIndex = index;
                self.renderViewer( true );
            })
        .append( "i" ).
            attr( "class", "fa fw fa-plus" );

    var select = controllerElement.append('select');

    // convert ElementViewerConfiguration into array
    var viewerConfigurationList = $.map(ElementViewerConfigurations, function(value, index) {
        return [value];
    });

    select.attr('id', 'element-viewer-selector')
        .selectAll('option')
            .data( viewerConfigurationList )
        .enter()
            .append('option')
            .attr('value', function (d, i) {
                return i;
            })
        .text(function (d) {
            return d.name;
        });

    var viewerElementHeaderRight = controllerElement.append( "div" ).attr( "class", "element-viewer-header" );

    viewerElementHeaderRight.append( "div" )
            .attr( "class", "element-viewer-editor-button level-1-button" )
            .attr( "id", "element-viewer-previous" )
            .on( "click", function() {
                self.activatePrevious();
            })
        .append( "i" ).
            attr( "class", "fa fw fa-arrow-left" );

    viewerElementHeaderRight.append( "div" )
            .attr( "class", "element-viewer-editor-button level-1-button" )
            .attr( "id", "element-viewer-next" )
            .on( "click", function() {
                self.activateNext();
            })
        .append( "i" ).
            attr( "class", "fa fw fa-arrow-right" );


    viewerElementHeaderRight.append( "div" )
            .attr( "class", "element-viewer-editor-button level-1-button" )
            .attr( "id", "element-viewer-edit" )
            .on( "click", function() {
                self.renderViewer( true );
            })
        .append( "i" ).
            attr( "class", "fa fw fa-pencil" );

    viewerElementHeaderRight.append( "div" )
            .attr( "class", "element-viewer-editor-button level-1-button" )
            .attr( "id", "element-viewer-remove" )
            .on( "click", function() {
                self.remove( self.getActive() );
                self.renderViewer();
            })
        .append( "i" ).
            attr( "class", "fa fw fa-times-circle" );

};

// render the active viewer
ElementViewerCollection.prototype.renderViewer = function( showEditor ) {
    var self = this;

    var viewerElement = d3.select( self.viewerElementId );

    // clear element
    viewerElement.html("");
    viewerElement = viewerElement.append( "div" ).attr( "class", "element-viewer-active" );

    // check if there is a viewer
    if ( self.list.length === 0 ) {
        viewerElement.append( "div" ).attr( "class", "info-message" ).html( 'No visualizations configured. Click <i class="fa fw fa-plus"></i> button to add a new visualization.' );

        return self;
    }

    // if no active viewer is set, use the first one in the list
    if ( self.activeIndex === undefined ) {
        self.activeIndex = 0;
    }

    // === render active viewer ===

    // create viewer
    var id = "element-viewer-" + self.getActive().uuid;

    // create element and render viewer
    viewerElement.append( "div" ).attr( "id", id );

    if ( !showEditor ) {
        self.getActive().renderViewer( '#' + id );
    }
    else {
        self.getActive().renderEditor( '#' + id );
    }

    return self;
};


var ElementViewer = function( attributes, selections, configuration, editorElementId, viewerElementId  ) {
    var self = this;

    self.attributes = attributes;
    self.selections = selections;
    self.editorElementId = editorElementId;
    self.viewerElementId = viewerElementId;
    self.configuration = configuration;
    self.uuid = Utilities.generateUuid();
    self.attributeMap = {};
    self.parameterMap = {};

    self.initializeParameterMap();
};

ElementViewer.prototype.initializeParameterMap = function() {
    var self = this;

    for ( var i = 0; i < self.configuration.parameters.length; ++i ) {
        var parameter = self.configuration.parameters[i];

        self.parameterMap[parameter.variable] = parameter.default;
    }
}


ElementViewer.prototype.renderViewer = function( viewerElementId ) {
    var self = this;

    viewerElementId = viewerElementId || self.viewerElementId;

    try {
        self.configuration.render( viewerElementId, self.selections, self.attributes, self.attributeMap, self.parameterMap )
    }
    catch ( error ) {
        console.error( error );
    }
};


ElementViewer.prototype.renderEditor = function( editorElementId ) {
    var self = this;

    editorElementId = editorElementId || self.editorElementId;

    var element = d3.select( editorElementId );

    element.html( "" );

    var editor = element.append('div').attr( 'id', 'element-viewer-editor-' + self.uuid );

    editor.html( '<div>' +
        '<div class="element-viewer-title">' + self.configuration.name +'</div>' +
        '&nbsp;<span class="element-viewer-editor-button level-2-button element-viewer-editor-save" data-viewer-uuid="' + self.uuid + '""><i class="fa fw fa-check"></i></span>' +
        '&nbsp;<span class="element-viewer-editor-button level-2-button element-viewer-editor-cancel" data-viewer-uuid="' + self.uuid + '""><i class="fa fw fa-times"></i></span>' +
        '</div>');

    d3.selectAll( '.element-viewer-editor-save' ).on( 'click', function(event){
        // parse changes, then render the viewer
        self.parseParameterValues();
        self.parseAttributeValues();

        self.renderViewer( editorElementId );
    });

    d3.selectAll( '.element-viewer-editor-cancel' ).on( 'click', function(event){
        // ignore changes, just render the viewer
        self.renderViewer( editorElementId );
    });

    for ( var i = 0; i < self.configuration.attributes.length; ++i ) {
        var attribute = self.configuration.attributes[i];
        var attributeEditor = editor.append( 'div' ).style( "margin-left", "10px");
        self.renderAttributeEditor( attributeEditor, self.attributes, attribute, self.attributeMap[attribute.variable] );
    }

    for ( var i = 0; i < self.configuration.parameters.length; ++i ) {
        var parameter = self.configuration.parameters[i];
        var parameterEditor = editor.append( 'div' ).style( "margin-left", "10px");
        self.renderParameterEditor( parameterEditor, parameter, self.parameterMap[parameter.variable] );
    }
};


ElementViewer.prototype.parseParameterValues = function() {
    var self = this;
    var parameters = self.configuration.parameters;

    for ( var i = 0; i < parameters.length; ++i ) {
        var value = self.parseParameterValue( parameters[i].variable, parameters[i].type );

        if ( value !== undefined ) {
            //console.log( 'Replacing ' + parameters[i].variable + ' (' + parameters[i].type + ') = "' + self.parameterMap[parameters[i].variable] + '" with "' + value + '"' );
            self.parameterMap[parameters[i].variable] = value;
        }
    }
}

ElementViewer.prototype.parseAttributeValues = function() {
    var self = this;
    var attributes = self.configuration.attributes;

    for ( var i = 0; i < attributes.length; ++i ) {
        var value = self.parseAttributeValue( attributes[i].variable );

        if ( value !== undefined ) {
            //console.log( 'Replacing ' + attributes[i].variable + ' = "' + self.attributeMap[attributes[i].variable] + '" with "' + value + '"' );
            self.attributeMap[attributes[i].variable] = value;
        }
    }
}

ElementViewer.prototype.parseParameterValue = function( parameterVariable, parameterType ) {
    var editor = d3.select('#element-viewer-editor-' + self.uuid );
    if ( editor.length === 0 ) {
        return undefined;
    }

    var value = undefined;

    switch ( parameterType ) {
        case 'float':
            var editor = $('[data-element-viewer-parameter-variable="' + parameterVariable + '"]' );
            value = parseFloat( $( editor ).val() );
            break;
        case 'integer':
            var editor = $('[data-element-viewer-parameter-variable="' + parameterVariable + '"]' );
            value = parseInt( $( editor ).val(), 10 );
            break;
        case 'boolean':
            var editor = $('[data-element-viewer-parameter-variable="' + parameterVariable + '"]' );
            value = Boolean( $( editor ).is( ':checked' ) );
            break;
        case 'string':
            // fall-through
        default:
            var editor = $('[data-element-viewer-parameter-variable="' + parameterVariable + '"]' );
            value = $( editor ).val();
            break;
    }

    return ( value );
}


ElementViewer.prototype.parseAttributeValue = function( attributeVariable ) {
    var editor = d3.select('#element-viewer-editor-' + self.uuid );
    if ( editor.length === 0 ) {
        return undefined;
    }

    var value = undefined;

    editor = $('[data-element-viewer-attribute-variable="' + attributeVariable + '"]' );

    value = parseInt( $( editor ).val(), 10 );

    return ( value );
}


ElementViewer.prototype.renderParameterEditor = function( element, parameter, value ) {
    var self = this;
    var s = "";

    s += '<div data-element-viewer-parameter-type="' + parameter.type + '">';

    switch ( parameter.type ) {
        case 'float':
            s += parameter.name + ' ' + '<input data-element-viewer-parameter-variable="' + parameter.variable + '" type="number" step="0.1" value="' + d3.format('f')(value) + '"></input>';
            break;
        case 'integer':
            s +=  parameter.name + ' ' + '<input data-element-viewer-parameter-variable="' + parameter.variable + '" type="number" step="1" value="' + d3.format('d')(value) + '"></input>';
            break;
        case 'boolean':
            s +=  parameter.name + ' ' + '<input data-element-viewer-parameter-variable="' + parameter.variable + '" type="checkbox" ' + ( value ? 'checked' : '' ) + '></input>';
            break;
        case 'string':
            // fall-through
        default:
            s += parameter.name + ' ' + '<input data-element-viewer-parameter-variable="' + parameter.variable + '" type="text" value="' + value + '"></input>';
            break;
    }

    s += '</div>';

    // add to DOM
    element.html(s);

    // attach events ...
    // none right now
};


ElementViewer.prototype.renderAttributeEditor = function( element, attributes, attribute, value ) {
    var self = this;
    var s = "";

    s += '<div data-element-viewer-attribute-type="' + attribute.type + '">';

    s += '<b>' + attribute.name + '</b>' + '<select data-element-viewer-attribute-variable="' + attribute.variable +'">';
    for ( var i = 0; i < attributes.length; ++i ) {
        if ( Attribute.matchesType( attributes[i].type, attribute.type ) ) {
            if ( value && value === i ) {
                s += '<option value="' + i + '" selected>' + attributes[i].name + '</option>';
            }
            else {
                s += '<option value="' + i + '">' + attributes[i].name + '</option>';
            }
        }
    }
    s += "</select>";
    s += '</div>';

    // add to DOM
    element.html(s);

    // attach events ...
    // none right now
};
