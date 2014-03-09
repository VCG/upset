/**
 * Created by Alexander Lex on 3/4/14.
 */

var SET_SIZE_GROUP_PREFIX = 'SetSizeG_';
var EMPTY_GROUP_ID = 'EmptyGroup';
var SET_BASED_GROUPING_PREFIX = "SetG_";

var groupBySetSize = function () {
    sizeGroups = [];
    sizeGroups.push(new Group(EMPTY_GROUP_ID, 'Empty Subset'));
    for (var i = 0; i < usedSets.length; i++) {
        sizeGroups.push(new Group(SET_SIZE_GROUP_PREFIX + (i + 1), (i + 1) + '-Set Subsets'));
    }
    subSets.forEach(function (subSet) {
        var group = sizeGroups[subSet.nrCombinedSets]
        if (group != null)
            group.addSubSet(subSet);
        else
            console.log('Fail' + group + subSet.nrCombinedSets);
    })
}

/**
 * Creates groups for all sets containing all subsets of this set
 */
var groupBySet = function () {

    setGroups = [];
    setGroups.push(new Group(EMPTY_GROUP_ID, 'Empty Subset'));
    for (var i = 0; i < usedSets.length; i++) {
        var group = new Group(SET_BASED_GROUPING_PREFIX + (i + 1), 'All Subsets of ' + usedSets[i].elementName);

        setGroups.push(group);

        subSets.forEach(function (subSet) {
            if (subSet.combinedSets[i] !== 0) {

                console.log('Adding to ' + usedSets[i].elementName + " subset " +  subSet.id);
//                console.log('b: ' + usedSets[i].combinedSets);
                group.addSubSet(subSet);
            }
        });
    }
}

/** Collapse or uncollapse group */
var collapseGroup = function (group) {
    group.isCollapsed = !group.isCollapsed;
    updateState();
}

var collapseAggregate = function (aggregate) {
    aggregate.isCollapsed = !aggregate.isCollapsed;
    updateState();

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

var sortByGroup = function (groupList) {
    renderRows.length = 0;
    for (var i = 0; i < groupList.length; i++) {
        var group = groupList[i];
        // ignoring an empty empty group
        if (group.id === EMPTY_GROUP_ID && group.setSize === 0) {
            continue;
        }
        renderRows.push(group);
        if (!group.isCollapsed) {
            for (var j = 0; j < group.visibleSets.length; j++) {
                renderRows.push(group.visibleSets[j]);
            }
            if (group.aggregate.subSets.length > 0) {
                renderRows.push(group.aggregate);
                if (!group.aggregate.isCollapsed) {
                    for (var j = 0; j < group.aggregate.subSets.length; j++) {
                        renderRows.push(group.aggregate.subSets[j]);
                    }
                }
            }
        }
    }
}

/** Sort by set size using groups */
var sortBySetSizeGroups = function () {
    sortByGroup(sizeGroups);
}

/** Sort by the groups containing all subsets of each sets */
var sortBySetGroups = function (){
    sortByGroup(setGroups);
}

var UpSetState = {
    grouping: sortBySetSizeGroups
//    sorting: sortBySubsetSize,

}

updateState = function () {
    UpSetState.grouping();
    //  history.pushState(UpSetState);
    // this.sorting();
}

