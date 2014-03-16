/**
 * Created by Alexander Lex on 3/4/14.
 */

var SET_SIZE_GROUP_PREFIX = 'SetSizeG_';
var EMPTY_GROUP_ID = 'EmptyGroup';
var SET_BASED_GROUPING_PREFIX = "SetG_";

var handleLogicGroups = function (subsets, dataRows, level) {
    var addGroups = [];
    var oldGroupIDs = {};
    if (previousState != false) previousState.logicGroups.forEach(function (d) {
        oldGroupIDs[d.id] = 1
    })
    UpSetState.logicGroups.forEach(function (d) {
        if (d.id in oldGroupIDs) {
        }
        else {
            var group = new Group(d.id, d.groupName, level);
            var maskList= d.getListOfValues();

            getSubsetsForMaskList(subsets, maskList, function(d){
                group.addSubSet(d);
            });

            addGroups.push(group)
        }
        ;
    })



   // TODO: @Alex: add unwrapped group -- maybe you solve this globally if unwrapped or not
    if (addGroups.length>0){
        var groupElements= unwrapGroups(addGroups);

        groupElements.reverse()
        groupElements.forEach(function(addGroup){
            dataRows.unshift(addGroup)
        })
    }

}

var groupByRelevanceMeasure = function (subSets, level) {
    var newGroups = [];
    newGroups.push(new Group('GROUP_POS_DEV', 'Positive Expected Value', level));
    newGroups.push(new Group('GROUP_POS_NEG', 'Negative Expected Value', level));
    newGroups.push(new Group(EMPTY_GROUP_ID, 'Empty Subset', level));
    for (var i = 0; i < subSets.length; i++) {
        var index = 0
        if (subSets[i].expectedValueDeviation > 0) {
            index = 0;
        }
        else if (subSets[i].expectedValueDeviation < 0) {
            index = 1;
        }
        else {
            index = 2;
        }
        newGroups[index].addSubSet(subSets[i])
    }
    return newGroups;
}

var groupByIntersectionSize = function (subSets, level) {
    var newGroups = [];
    newGroups.push(new Group(EMPTY_GROUP_ID, 'Empty Subset', level));
    var maxSetSize = Math.min(usedSets.length, UpSetState.maxCardinality);
    for (var i = UpSetState.minCardinality; i < maxSetSize; i++) {
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

    // TODO add empty subset

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

//var toggleCollapseAll = function () {
//    if (UpSetState.collapseAll) {
//        UpSetState.unCollapseAll = true;
//    }
//    UpSetState.collapseAll = !UpSetState.collapseAll;
//    UpSetState.collapseChanged = true;
//    updateState();
//};

var collapseAggregate = function (aggregate) {
    aggregate.isCollapsed = !aggregate.isCollapsed;
    updateState();
};

// ----------------------- Sort Functions ----------------------------

/** Filters the provided list of subsets to include only those of length >0. If no list of subsets is provided the global list is used. */
function getFilteredSubSets(subSetsToFilter) {
    if (!subSetsToFilter) {
        subSetsToFilter = subSets;
    }
    if (!UpSetState.hideEmpties) {
        return subSetsToFilter.slice(0);
    }
    var filteredSubSets = []
    for (var i = 0; i < subSetsToFilter.length; i++) {
        if (subSetsToFilter[i].items.length > 0) {
            filteredSubSets.push(subSetsToFilter[i]);
        }
    }
    return filteredSubSets;
}

var sortBySetItem = function (subSets, set) {
    if (!set) {
        set = usedSets[0];
    }
    var dataRows = getFilteredSubSets(subSets);
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

var sortByCombinationSize = function(subSets) {
    var dataRows = getFilteredSubSets(subSets);

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
var sortBySubSetSize = function(subSets) {
    var dataRows = getFilteredSubSets(subSets);
    dataRows.sort(function (a, b) {
        return b.setSize - a.setSize;
    });
    return dataRows;
}

/** sort by size of set overlap */
var sortByExpectedValue = function(subSets) {
    var dataRows = getFilteredSubSets(subSets);

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
        if (group.id === EMPTY_GROUP_ID && group.setSize === 0 || (group.visibleSets.length === 0 && UpSetState.hideEmpties)) {
            continue;
        }
        dataRows.push(group);
        if (UpSetState.collapseAll) {
            group.isCollapsed = true;
        }
        if (UpSetState.expandAll) {
            group.isCollapsed = false;
        }
        if (!group.isCollapsed) {

            if (UpSetState.levelTwoGrouping && group.nestedGroups) {
                dataRows = dataRows.concat(unwrapGroups(group.nestedGroups, []));
            }
            else {
                dataRows = dataRows.concat(StateMap[UpSetState.sorting](group.visibleSets));
//                for (var j = 0; j < group.visibleSets.length; j++) {
//                    dataRows.push(group.visibleSets[j]);
//                }
                if (group.aggregate.subSets.length > 0 && !UpSetState.hideEmpties) {
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
    UpSetState.expandAll = false;
    UpSetState.collapseAll = false;
    UpSetState.collapseChanged = false;
    return dataRows;
};

var StateMap = {
    groupByIntersectionSize: groupByIntersectionSize,
    groupBySet: groupBySet,
    groupByRelevanceMeasure: groupByRelevanceMeasure,

    sortByCombinationSize: sortByCombinationSize,
    sortBySubSetSize: sortBySubSetSize,
    sortByExpectedValue: sortByExpectedValue,
    sortBySubSetSize: sortBySubSetSize,
    sortBySetItem: sortBySetItem
};

var StateOpt = {
    groupByIntersectionSize: 'groupByIntersectionSize',
    groupBySet: 'groupBySet',
    groupByRelevanceMeasure: 'groupByRelevanceMeasure',

    sortByCombinationSize: 'sortByCombinationSize',
    sortBySubSetSize: 'sortBySubSetSize',
    sortByExpectedValue: 'sortByExpectedValue',
    sortBySetItem: 'sortBySetItem'
};

var UpSetState = {
    collapseAll: false,
    expandAll: false,
    // collapseChanged: false,

    grouping: queryParameters["grouping"] || StateOpt.groupBySet,
    levelTwoGrouping: undefined,
    sorting: StateOpt.sortByCombinationSize,

    /** hide empty subsets, groups and aggregates */
    hideEmpties: true,

    /** Sets the upper threshold of cardinality of subsets */
    maxCardinality: undefined,
    /** Sets the lower threshold of cardinality of subsets */
    minCardinality: 0,

    forceUpdate: false,

    /** user defined logic groups **/
    logicGroups: [],
    logicGroupChanged: false

};

var previousState = false;

var updateState = function (parameter) {

    var forceUpdate = !previousState || UpSetState.forceUpdate || (UpSetState.hideEmpties != previousState.hideEmpties);

    // true if pure sorting - no grouping
    if ((UpSetState.sorting && !UpSetState.grouping) && (forceUpdate || (previousState && previousState.sorting !== UpSetState.sorting))) {
        dataRows = StateMap[StateOpt[UpSetState.sorting]](subSets, parameter);
    }
    else if (UpSetState.grouping && (forceUpdate || (previousState && previousState.grouping !== UpSetState.grouping || previousState.levelTwoGrouping !== UpSetState.levelTwoGrouping))) {
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

    // TODO: @alex here !
    if (UpSetState.logicGroupChanged) {
        // adds _NEW_ unwrapped logic groups to "dataRow"
        handleLogicGroups(subSets, dataRows, 1);
        UpSetState.logicGroupChanged = false;

    }

    UpSetState.forceUpdate = false;

    renderRows.length = 0;

    var registry = {};
    dataRows.forEach(function (element) {
        var count = 1;
        if (registry.hasOwnProperty(element.id)) {
            count = registry[element.id];
            count = Utilities.generateUuid;
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

    queryParameters["grouping"] = UpSetState.grouping;
    updateQueryParameters();

//    var status = $('#configStatus');
//
//    status.text('Do you want to see status text here?');
//    console.log(status.prop('text'));
};
