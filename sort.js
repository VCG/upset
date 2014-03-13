/**
 * Created by Alexander Lex on 3/4/14.
 */

var SET_SIZE_GROUP_PREFIX = 'SetSizeG_';
var EMPTY_GROUP_ID = 'EmptyGroup';
var SET_BASED_GROUPING_PREFIX = "SetG_";

var groupBySetSize = function (subSets, level) {
    var newGroups = [];
    newGroups.push(new Group(EMPTY_GROUP_ID, 'Empty Subset', level));
    for (var i = 0; i < usedSets.length; i++) {
        newGroups.push(new Group(SET_SIZE_GROUP_PREFIX + (i + 1), (i + 1) + '-Set Subsets'));
    }
    subSets.forEach(function (subSet) {
        var group = newGroups[subSet.nrCombinedSets];
        if (group != null)
            group.addSubSet(subSet);
        else
            console.log('Fail ' + group + subSet.nrCombinedSets);
    })
    return newGroups;
}

/**
 * Creates groups for all sets containing all subsets of this set
 */
var groupBySet = function (subSets, level) {

    var newGroups = [];
    newGroups.push(new Group(EMPTY_GROUP_ID, 'Empty Subset', level));
    for (var i = 0; i < usedSets.length; i++) {
        var group = new Group(SET_BASED_GROUPING_PREFIX + (i + 1), usedSets[i].elementName);

        newGroups.push(group);

        subSets.forEach(function (subSet) {
            if (subSet.combinedSets[i] !== 0) {

                group.addSubSet(subSet);
            }
        });
    }
    return newGroups;
};

/** Collapse or uncollapse group */
var collapseGroup = function (group) {
    group.isCollapsed = !group.isCollapsed;
    UpSetState.collapseChanged = true;
    updateState();
};

var toggleCollapseAll = function () {
    if (UpSetState.collapseAll) {
        UpSetState.unCollapseAll = true;
    }
    UpSetState.collapseAll = !UpSetState.collapseAll;
    UpSetState.collapseChanged = true;
    updateState();
};

var collapseAggregate = function (aggregate) {
    aggregate.isCollapsed = !aggregate.isCollapsed;
    updateState();
};

// ----------------------- Sort Functions ----------------------------

function sortBySetItem(subSets, set) {
    if (!set) {
        set = usedSets[0];
    }
    var dataRows = subSets.slice(0);
    var setIndex = usedSets.indexOf(set);
    dataRows.sort(function (a, b) {
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
    return dataRows;
}

function sortByCombinationSize(subsets) {
    var dataRows = subSets.slice(0);

// sort by number of combinations
    dataRows.sort(function (a, b) {
        if (a.nrCombinedSets !== b.nrCombinedSets) {
            return a.nrCombinedSets - b.nrCombinedSets;
        }
        // if the number of combined sets is identical, we can pick the largest one
        return b.id - a.id;
    });
    return dataRows;
}

/** sort by size of set overlap */
function sortBySubSetSize(subsets) {
    var dataRows = subSets.slice(0);
    dataRows.sort(function (a, b) {
        return b.setSize - a.setSize;
    });
    return dataRows;
}

/** sort by size of set overlap */
function sortByExpectedValue(subSets) {
    var dataRows = subSets.slice(0);

    dataRows.sort(function (a, b) {
        return Math.abs(b.expectedValueDeviation) - Math.abs(a.expectedValueDeviation);
    });
    return dataRows;
}

/**
 * Takes a list of groups and writes them into an array, according to the nesting & collapse rules
 * @param groupList
 * @returns {*}
 */
var unwrapGroups = function (groupList) {
    var dataRows = []
    for (var i = 0; i < groupList.length; i++) {
        var group = groupList[i];
        // ignoring an empty empty group
        if (group.id === EMPTY_GROUP_ID && group.setSize === 0) {
            continue;
        }
        dataRows.push(group);
        if (UpSetState.collapseAll) {
            group.isCollapsed = true;
        }
        if (UpSetState.unCollapseAll) {
            group.isCollapsed = false;
        }
        if (!group.isCollapsed) {

            if (UpSetState.levelTwoGrouping && group.nestedGroups) {
                dataRows = dataRows.concat(unwrapGroups(group.nestedGroups, []));
            }
            else {
                for (var j = 0; j < group.visibleSets.length; j++) {
                    dataRows.push(group.visibleSets[j]);
                }
                if (group.aggregate.subSets.length > 0) {
                    dataRows.push(group.aggregate);
                    if (!group.aggregate.isCollapsed) {
                        for (var k = 0; k < group.aggregate.subSets.length; k++) {
                            dataRows.push(group.aggregate.subSets[k]);
                        }
                    }
                }
            }
        }
    }
    UpSetState.unCollapseAll = false;
    return dataRows;
};

var StateMap = {
    groupBySetSize: groupBySetSize,
    groupBySet: groupBySet,

    sortByCombinationSize: sortByCombinationSize,
    sortBySubSetSize: sortBySubSetSize,
    sortByExpectedValue: sortByExpectedValue,
    sortBySubSetSize: sortBySubSetSize,
    sortBySetItem: sortBySetItem
};

var StateOpt = {
    groupBySetSize: 'groupBySetSize',
    groupBySet: 'groupBySet',

    sortByCombinationSize: 'sortByCombinationSize',
    sortBySubSetSize: 'sortBySubSetSize',
    sortByExpectedValue: 'sortByExpectedValue',
    sortBySubSetSize: 'sortBySubSetSize',
    sortBySetItem: 'sortBySetItem'
};

var UpSetState = {
    collapseAll: false,
    unCollapseAll: false,
    collapseChanged: false,
    grouping: StateOpt.groupBySet,
    levelTwoGrouping: StateOpt.groupBySetSize,
    sorting: undefined
};

var previousState = false;

var updateState = function (parameter) {

    // true if pure sorting - no grouping
    if ((UpSetState.sorting && !UpSetState.grouping) && (!previousState ||(previousState && previousState.sorting !== UpSetState.sorting))) {
        dataRows = StateMap[StateOpt[UpSetState.sorting]](subSets, parameter);
    }
    else if (UpSetState.grouping && (!previousState || (previousState && previousState.grouping !== UpSetState.grouping || previousState.levelTwoGrouping !== UpSetState.levelTwoGrouping))) {
        levelOneGroups = StateMap[StateOpt[UpSetState.grouping]](subSets);

        if (UpSetState.levelTwoGrouping) {
            levelOneGroups.forEach(function (group) {
                group.nestedGroups = StateMap[StateOpt[UpSetState.levelTwoGrouping]](group.subSets, 2);
            });
        }
        dataRows = unwrapGroups(levelOneGroups);

    }
    else if (UpSetState.collapseChanged && UpSetState.grouping) {
        dataRows = unwrapGroups(levelOneGroups);
     }

    // unwrapGroups deals with collapse, so we can reset it
    UpSetState.collapseChanged = false;

    renderRows.length = 0;

    var registry = {};
    dataRows.forEach(function (element) {
        var count = 1;
        if (registry.hasOwnProperty(element.id)) {
            count = registry[element.id];
            count += 1;
            registry[element.id] = count;
        }
        else {
            registry[element.id] = 1;
        }
        var wrapper = {};
        wrapper.id = element.id + '_' + count;
        wrapper.data = element;

        renderRows.push(wrapper);

    });
    previousState = JSON.parse(JSON.stringify(UpSetState));
};
