/**
 * author: Alexander Lex - alex@seas.harvard.edu
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 * author: Hendrik Srtobelt - strobelt@seas.harvard.edu.
 * author: Romain Vuillemot - romain.vuillemot@gmail.com
 */

var dataSetDescriptions;




$.when( $.ajax( { url: 'datasets.json', dataType: 'json' } ) ).then( function( data, textStatus, jqXHR ) {
    loadDataSetDescriptions(data);
});


function loadDataSetDescriptions(dataSetList) {

    var descriptions = [];
    var descriptionDeferreds = [];

    // launch requests to load data set descriptions
    for ( var i = 0; i < dataSetList.length; ++i ) {        
        console.log( "Loading " + dataSetList[i] )

        descriptionDeferreds.push( 
            $.ajax( { url: dataSetList[i], dataType: 'json' } )
        );
    }

    // when all requests have finished, process the responses
    $.when.apply($, descriptionDeferreds).then(
        function(){ 
            for ( var j = 0; j < arguments.length; ++j ) {
                var description = arguments[j][0];

                // preprend data file path (based on path to description in data set list)
                description.file = dataSetList[j].substring(0, dataSetList[j].lastIndexOf('/')) + '/' + description.file;

                descriptions.push( description ); 
            }

            load(descriptions); 
        },
        function( object, status, error ) { 
            console.error( 'Unable to load ' + object.responseText );
            console.error( error.message );
        }
    );
}

function load(descriptions) {

    dataSetDescriptions = descriptions;

    // Variables from query string
    var queryParameters = {}, queryString = location.search.substring(1),
        re = /([^&=]+)=([^&]*)/g, m;

    // Creates a map with the query string parameters
    while (m = re.exec(queryString)) {
        queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }

    queryParameters['dataset'] = parseInt(queryParameters['dataset']) || 0;

    var header = d3.select('#header');
    
    header.append('div').html('&darr; # intersections.').attr({id: 'sortIntersect',
        class: 'myButton'});

    header.append('div').html('Group by set size.').attr({id: 'groupSetSize',
        class: 'myButton'});

    var dataSelect = header.append('div').text('Choose Dataset');

    var select = dataSelect.append('select');
    select.on('change', change)
        .selectAll('option').data(dataSetDescriptions).enter().append('option')
        .attr('value', function (d,i) {
            return i;
        })
        .attr('id', 'dataSetSelector')
        .text(function (d) {
            return d.name + ' ' + '(' + getNumberOfSets(d) + ' sets, ' + getNumberOfAttributes(d) + ' attributes' + ')';
        })
        .property('selected', function (d, i) {
            return (i === queryParameters['dataset'])
        });
        
    loadDataSet(queryParameters['dataset']);
}

function loadDataSet(index) {
    processDataSet(dataSetDescriptions[index]);
}


function processDataSet(dataSetDescription) {
    d3.text(dataSetDescription.file, 'text/csv', function(data){
        parseDataSet(data,dataSetDescription);
        run();
    });
}

function run() {
    setUpSubSets();
    setUpGroupings();
    updateState();
    plot();
    plotSetSelection();
}


function getNumberOfSets(dataSetDescription) {
    var sets = 0;

    for ( var i = 0; i < dataSetDescription.sets.length; ++i ) {
        var setDefinitionBlock = dataSetDescription.sets[i];

        if ( setDefinitionBlock.format === 'binary') {
            sets += setDefinitionBlock.end - setDefinitionBlock.start + 1; 
        }
        else {
            console.error( 'Set definition format "' + setDefinitionBlock.format + '" not supported' );
        }
    }

    return ( sets );
}

function getNumberOfAttributes(dataSetDescription) {
    return ( dataSetDescription.meta.length );
}

function getIdColumn(dataSetDescription) {
    for ( var i = 0; i < dataSetDescription.meta.length; ++i ) {
        if ( dataSetDescription.meta[i].type === "id" ) {
            return dataSetDescription.meta[i].index;
        }
    }

    // id column not defined, assume 0
    return 0;
}


function parseDataSet(data,dataSetDescription) {

    var dsv = d3.dsv( dataSetDescription.separator, 'text/plain');

    // the raw set arrays
    var rawSets = [];
    var setNames = [];

    var file = dsv.parseRows(data);

    // the names of the sets are in the columns
    var header = file[dataSetDescription.header];

    // remove header
    file.splice(dataSetDescription.header, 1);

    // load set assignments
    var processedSetsCount = 0;
    for ( var i = 0; i < dataSetDescription.sets.length; ++i ) {
        var setDefinitionBlock = dataSetDescription.sets[i];

        if ( setDefinitionBlock.format === 'binary') {
            var setDefinitionBlockLength = setDefinitionBlock.end - setDefinitionBlock.start + 1; 

            // initialize the raw set arrays
            for ( var setCount = 0; setCount < setDefinitionBlockLength; ++setCount ) {
                rawSets.push(new Array());
            }        

            var rows = file.map( function (row, rowIndex) {
                return row.map( function (value, columnIndex) {

                    if ( columnIndex >= setDefinitionBlock.start && columnIndex <= setDefinitionBlock.end ) {
                        var intValue = parseInt(value, 10);
                        
                        if ( isNaN(intValue) ) {                            
                            console.error( 'Unable to convert "' + value + '" to integer (row ' + rowIndex + ', column ' + columnIndex + ')' );
                        }

                        return intValue;
                    }

                    return null;
                });
            });

            // iterate over columns defined by this set definition block
            for (var r = 0; r < rows.length; r++) {
                
                // increment number of items in data set
                allItems.push(depth++);
                
                for ( var s = 0; s < setDefinitionBlockLength; ++s ) {
                    rawSets[processedSetsCount+s].push(rows[r][setDefinitionBlock.start+s]);

                    if ( r === 1 ) {
                        setNames.push( header[setDefinitionBlock.start+s] );
                    }
                }
            }

            processedSetsCount += setDefinitionBlockLength;
        }
        else {
            console.error( 'Set definition format "' + setDefinitionBlock.format + '" not supported' );
        }
    }

    // initialize attribute data structure
    attributes.length = 0;
    for ( var i = 0; i < dataSetDescription.meta.length; ++i ) {
        var metaDefinition = dataSetDescription.meta[i];

        attributes.push({
            name: metaDefinition.name || header[metaDefinition.index],
            type: metaDefinition.type,
            values: [],
            sort: 1,
        });
    }    

    // add implicit attributes
    var setCountAttribute = {
        name: 'Set Count',
        type: 'integer',
        values: [],
        sort: 1,
        min: 0
    };

    for ( var d = 0; d < depth; ++d ) {
        var setCount = 0;
        for (var s = 0; s < rawSets.length; s++ ) {
            setCount += rawSets[s][d];
        }
        setCountAttribute.values[d] = setCount;
    }
    attributes.push(setCountAttribute);

    var setsAttribute = {
        name: 'Sets',
        type: 'sets',
        values: [],
        sort: 1,
    };

    for ( var d = 0; d < depth; ++d ) {
        var setList = [];
        for (var s = 0; s < rawSets.length; s++ ) {
            if ( rawSets[s][d] === 1 ) {
                setList.push( Math.floor( Math.pow(2,s) ) );
            }
        }
        setsAttribute.values[d] = setList;
    }
    attributes.push(setsAttribute);

    // load meta data    
    for ( var i = 0; i < dataSetDescription.meta.length; ++i ) {
        var metaDefinition = dataSetDescription.meta[i];

        attributes[i].values = file.map( function (row, rowIndex) {
                var value = row[metaDefinition.index];
                switch ( metaDefinition.type ) {
                    case 'integer':
                        var intValue = parseInt(value, 10);                
                        if ( isNaN(intValue) ) {                            
                            console.error( 'Unable to convert "' + value + '" to integer.' );
                            return NaN;
                        }
                        return intValue;
                    case 'float':
                        var floatValue = parseFloat(value, 10);                
                        if ( isNaN(floatValue) ) {                            
                            console.error( 'Unable to convert "' + value + '" to float.' );
                            return NaN;
                        }
                        return floatValue;
                    case 'id':
                        // fall-through
                    case 'string':
                        // fall-through
                    default:
                        return value;  
                }

            });            
    }

    // add meta data summary statistics
    for ( var i = 0; i < attributes.length; ++i ) {

        if ( attributes[i].type === "float" || attributes[i].type === "integer" ) {            
            // explictly defined attributes might have user-defined ranges
            if ( i < dataSetDescription.meta.length ) {            
                attributes[i].min = dataSetDescription.meta[i].min || Math.min.apply( null, attributes[i].values );
                attributes[i].max = dataSetDescription.meta[i].max || Math.max.apply( null, attributes[i].values );                            
            }
            // implicitly defined attributes
            else {
                attributes[i].min = attributes[i].min || Math.min.apply( null, attributes[i].values );
                attributes[i].max = attributes[i].max || Math.max.apply( null, attributes[i].values );                            
            }
        }
    }   

    var setID = 1;
    for (var i = 0; i < rawSets.length; i++) {
        var combinedSets = Array.apply(null, new Array(rawSets.length)).map(Number.prototype.valueOf, 0);
        combinedSets[i] = 1;
        var set = new Set(setID, setNames[i], combinedSets, rawSets[i]);
        setID = setID << 1;
        sets.push(set);
        if (i < nrDefaultSets) {
            set.isSelected = true;
            usedSets.push(set);
        }
    }
}

function setUpSubSets() {

    combinations = Math.pow(2, usedSets.length) - 1;

    for (var i = 1; i <= combinations; i++) {
        makeSubSet(i)
    }

    renderRows = subSets.slice(0);

    // sort by size of set overlap
//    renderRows.sort(function (a, b) {
//        return b.setSize - a.setSize;
//    });

}

function setUpGroupings()
{
    groupBySetSize();


}

function change() {
    sets.length = 0;
    subSets.length = 0;
    usedSets.length = 0;
    renderRows.length = 0;
    depth = 0;
    loadDataSet(this.options[this.selectedIndex].value);
    history.replaceState({}, 'Upset', window.location.origin + window.location.pathname + '?dataset=' + this.selectedIndex);
}

function updateSetContainment(set) {
    if (!set.isSelected) {
        set.isSelected = true;
        usedSets.push(set);
    }
    else {
        set.isSelected = false;

        var index = usedSets.indexOf(set);
        if (index > -1) {
            usedSets.splice(index, 1);
        }
    }
    subSets.length = 0;
    renderRows.length = 0;
    setUpSubSets();
    setUpGroupings();
    updateState();
    plot();
    plotSetSelection();

}

function addSet(set) {

}

function removeSet(set) {
    console.log('Not implemented');
}
