/**
 * author: Alexander Lex - alex@seas.harvard.edu
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 * author: Romain Vuillemot - nils@hms.harvard.edu
 * author: Hendrik Srtobelt - strobelt@seas.harvard.edu.
 * author: Romain Vuillemot - romain.vuillemot@gmail.com
 */


d3.json('datasets.json', function (error, json) {
    if (error) return console.warn(error);
    dataSets = json;
    load()
});

function load() {

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

    var dataSelect = header.append('div').text('Choose Dataset: ');
    var select = dataSelect.append('select');
    select.on('change', change)
        .selectAll('option').data(dataSets).enter().append('option')
        .attr('value', function (d) {
            return d.file;
        })
        .attr('id', 'dataSetSelector')
        .text(function (d) {
            return d.text;
        })
        .property('selected', function (d, i) {
            return (i === queryParameters['dataset'])
        });

    loadDataset(dataSets[queryParameters['dataset']].file);
}

function loadDataset(dataFile) {
    d3.text(dataFile, 'text/csv', run);
}

function run(data) {
    dataLoad(data);
    setUpSubSets();
    plot();
    plotSetSelection();
}

function dataLoad(data) {

   // clearSelectedItems();

    var dsv = d3.dsv(';', 'text/plain');
    var rows = dsv.parseRows(data).map(function (row) {
        return row.map(function (value) {
            var intValue = parseInt(value, 10)
            if (isNaN(intValue))
                return value;
            return intValue;
        });
    });
    // the raw set arrays
    var rawSets = [];
    // the names of the sets are in the columns
    var setNames = rows.shift();
    // we drop the first cell - this should be empty
    setNames.shift();

    // initialize the raw set arrays
    for (var setCount = 0; setCount < setNames.length; setCount++) {
        rawSets.push(new Array());
    }

    for (var i = 0; i < rows.length; i++) {
        labels.push(rows[i][0]);
        for (var setCount = 0; setCount < setNames.length; setCount++) {
            rawSets[setCount].push(rows[i][setCount + 1]);
        }
    }

    depth = labels.length;

    var setID = 1;
    for (var i = 0; i < rawSets.length; i++) {
        var combinedSets = Array.apply(null, new Array(rawSets.length)).map(Number.prototype.valueOf, 0);
        combinedSets[i] = 1;
        var setName = setNames[i];
        var set = new Set(setID, setName, combinedSets, rawSets[i]);
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
    groupBySetSize();
    // sort by size of set overlap
    renderRows.sort(function (a, b) {
        return b.setSize - a.setSize;
    });

}

function change() {
    sets.length = 0;
    subSets.length = 0;
    usedSets.length = 0;
    renderRows.length = 0;
    labels.length = 0;
    loadDataset(this.options[this.selectedIndex].value);
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
    plot();
    plotSetSelection();

}

function addSet(set) {

}

function removeSet(set) {
    console.log('Not implemented');
}
