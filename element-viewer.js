/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/

ElementViewerConfigurations = {
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
                    name: "Small Multiples?",
                    type: "boolean",
                    variable: "smallMultiples"
                }],
            render: function( element, selections, attributeMap, parameterMap ) {
                // D3 code to render elements
            }   
        },
        histogram: {
            name: "Histogram",
            attributes: [{
                    name: "Variable",
                    type: "numeric",
                    variable: "variable"                    
                }],
            parameters: [{
                    name: "Small Multiples?",
                    type: "boolean",
                    variable: "smallMultiples"
                }],
            render: function( element, selections, attributes, attributeMap, parameterMap ) {


                var attribute = attributes[attributeMap.variable];

                console.log( attribute );

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
                element.html("");

                console.log( element );

                var svg = d3.select("#element-vis-viewer").append("svg")
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
        testplot: {
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
        }        
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


ElementViewer.prototype.renderViewer = function( ) {
    var self = this;

    try {
        self.configuration.render( $( self.viewerElementId ), self.selections, self.attributes, self.attributeMap, self.parameterMap )
    }
    catch ( error ) {
        console.error( error );
    }
};


ElementViewer.prototype.renderEditor = function() {
    var self = this;

    var element = d3.select( self.editorElementId );
    element.html( "" );

    var editor = element.append('div').attr( 'id', 'element-viewer-editor-' + self.uuid );

    editor.html( '<div>' + 
        '<b>' + self.configuration.name +'</b>' + 
        '&nbsp;<span class="element-viewer-editor-button element-viewer-editor-save" data-viewer-uuid="' + self.uuid + '""><i class="fa fw fa-check"></i></span>' +
        '&nbsp;<span class="element-viewer-editor-button element-viewer-editor-cancel" data-viewer-uuid="' + self.uuid + '""><i class="fa fw fa-times"></i></span>' +
        '</div>');

    d3.selectAll( '.element-viewer-editor-save' ).on( 'click', function(event){
        self.parseParameterValues();
        self.parseAttributeValues();

        console.log (self.attributeMap)
        self.renderViewer();
    });

    d3.selectAll( '.element-viewer-editor-cancel' ).on( 'click', function(event){
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
            console.log( 'Replacing ' + parameters[i].variable + ' (' + parameters[i].type + ') = "' + self.parameterMap[parameters[i].variable] + '" with "' + value + '"' );
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
            console.log( 'Replacing ' + attributes[i].variable + ' = "' + self.attributeMap[attributes[i].variable] + '" with "' + value + '"' );
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
