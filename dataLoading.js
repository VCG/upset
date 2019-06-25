/**
 * author: Alexander Lex - alex@seas.harvard.edu
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 * author: Hendrik Srtobelt - strobelt@seas.harvard.edu
 * author: Romain Vuillemot - romain.vuillemot@gmail.com
 */

var dataSetDescriptions = []
var queryParameters = {};
var initCallback; // function to call when dataset is loaded
var globalCtx;

function initData(ctx, callback, datasets) {
    dataSetDescriptions = [];

    retrieveQueryParameters();
    setUpGUIElements();

    initCallback = callback;
    globalCtx = ctx;
    if (!datasets) {
        $.when($.ajax({ url: 'datasets.json', dataType: 'json' })).then(
            function (data, textStatus, jqXHR) {
                loadDataSetDescriptions(data);
            },
            function (data, textStatus, jqXHR) {
                console.error('Error loading "' + this.url + '".');
            });
    } else {
        loadDataSetDescriptions(datasets);
    }

    /// registering custom dataset function
    $("#custom-dataset-submit").on('click', function () {
        var url = $("#custom-dataset-url").val();
        if (url != null) {
            loadDataSetDescriptions([url], true);
            queryParameters['dataset'] = dataSetDescriptions.length;
        }
    })

}

var handleDatasetDescription = function (result) {
    if (result != undefined) {
        dataSetDescriptions.push(result);
    }
}

var loadDataAfterAjaxComplete = function () {

}

var populateDSSelector = function () {

    // updating the drop-down box
    d3.select("#header-ds-selector")
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

    d3.select("#header-ds-selector").on('change', setQueryParametersAndChangeDataset);
}

function loadDataSetDescriptions(dataSetList) {

    var descriptions = [];
    //  var descriptionDeferreds = [];
    var requests = [];
    // launch requests to load data set descriptions
    for (var i = 0; i < dataSetList.length; ++i) {
        var url = dataSetList[i];
        if ($.type(url) === 'string') {
            requests.push($.ajax({ url: url, dataType: 'json', success: handleDatasetDescription}));
        } else {
            handleDatasetDescription(url);
        }
    }

    $.when.apply(undefined, requests).then(loadDataSetFromQueryParameters, handleDataSetError);
}

var handleDataSetError = function (jqXHR, textStatus, errorThrown) {
    alert("Could not load dataset. \n Error: " + errorThrown)
}

function loadDataSetFromQueryParameters() {
    populateDSSelector();
    $(EventManager).trigger("loading-dataset-started", { description: dataSetDescriptions[queryParameters['dataset']]  });
    //(queryParameters['dataset']);
    changeDataset();
}

var setQueryParametersAndChangeDataset = function () {
    queryParameters['dataset'] = this.options[this.selectedIndex].value;
    changeDataset();
}

/**
 * Replace or load a new dataset based on the dataset index in the query parameters
 */
var changeDataset = function () {

    $(EventManager).trigger("loading-dataset-started", { description: dataSetDescriptions[queryParameters['dataset']]  });

    sets.length = 0;
    subSets.length = 0;
    usedSets.length = 0;
    dataRows.length = 0;
    depth = 0;
    allItems.length = 0;
    attributes.length = 0;
    selectedAttributes = {};
    previousState = undefined;

    UpSetState.logicGroups = [];
    UpSetState.logicGroupChanged = true;

    loadDataSet(queryParameters['dataset']);

    // updateQueryParameters();

    clearSelections();
}

function loadDataSet(index) {
    processDataSet(dataSetDescriptions[index]);
}

function processDataSet(dataSetDescription) {
    if (dataSetDescription.file) {
        d3.text(dataSetDescription.file, 'text/csv', function (data) {
            parseDataSet(data, dataSetDescription);
            run();
        });
    } else {
      parseDataSet(dataSetDescription.data, dataSetDescription);
      run();
    }
}

/**
 * Setting up the html GUI elements
 */
var setUpGUIElements = function () {

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

    var dataSelect = d3.select("#dataset-selector").append('div');

    var select = dataSelect.append('select').attr("id", "header-ds-selector");

    dataSelect.append('span').attr("class", "header-right").text('Choose Dataset');
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
        for (var q in queryParameters) {
            urlQueryString += (q + "=" + queryParameters[q]) + "&";
        }
        urlQueryString = urlQueryString.substring(0, urlQueryString.length - 1);
    }

    history.replaceState({}, 'Upset', window.location.origin + window.location.pathname + urlQueryString);
}

function clearSelections() {
    selections = new SelectionList();
}

function createInitialSelection() {
    var selection = new Selection(allItems, new FilterCollection("#filters-controls", "#filters-list"));

    selections.addSelection(selection, true);
    selections.setActive(selection);
}

function run() {

    elementViewers.reset();

    setUpSubSets();
    // setUpGroupings();
    updateState();
    initCallback.forEach(function (callback) {
        callback();
    })
//    plot();

//    plotSetSelection();
    selections.setActive();
    //createInitialSelection();
    plotSetOverview({initialize: true});

    $(EventManager).trigger("loading-dataset-finished", { });
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
    // the raw set arrays
    var rawSets = [];
    var setNames = [];

    var file;
    if ($.type(data) === 'string') {
        var dsv = d3.dsv(dataSetDescription.separator, 'text/plain');
        file = dsv.parseRows(data);
    } else {
        file = data;
    }

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

    // initialize sets and set IDs
    var setPrefix = "S_";
    //var setID = 1;
    for (var i = 0; i < rawSets.length; i++) {
        var combinedSets = Array.apply(null, new Array(rawSets.length)).map(Number.prototype.valueOf, 0);
        combinedSets[i] = 1;
        var set = new USet(setPrefix + i, setNames[i], combinedSets, rawSets[i]);
        setIdToSet[setPrefix + i] = set;
        sets.push(set);
        if (i < nrDefaultSets) {
            set.isSelected = true;
            usedSets.push(set);
        }
        // setID = setID << 1;
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
                //setList.push(Math.floor(Math.pow(2, s)));
                setList.push(sets[s].id)
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

    UpSetState.maxCardinality = attributes[attributes.length - 2].max;
    if (isNaN(UpSetState.maxCardinality)) {
        // fixme hack to make it work without attributes
        UpSetState.maxCardinality = sets.length;
    }
    var maxCardSpinner = document.getElementById('maxCardinality');
    maxCardSpinner.value = UpSetState.maxCardinality;
    maxCardSpinner.max = UpSetState.maxCardinality;
    var minCardSpinner = document.getElementById('minCardinality');
    minCardSpinner.max = UpSetState.maxCardinality;

    updateDatasetInformation(dataSetDescription)

}

var updateDatasetInformation = function (dataSetDescription) {

    var infoBox = $('#dataset-info-content');
    infoBox.empty();
    //infoBox.append('<hr><br />');
    infoBox.append('<p style="padding-bottom: 5px">');
    infoBox.append("<b>Name:</b> " + dataSetDescription.name + "<br />");
    infoBox.append("<b># Sets:</b> " + sets.length + "<br />");
    infoBox.append("<b># Attributes</b>: " + attributes.length + "<br />");
    infoBox.append("<b># Elements:</b> " + depth + "<br />");
    infoBox.append('</p> <p style="padding-bottom: 10px">');
    if (dataSetDescription.author) {
        infoBox.append("<b>Author</b>: " + dataSetDescription.author + "<br />");
    }
    if (dataSetDescription.description) {
        infoBox.append("<b>Description:</b> <br />" + dataSetDescription.description + "<br />");
    }
    if (dataSetDescription.source) {
        if (dataSetDescription.source.indexOf("http://") == 0) {
            var urlText = dataSetDescription.source;
            var numCharacters = 22;
            if (urlText.length > numCharacters) {
                urlText = urlText.substring(0, numCharacters) + ".."
            }

            infoBox.append("<b>Source:</b> <br /><a href=\"" + dataSetDescription.source + "\">" + urlText + "</a><br />");

        } else {
            infoBox.append("<b>Source:</b> <br />" + dataSetDescription.source + "<br />");
        }
    }

    infoBox.append('</p>');

}

function createSignature(listOfUsedSets, listOfSets) {
    return listOfUsedSets.map(function (d) {
        return (listOfSets.indexOf(d) > -1) ? 1 : 0
    }).join("")

}

function setUpSubSets() {

    $(EventManager).trigger("computing-subsets-started", undefined);

    combinations = Math.pow(2, usedSets.length) - 1;

    subSets.length = 0;

    var aggregateIntersection = {}

    var listOfUsedSets = usedSets.map(function (d) {
        return d.id
    })

    var setsAttribute = attributes.filter(function (d) {
        return d.type == "sets"
    })[0];

    var signature = "";

    var itemList;
    //HEAVY !!!
    setsAttribute.values.forEach(function (listOfSets, index) {
        signature = createSignature(listOfUsedSets, listOfSets)
        itemList = aggregateIntersection[signature];
        if (itemList == null) {
            aggregateIntersection[signature] = [index];
        } else {
            itemList.push(index);
        }
    })

    // used Variables for iterations
    var tempBitMask = 0;
    var usedSetLength = usedSets.length
    var combinedSetsFlat = "";
    var actualBit = -1;
    var names = [];

    if (usedSetLength > 20) { // TODo HACK !!!!
        Object.keys(aggregateIntersection).forEach(function (key) {
            var list = aggregateIntersection[key]

            var combinedSets = key.split("");

            //combinedSetsFlat = combinedSets.join("");

//            if (card>UpSetState.maxCardinality) continue;//UpSetState.maxCardinality = card;
//            if (card<UpSetState.minCardinality) continue;//UpSetState.minCardinality = card;

            names = [];
            var expectedValue = 1;
            var notExpectedValue = 1;
            // go over the sets
            combinedSets.forEach(function (d, i) {
                    if (d == 1) { // if set is present
                        names.push(usedSets[i].elementName);
                        expectedValue = expectedValue * usedSets[i].dataRatio;
                    } else {
                        notExpectedValue = notExpectedValue * (1 - usedSets[i].dataRatio);
                    }
                }
            );

            //        console.log(expectedValue, notExpectedValue);
            expectedValue *= notExpectedValue;

            //        console.log(combinedSetsFlat);

            var name = "";
            if (names.length > 0) {
                name = names.reverse().join(" ") + " " // not very clever
            }

            //        var arghhList = Array.apply(null,new Array(setsAttribute.values.length)).map(function(){return 0})
            //        list.forEach(function(d){arghhList[d]=1});

//            console.log(parseInt(key,2), name, combinedSets, list, expectedValue);

            var subSet = new SubSet(bitMask, name, combinedSets, list, expectedValue);
            subSets.push(subSet);

        })

    } else {
        for (var bitMask = 0; bitMask <= combinations; bitMask++) {
            tempBitMask = bitMask;//originalSetMask

            var card = 0;
            var combinedSets = Array.apply(null, new Array(usedSetLength)).map(function () {  //combinedSets
                actualBit = tempBitMask % 2;
                tempBitMask = (tempBitMask - actualBit) / 2;
                card += actualBit;
                return +actualBit
            }).reverse() // reverse not necessary.. just to keep order

            combinedSetsFlat = combinedSets.join("");

            if (card > UpSetState.maxCardinality) continue;//UpSetState.maxCardinality = card;
            if (card < UpSetState.minCardinality) continue;//UpSetState.minCardinality = card;

            names = [];
            var expectedValue = 1;
            var notExpectedValue = 1;
            // go over the sets
            combinedSets.forEach(function (d, i) {


                    //                console.log(usedSets[i]);
                    if (d == 1) { // if set is present
                        names.push(usedSets[i].elementName);
//                    expectedValue*=expectedValueForOneSet;
                        expectedValue = expectedValue * usedSets[i].dataRatio;
                    } else {
                        notExpectedValue = notExpectedValue * (1 - usedSets[i].dataRatio);
                    }
                }
            );

            //        console.log(expectedValue, notExpectedValue);
            expectedValue *= notExpectedValue;

            //        console.log(combinedSetsFlat);
            var list = aggregateIntersection[combinedSetsFlat];
            if (list == null) {
                list = [];
            }

            var name = "";
            if (names.length > 0) {
                name = names.reverse().join(" ") + " " // not very clever
            }

            //        var arghhList = Array.apply(null,new Array(setsAttribute.values.length)).map(function(){return 0})
            //        list.forEach(function(d){arghhList[d]=1});

            var subSet = new SubSet(bitMask, name, combinedSets, list, expectedValue);
            subSets.push(subSet);
        }
    }
    aggregateIntersection = {};

//    var subSet = new SubSet(originalSetMask, name, combinedSets, combinedData, expectedValue);
//    subSets.push(subSet);
//
//    for (var i = 0; i <= combinations; i++) {
//        makeSubSet(i)
//    }

    $(EventManager).trigger("computing-subsets-finished", undefined);

}

function updateSetContainment(set, refresh) {
    if (!set.isSelected) {
        set.isSelected = true;
        usedSets.push(set);
        $(EventManager).trigger("set-added", { set: set });
    }
    else {
        set.isSelected = false;

        var index = usedSets.indexOf(set);
        if (index > -1) {
            usedSets.splice(index, 1);
            $(EventManager).trigger("set-removed", { set: set });
        }
    }

    if (refresh) {
        subSets.length = 0;
        dataRows.length = 0;
        setUpSubSets();
        //  setUpGroupings();
        previousState = undefined;
        updateState();

//        ctx.updateHeaders();
//
//        plot();
//        plotSetSelection();
        plotSetOverview();
        initCallback.forEach(function (callback) {
            callback();
        })

//        ctx.svg.attr("width", ctx.w)
//        d3.selectAll(".svgGRows, .foreignGRows").attr("width", ctx.w)
//        d3.selectAll(".backgroundRect").attr("width", ctx.w - ctx.leftOffset)
    }
}

function addSet(set) {

}

function removeSet(set) {
    console.log('Not implemented');
}
