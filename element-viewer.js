/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/

ElementViewerConfigurations = {
        variantFrequency: {
            name: "Transition/Transversion Ratio",
            attributes: [{
                    name: "Reference Allele",
                    type: "string",
                    variable: "reference"
                },
                {
                    name: "Alternative Allele",
                    type: "string",
                    variable: "alternative"
                }],
            parameters: [],
            render: function( elementId, selections, attributes, attributeMap, parameterMap ) {
                var data = [];

                var attributeReference = attributes[attributeMap.reference];
                var attributeAlternative = attributes[attributeMap.alternative];

                // create data structure: array of pair arrays for each selection
                for ( var s = 0; s < selections.getSize(); ++s ) {

                    var values =
                        [
                            [0,0,0,0], //A -> A, C, G, T
                            [0,0,0,0], //C -> A, C, G, T
                            [0,0,0,0], //G -> A, C, G, T
                            [0,0,0,0]  //T -> A, C, G, T 
                        ];

                    var transitions = 0;
                    var transversions = 0;

                    var nucleotideIndexMap = { A: 0, C: 1, G: 2, T: 3 };

                    var selection = selections.getSelection(s);

                    for ( var i = 0; i < selection.items.length; ++i ) {
                        var referenceIndex = nucleotideIndexMap[attributeReference.values[selection.items[i]]];
                        var alternativeIndex = nucleotideIndexMap[attributeAlternative.values[selection.items[i]]];
                        values[referenceIndex][alternativeIndex] += 1;

                        var change = attributeReference.values[selection.items[i]] + attributeAlternative.values[selection.items[i]];

                        if ( change === "AG" || change === "GA" || change === "CT" || change === "TC" ) {
                            transitions += 1;
                        }
                        else {
                            transversions += 1;
                        }

                    }

                    values.color = selections.getColor( selection );
                    values.transitions = transitions;
                    values.transversions = transversions;

                    data.push( values );
                }      
                
                d3.select( elementId ).html( "" );
                var viewer = d3.select( elementId ); 

                viewer.selectAll( 'p' )
                        .data( data )
                    .enter()
                        .append( 'p' )
                        .html( function( d ) {  return ( 'ti/tv = ' + ( d.transitions / d.transversions ) + ' (' + d.transitions + '/' + d.transversions + ')' ); } )
                        .style( "color", function( d ) { return ( d.color ); } );
            }
        },
        scatterplot: {
            name: "Scatterplot",
            attributes: [{
                    name: "x",
                    type: "numeric",
                    variable: "x"
                },
                {
                    name: "y",
                    type: "numeric",
                    variable: "y"
                }],
            parameters: [{
                    name: "Log Scale X",
                    type: "boolean",
                    variable: "logScaleX",
                    default: false
                },
                {
                    name: "Log Scale Y",
                    type: "boolean",
                    variable: "logScaleY",
                    default: false
                }],
            render: function( elementId, selections, attributes, attributeMap, parameterMap ) {
                // based on http://bl.ocks.org/bunkat/2595950

                var data = [];

                var attributeX = attributes[attributeMap.x];
                var attributeY = attributes[attributeMap.y];

                // create data structure: array of pair arrays for each selection
                for ( var s = 0; s < selections.getSize(); ++s ) {

                    var values = [];
                    var selection = selections.getSelection(s);

                    for ( var i = 0; i < selection.items.length; ++i ) {
                        values.push( [ attributeX.values[selection.items[i]], attributeY.values[selection.items[i]]] );
                    }

                    values.color = selections.getColor( selection );

                    data.push( values );
                }
                   
                var margin = {top: 10, right: 10, bottom: 20, left: 50},
                    width = 300 - margin.left - margin.right,
                    height = 200 - margin.top - margin.bottom;
                    
                console.log( parameterMap );

                var x;

                if ( parameterMap.logScaleX ) {
                    x = d3.scale.log()
                        .domain([attributeX.min, attributeX.max])
                        .range([0, width]);                    
                } 
                else {
                    x = d3.scale.linear()
                        .domain([attributeX.min, attributeX.max])
                        .range([0, width]);                    
                }

                var y;

                if ( parameterMap.logScaleY ) {            
                    y = d3.scale.log()
                        .domain([attributeY.min, attributeY.max])
                        .range([ height, 0 ]);
                }
                else {            
                    y = d3.scale.linear()
                        .domain([attributeY.min, attributeY.max])
                        .range([ height, 0 ]);
                }
             
                d3.select( elementId ).html("");

                var chart = d3.select( elementId )
                .append('svg:svg')
                .attr('width', width + margin.right + margin.left)
                .attr('height', height + margin.top + margin.bottom)
                .attr('class', 'chart')

                var main = chart.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'main')   
                    
                // draw the x axis
                var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom');

                main.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .attr('class', 'main axis date')
                .call(xAxis);

                // draw the y axis
                var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left');

                main.append('g')
                .attr('transform', 'translate(0,0)')
                .attr('class', 'main axis date')
                .call(yAxis);

                var g = main.append("svg:g"); 
                
                var selectionGroup = g.selectAll( '.selection-group' )
                    .data(data)
                  .enter()
                    .append( 'g' )
                    .attr( 'class', '.selection-group' )
                    .attr("fill", function(d) {  return ( d.color ); } );

                var marks = selectionGroup.selectAll( '.element-mark' )
                        .data( function( d ) { return ( d ); } )
                    .enter()
                        .append("svg:circle")
                            .attr("cx", function (d,i) { return x(d[0]); } )
                            .attr("cy", function (d,i) { return y(d[1]); } )
                            .attr("r", 2);                
            }   
        },
        histogram: {
            name: "Histogram",
            attributes: [{
                    name: "Variable",
                    type: "numeric",
                    variable: "variable"                    
                }],
            parameters: [/*{
                    name: "Small Multiples?",
                    type: "boolean",
                    variable: "smallMultiples"
                }*/],
            render: function( elementId, selections, attributes, attributeMap, parameterMap ) {

                var attribute = attributes[attributeMap.variable];

                // A formatter for counts.
                var format = d3.format(".00r");
                
                if ( attribute.type === "float" ) {
                    format = d3.format(",.00r");
                }
                if ( attribute.type === "integer" ) {
                    format = d3.format("d");
                }

                var margin = {top: 0, right: 10, bottom: 20, left: 10},
                    width = 300 - margin.left - margin.right,
                    height = 200 - margin.top - margin.bottom;

                var x = d3.scale.linear()
                    .domain([attribute.min, attribute.max])
                    .range([0, width]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                // clear
                d3.select( elementId ).html("");

                var svg = d3.select( elementId ).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var histograms = [];

                // for each selection
                for ( var s = 0; s < selections.getSize(); ++s ) {

                    var values = [];
                    var selection = selections.getSelection(s);

                    for ( var i = 0; i < selection.items.length; ++i ) {
                        values.push( attribute.values[selection.items[i]] );
                    }

                    // Generate a histogram using twenty uniformly-spaced bins.
                    var histogram = d3.layout.histogram()
                        .frequency(false)
                        .bins(x.ticks(20))
                        (values);

                    // interleave by shifting bar positions and adjusting bar widths
                    for ( var i = 0; i < histogram.length; ++i ) {
                        histogram[i].color = selections.getColor( selection );
                        histogram[i].dx = histogram[i].dx/selections.getSize();
                        histogram[i].x = histogram[i].x + s*histogram[i].dx
                    }

                    histograms.push( histogram );
                }

                var y = d3.scale.linear()
                    .domain([0, d3.max(histograms, function(histogram) { return d3.max( histogram, function(d) { return d.y; } ); })])
                    .range([height, 0]);

                var histogram = svg.selectAll(".histogram")
                        .data( histograms )
                    .enter().append("g")
                        .attr("class", "histogram");

                var bar = histogram.selectAll(".bar")   
                        .data( function( d ) { return ( d ); } )
                    .enter().append("g")
                        .attr("class", "bar")
                        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
                
                bar.append("rect")
                    .attr("x", 1)
                    .attr("width", function(d) { return x(d.dx+attribute.min) - 1; }) //x(histograms[0].dx+attribute.min) - 1
                    .attr("height", function(d) { return height - y(d.y); })
                    .style('fill-opacity', 0.75 )
                    .style('fill', function(d){ return (d.color) } );

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
            }
        },
        /*testplot: {
            name: "Testplot",
            attributes: [{
                    name: "x-axis",
                    type: "numeric",
                    variable: "xAxis"
                },
                {
                    name: "y-axis",
                    type: "numeric",
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
                // D3 code to render elements
            }   
        }*/        
    };


$(EventManager).bind("element-viewer-removed", function (event, data) {
});


$(EventManager).bind("element-viewer-added", function (event, data) {
});


$(EventManager).bind("element-viewer-activated", function (event, data) {
    elementViewers.renderViewer();
});


ElementViewerCollection = function( controllerElementId, viewerElementId ) {
    var self = this;

    self.list = [];
    self.activeIndex = undefined;

    self.controllerElementId = controllerElementId;
    self.viewerElementId = viewerElementId;
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

    //var dataSelect = d3.select("#dataset-selector").append('div').text('Choose Dataset');

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

    // create header and controls
    var viewerElementHeader = controllerElement.append( "div" ).attr( "class", "element-viewer-header" );

    viewerElementHeader.append( "div" )
            .attr( "class", "element-viewer-editor-button" )
            .attr( "id", "element-viewer-previous" )
            .on( "click", function() {
                self.activatePrevious();
            })
        .append( "i" ).
            attr( "class", "fa fw fa-arrow-left" );

    viewerElementHeader.append( "div" )
            .attr( "class", "element-viewer-editor-button" )
            .attr( "id", "element-viewer-next" )
            .on( "click", function() {
                self.activateNext();
            })
        .append( "i" ).
            attr( "class", "fa fw fa-arrow-right" );

    viewerElementHeader.append( "div" )
            .attr( "class", "element-viewer-editor-button" )
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

    viewerElementHeader.append( "div" )
            .attr( "class", "element-viewer-editor-button" )
            .attr( "id", "element-viewer-edit" )
            .on( "click", function() {
                self.renderViewer( true );
            })
        .append( "i" ).
            attr( "class", "fa fw fa-pencil" );

    viewerElementHeader.append( "div" )
            .attr( "class", "element-viewer-editor-button" )
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
        viewerElement.append( "div" ).attr( "class", "element-viewer-message" ).text( "No viewer available!" );

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


ElementViewer = function( attributes, selections, configuration, editorElementId, viewerElementId  ) {
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
        '&nbsp;<span class="element-viewer-editor-button element-viewer-editor-save" data-viewer-uuid="' + self.uuid + '""><i class="fa fw fa-check"></i></span>' +
        '&nbsp;<span class="element-viewer-editor-button element-viewer-editor-cancel" data-viewer-uuid="' + self.uuid + '""><i class="fa fw fa-times"></i></span>' +
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
            s +=  parameter.name + ' ' + '<input data-element-viewer-parameter-variable="' + parameter.variable + '" type="checkbox" checked="' + ( value ? 'checked' : '' ) + '"></input>';
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
