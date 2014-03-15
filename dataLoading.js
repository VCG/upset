/**
 * author: Alexander Lex - alex@seas.harvard.edu
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 * author: Hendrik Srtobelt - strobelt@seas.harvard.edu
 * author: Romain Vuillemot - romain.vuillemot@gmail.com
 */

var dataSetDescriptions, queryParameters = {};;

retrieveQueryParameters();

$.when($.ajax({ url: 'datasets.json', dataType: 'json' })).then(
    function (data, textStatus, jqXHR) {
        loadDataSetDescriptions(data);
    },
    function(data, textStatus, jqXHR) {
        console.error( 'Error loading "' + this.url + '".' );
    });


function loadDataSetDescriptions(dataSetList) {

    var descriptions = [];
    var descriptionDeferreds = [];

    // launch requests to load data set descriptions
    for (var i = 0; i < dataSetList.length; ++i) {
        console.log("Loading " + dataSetList[i])

        var deferred = $.ajax({ url: dataSetList[i], dataType: 'json', async: false })
            .success(function(response) {
                var description = response; //deferred.responseJSON;

                // preprend data file path (based on path to description in data set list)
                description.file = dataSetList[i].substring(0, dataSetList[i].lastIndexOf('/')) + '/' + description.file;

                descriptions.push(description);                
            });
    }

    load(descriptions);
}

var setUpConfiguration = function () {

    var maxCardSpinner = document.getElementById('maxCardinality');
    var minCardSpinner = document.getElementById('minCardinality');


    var updateCardinality = function (e) {

        UpSetState.maxCardinality = maxCardSpinner.value;
        UpSetState.minCardinality = minCardSpinner.value;
        UpSetState.forceUpdate = true;
        run();
    };

    maxCardSpinner.addEventListener('input', updateCardinality);
    minCardSpinner.addEventListener('input', updateCardinality);

    var hideEmptiesCheck = document.getElementById('hideEmpties');

    var hideEmptiesFu = function (e) {
        UpSetState.hideEmpties = hideEmptiesCheck.checked;
        updateState();
        // TODO: need to call updateTransition instead, but this needs to be exposed first
        plot();
        plotSetOverview();
    };
    hideEmptiesCheck.addEventListener('click', hideEmptiesFu);

    var dataSelect = d3.select("#dataset-selector").append('div').text('Choose Dataset');

    var select = dataSelect.append('select');
    select.on('change', change)
        .selectAll('option').data(dataSetDescriptions).enter().append('option')
        .attr('value', function (d, i) {
            return i;
        })
        .attr('id', 'dataSetSelector')
        .text(function (d) {
            return d.name + ' ' + '(' + getNumberOfSets(d) + ' sets, ' + getNumberOfAttributes(d) + ' attributes' + ')';
        })
        .property('selected', function (d, i) {
            return (i === queryParameters['dataset'])
        });
}

function retrieveQueryParameters() {

    // Variables from query string
    var queryString = location.search.substring(1),
        re = /([^&=]+)=([^&]*)/g, m;

    // Creates a map with the query string parameters
    while (m = re.exec(queryString)) {
        queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }

    queryParameters['dataset'] = parseInt(queryParameters['dataset']) || 0;
    queryParameters['duration'] = queryParameters['duration'] || 1000;
    queryParameters['orderBy'] = queryParameters['orderBy'] || "subsetSize"; // deviation, intersection, specific set
    queryParameters['grouping'] = queryParameters['grouping'] == "undefined" ? undefined : queryParameters['grouping'] || "groupBySet"; // groupByIntersectionSize, 
    queryParameters['selection'] = queryParameters['selection'] || "";
    // Missing item space query..

}

function updateQueryParameters() {
    var urlQueryString = "";
    if (Object.keys(queryParameters).length > 0) {
        urlQueryString = "?";
        for (var q in queryParameters)
            urlQueryString += (q + "=" + queryParameters[q]) + "&";
        urlQueryString = urlQueryString.substring(0, urlQueryString.length - 1);
    }

    history.replaceState({}, 'Upset', window.location.origin + window.location.pathname + urlQueryString);
}

function load(descriptions) {

    dataSetDescriptions = descriptions;
    setUpConfiguration();
    loadDataSet(queryParameters['dataset']);
}

function loadDataSet(index) {
    processDataSet(dataSetDescriptions[index]);
}

function processDataSet(dataSetDescription) {
    d3.text(dataSetDescription.file, 'text/csv', function (data) {
        parseDataSet(data, dataSetDescription);
        run();
    });
}

function clearSelections() {
    selections = new SelectionList();
}

function createInitialSelection() {
    var selection = new Selection(allItems);
    var filterList = [];

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
    selections.setActive(selection);
}

function run() {
    setUpSubSets();
    // setUpGroupings();
    updateState();
    plot();

    plotSetSelection();
    selections.setActive();
    //createInitialSelection();
    plotSetOverview();
}

function getNumberOfSets(dataSetDescription) {
    var sets = 0;

    for (var i = 0; i < dataSetDescription.sets.length; ++i) {
        var setDefinitionBlock = dataSetDescription.sets[i];

        if (setDefinitionBlock.format === 'binary') {
            sets += setDefinitionBlock.end - setDefinitionBlock.start + 1;
        }
        else {
            console.error('Set definition format "' + setDefinitionBlock.format + '" not supported');
        }
    }

    return ( sets );
}

function getNumberOfAttributes(dataSetDescription) {
    return ( dataSetDescription.meta.length );
}

function getIdColumn(dataSetDescription) {
    for (var i = 0; i < dataSetDescription.meta.length; ++i) {
        if (dataSetDescription.meta[i].type === "id") {
            return dataSetDescription.meta[i].index;
        }
    }

    // id column not defined, assume 0
    return 0;
}

function parseDataSet(data, dataSetDescription) {

    var dsv = d3.dsv(dataSetDescription.separator, 'text/plain');

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
    for (var i = 0; i < dataSetDescription.sets.length; ++i) {
        var setDefinitionBlock = dataSetDescription.sets[i];

        if (setDefinitionBlock.format === 'binary') {
            var setDefinitionBlockLength = setDefinitionBlock.end - setDefinitionBlock.start + 1;

            // initialize the raw set arrays
            for (var setCount = 0; setCount < setDefinitionBlockLength; ++setCount) {
                rawSets.push(new Array());
            }

            var rows = file.map(function (row, rowIndex) {
                return row.map(function (value, columnIndex) {

                    if (columnIndex >= setDefinitionBlock.start && columnIndex <= setDefinitionBlock.end) {
                        var intValue = parseInt(value, 10);

                        if (isNaN(intValue)) {
                            console.error('Unable to convert "' + value + '" to integer (row ' + rowIndex + ', column ' + columnIndex + ')');
                        }

                        return intValue;
                    }

                    return null;
                });
            });
            // iterate over columns defined by this set definition block
            for (var r = 0; r < rows.length; r++) {
                // increment number of items in data set
                // only increment depth when we are processing the first set definition block (we will already iterate overall rows)
                if (i === 0) {
                    allItems.push(depth++);
                }

                for (var s = 0; s < setDefinitionBlockLength; ++s) {
                    rawSets[processedSetsCount + s].push(rows[r][setDefinitionBlock.start + s]);

                    if (r === 1) {
                        setNames.push(header[setDefinitionBlock.start + s]);
                    }
                }
            }

            processedSetsCount += setDefinitionBlockLength;
        }
        else {
            console.error('Set definition format "' + setDefinitionBlock.format + '" not supported');
        }
    }

    // initialize attribute data structure
    attributes.length = 0;
    for (var i = 0; i < dataSetDescription.meta.length; ++i) {
        var metaDefinition = dataSetDescription.meta[i];

        attributes.push({
            name: metaDefinition.name || header[metaDefinition.index],
            type: metaDefinition.type,
            values: [],
            sort: 1
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

    for (var d = 0; d < depth; ++d) {
        var setCount = 0;
        for (var s = 0; s < rawSets.length; s++) {
            setCount += rawSets[s][d];
        }
        setCountAttribute.values[d] = setCount;
    }
    attributes.push(setCountAttribute);

    var setsAttribute = {
        name: 'Sets',
        type: 'sets',
        values: [],
        sort: 1
    };

    for (var d = 0; d < depth; ++d) {
        var setList = [];
        for (var s = 0; s < rawSets.length; s++) {
            if (rawSets[s][d] === 1) {
                setList.push(Math.floor(Math.pow(2, s)));
            }
        }
        setsAttribute.values[d] = setList;
    }
    attributes.push(setsAttribute);

    // load meta data
    for (var i = 0; i < dataSetDescription.meta.length; ++i) {
        var metaDefinition = dataSetDescription.meta[i];

        attributes[i].values = file.map(function (row, rowIndex) {
            var value = row[metaDefinition.index];
            switch (metaDefinition.type) {
                case 'integer':
                    var intValue = parseInt(value, 10);
                    if (isNaN(intValue)) {
                        console.error('Unable to convert "' + value + '" to integer.');
                        return NaN;
                    }
                    return intValue;
                case 'float':
                    var floatValue = parseFloat(value, 10);
                    if (isNaN(floatValue)) {
                        console.error('Unable to convert "' + value + '" to float.');
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

    var max

    // add meta data summary statistics
    for (var i = 0; i < attributes.length; ++i) {

        if (attributes[i].type === "float" || attributes[i].type === "integer") {
            // explictly defined attributes might have user-defined ranges
            if (i < dataSetDescription.meta.length) {
                attributes[i].min = dataSetDescription.meta[i].min || Math.min.apply(null, attributes[i].values);
                attributes[i].max = dataSetDescription.meta[i].max || Math.max.apply(null, attributes[i].values);
            }
            // implicitly defined attributes
            else {
                attributes[i].min = attributes[i].min || Math.min.apply(null, attributes[i].values);
                attributes[i].max = attributes[i].max || Math.max.apply(null, attributes[i].values);
            }
        }
    }

    var setID = 1;
    for (var i = 0; i < rawSets.length; i++) {
        var combinedSets = Array.apply(null, new Array(rawSets.length)).map(Number.prototype.valueOf, 0);
        combinedSets[i] = 1;
        var set = new Set(setID, setNames[i], combinedSets, rawSets[i]);
        setIdToSet[setID] = set;
        sets.push(set);
        if (i < nrDefaultSets) {
            set.isSelected = true;
            usedSets.push(set);
        }
        setID = setID << 1;
    }

    UpSetState.maxCardinality = attributes[attributes.length - 2].max;
    var maxCardSpinner = document.getElementById('maxCardinality');
    maxCardSpinner.value = UpSetState.maxCardinality;
    maxCardSpinner.max = UpSetState.maxCardinality;
}

function setUpSubSets() {

    combinations = Math.pow(2, usedSets.length) - 1;


//    if (UpSetState.maxCardinality === undefined || UpSetState.minCardinality === undefined) {
//
//        UpSetState.minCardinality = 0;
//        document.getElementById('maxCardinality').value = UpSetState.maxCardinality;
//        document.getElementById('minCardinality').value = UpSetState.minCardinality;
//    }

    subSets.length = 0;
    // the max value for the cut-off
    // console.log("LENGTH = " + attributes[attributes.length - 2].max);
    for (var i = 0; i <= combinations; i++) {
        makeSubSet(i)
    }

}

function change() {
    sets.length = 0;
    subSets.length = 0;
    usedSets.length = 0;
    dataRows.length = 0;
    depth = 0;
    allItems.length = 0;
    attributes.length = 0;
    selectedAttributes = {};
    previousState = undefined;

    loadDataSet(this.options[this.selectedIndex].value);

    queryParameters['dataset'] = this.options[this.selectedIndex].value;
    updateQueryParameters();

    clearSelections();
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
    dataRows.length = 0;
    setUpSubSets();
    //  setUpGroupings();
    previousState = undefined;
    updateState();
    plot();
    plotSetSelection();
    plotSetOverview();
}

function addSet(set) {

}

function removeSet(set) {
    console.log('Not implemented');
}
