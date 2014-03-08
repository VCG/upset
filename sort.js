/**
 * Created by Alexander Lex on 3/4/14.
 */

var groupBySetSize = function () {
    console.log('testg');
    sizeGroups = [];
    for (var i = 0; i < sets.length; i++) {
        sizeGroups.push(new Group('SetSizeG_' + (i + 1), (i + 1) + '-Set Subsets'));
    }
    subSets.forEach(function (subSet) {
        var group = sizeGroups[subSet.nrCombinedSets - 1]
        if (group != null)
            group.addSubSet(subSet);
        else
            console.log('Fail' + group + subSet.nrCombinedSets);
    })
}

// ----------------------- Sort Functions ----------------------------

function sortOnSetItem(set) {
    renderRows.length = 0;
    renderRows = subSets.slice(0);
    var setIndex = sets.indexOf(set);
    renderRows.sort(function (a, b) {
        // move all elements that contain the clicked set to the top
        if (b.combinedSets[setIndex] !== a.combinedSets[setIndex]) {
            return b.combinedSets[setIndex] - a.combinedSets[setIndex];
        }
        // move all elements with fewer intersections to the top
        if (a.nrCombinedSets !== b.nrCombinedSets) {
            return a.nrCombinedSets - b.nrCombinedSets;
        }
        // if the number of combined sets is identical, we can pick the largest one
        return b.id - a.id;
    });
}

function sortByCombinationSize() {
    renderRows.length = 0;
    renderRows = subSets.slice(0);

// sort by number of combinations
    renderRows.sort(function (a, b) {
        if (a.nrCombinedSets !== b.nrCombinedSets) {
            return a.nrCombinedSets - b.nrCombinedSets;
        }
        // if the number of combined sets is identical, we can pick the largest one
        return b.id - a.id;
    });
}

function sortBySubsetSize() {
    renderRows.length = 0;
    renderRows = subSets.slice(0);
// sort by size of set overlap
    renderRows.sort(function (a, b) {
        return b.setSize - a.setSize;
    });
}

function sortByExpectedValue() {
    renderRows.length = 0;
    renderRows = subSets.slice(0);
// sort by size of set overlap
    renderRows.sort(function (a, b) {
        return Math.abs(b.expectedValueDeviation) - Math.abs(a.expectedValueDeviation);
    });
}

/** Sort by set size using groups */
var sortBySetSizeGroups = function() {
    renderRows.length = 0;
    for (var i = 0; i < sizeGroups.length; i++) {
        var group = sizeGroups[i];
        renderRows.push(group);
        for (var j = 0; j < group.visibleSets.length; j++) {
            renderRows.push(group.visibleSets[j]);
        }
        renderRows.push(group.aggregate);
    }
}

var UpSetState = {
    grouping: sortBySetSizeGroups,
//    sorting: sortBySubsetSize,

    update: function () {
        this.grouping();
       // this.sorting();
    }
}

