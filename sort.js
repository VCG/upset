/**
 * Created by Alexander Lex on 3/4/14.
 */

var SET_SIZE_GROUP_PREFIX = 'SetSizeG_';
var EMPTY_GROUP_ID = 'EmptyGroup';
var SET_BASED_GROUPING_PREFIX = "SetG_";

var handleLogicGroups = function (subsets, level, parentGroup) {
    filterGroups = [];
    var deleteCandidates =[];
    UpSetState.logicGroups.forEach(function (d) {
        var maskList = d.getListOfValues();
        var group = new QueryGroup(d.id, d.groupName, d.orClauses);
        getSubsetsForMaskList(subsets, maskList, function (d) {
            group.addSubSet(d);
        });

        if (group.subSets.length>0){
            filterGroups.push(group)
        }else{
            deleteCandidates.push(d);
        }
    })

    // TODO: HAS TO BE IMPROVED !!!
    deleteCandidates.forEach(function(d){
        UpSetState.logicGroups.slice(UpSetState.logicGroups.indexOf(d),1);
    })


}

var groupByOverlapDegree = function (subSets, level, parentGroup) {
    var degree = 2;
    if (level == 1) {
        degree = UpSetState.levelOneDegree;
    }
    else if (level == 2) {
        degree = UpSetState.levelTwoDegree;
    }
    var newGroups = []

    var defaultMask;
    if (parentGroup) {
        defaultMask = parentGroup.combinedSets;
    }

    var combinations = Math.pow(2, usedSets.length) - 1;

    var queries = []
    for (var i = 0; i <= combinations; i++) {
        fillMasks(i, usedSets.length, degree, queries, defaultMask);
    }
    for (var i = 0; i < queries.length; i++) {
        var name = "";
        for (var j = 0; j < queries[i].length; j++) {
            if (queries[i][j] === 1) {
                if (parentGroup.elementName !== usedSets[j].elementName)
                    name += usedSets[j].elementName + " ";
            }
        }
        var group = new Group("Overlap_G_" + i + "_" + parentGroup.id, name);
        group.level = level;
        group.combinedSets = queries[i];
        getSubsetsForMaskList(subSets, [queries[i]], function (d) {
            group.addSubSet(d);
        });
        if (group.subSets.length > 0) {
            newGroups.unshift(group);
        }
    }

    return newGroups;
//    console.log(queries);

//    for (var i = 0; i < subSets.length; i++) {
//        mask = Array.apply(null, new Array(subSets.length)).map(Number.prototype.valueOf, 0);
//        mask[i] = 1;
//    }

}

var fillMasks = function (setMask, length, minSets, queries, defaultMask) {

    var bitMask = 1;

    var query;
    if (defaultMask) {
        var query = defaultMask.slice(0);
    }
    else {
        query = Array.apply(null, new Array(length)).map(Number.prototype.valueOf, 0);
    }
    var memberCount = 0;

    for (var setIndex = length - 1; setIndex >= 0; setIndex--) {
        if (query[setIndex] === 1) {
            // true if this element is in the default mask
            memberCount++;
        }
        else if ((setMask & bitMask) === 1) {
            query[setIndex] = 1;
            memberCount++;
        }
        else {
            query[setIndex] = 2;
        }
        setMask = setMask >> 1;
    }
    if (memberCount == minSets) {
        // FIXME this is to remove duplicates. We shouldn't produce them in the first place
        var duplicate = false;
        for (var i = 0; i < queries.length; i++) {
            if (queries[i].compare(query)) {
                duplicate = true;
                break;
            }
        }
        if (!duplicate) {
            queries.push(query);
        }
    }

//    var resultMasks = [];
//    for (var maskCount = 0; maskCount < length; maskCount++) {
//        for (var i = 0; i < length; i++) {
//            var newMask = masks[maskCount].slice(0);
//
//
//        }
//    }
}

var groupByRelevanceMeasure = function (subSets, level, parentGroup) {
    var newGroups = [];
    newGroups.push(new Group('GROUP_POS_DEV' + parentGroup.id, 'Positive Expected Value', level));
    newGroups.push(new Group('GROUP_NEG_DEV' + parentGroup.id, 'Negative Expected Value', level));
    newGroups.push(new Group(EMPTY_GROUP_ID + parentGroup.id, 'As Expected', level));
    for (var i = 0; i < subSets.length; i++) {
        var index = 0
        if (subSets[i].disproportionality > 0) {
            index = 0;
        }
        else if (subSets[i].disproportionality < 0) {
            index = 1;
        }
        else {
            index = 2;
        }
        newGroups[index].addSubSet(subSets[i])
    }
    return newGroups;
}

var groupByIntersectionSize = function (subSets, level, parentGroup) {
    var newGroups = [];
    newGroups.push(new Group(EMPTY_GROUP_ID + parentGroup.id, 'Degree 0 (in no set)', level));
    var maxSetSize = Math.min(usedSets.length, UpSetState.maxCardinality);
    for (var i = UpSetState.minCardinality; i < maxSetSize; i++) {
        newGroups.push(new Group(SET_SIZE_GROUP_PREFIX + (i + 1) + '_' + parentGroup.id, 'Degree ' + (i + 1) + " (" + (i + 1) + " set intersect.)", level));
    }
    subSets.forEach(function (subSet) {
        var group = newGroups[subSet.nrCombinedSets];
        if (group != null)
            group.addSubSet(subSet);
//        else
//            console.log('Fail ' + group + subSet.nrCombinedSets);
    })
    return newGroups;
}

/**
 * Creates groups for all sets containing all subsets of this set
 */
var groupBySet = function (subSets, level, parentGroup) {

    var newGroups = [];
    var noSet = new Group(EMPTY_GROUP_ID, 'No Set', level);
    newGroups.push(noSet);

    for (var i = 0; i < usedSets.length; i++) {
        var group = new Group(SET_BASED_GROUPING_PREFIX + (i + 1) + parentGroup.id, usedSets[i].elementName, level);
        group.combinedSets = Array.apply(null, new Array(usedSets.length)).map(Number.prototype.valueOf, 2);
        group.combinedSets[i] = 1;
        newGroups.push(group);

        subSets.forEach(function (subSet) {
            if (subSet.combinedSets[i] !== 0) {
                group.addSubSet(subSet);
            }

        });

    }

    subSets.forEach(function (subSet) {
        if (subSet.id == 0) {
            noSet.addSubSet(subSet);
            noSet.combinedSets = subSet.combinedSets;
        }
    });

    return newGroups;
};

/** Collapse or uncollapse group */
var collapseGroup = function (group) {
    group.isCollapsed = !group.isCollapsed;

    UpSetState.collapseChanged = true;
    updateState();
    return;

};

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

var sortByCombinationSize = function (subSets) {
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
var sortBySubSetSize = function (subSets) {
    var dataRows = getFilteredSubSets(subSets);
    dataRows.sort(function (a, b) {
        return b.setSize - a.setSize;
    });
    return dataRows;
}

/** sort by size of set overlap */
var sortByExpectedValue = function (subSets) {
    var dataRows = getFilteredSubSets(subSets);

    dataRows.sort(function (a, b) {
        return Math.abs(b.disproportionality) - Math.abs(a.disproportionality);
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
        if (UpSetState.collapseAll && !(UpSetState.levelTwoGrouping && group.nestedGroups )) {
            group.isCollapsed = true;
        }
        if (UpSetState.expandAll) {
            group.isCollapsed = false;
        }
//        if (UpSetState.levelTwoGrouping && group.nestedGroups && (!group.isCollapsed || UpSetState.collapseAll)) {
        if (UpSetState.levelTwoGrouping && group.nestedGroups && !group.isCollapsed) {

            dataRows = dataRows.concat(unwrapGroups(group.nestedGroups, []));
            continue;
        }
        if (!group.isCollapsed) {
            dataRows = dataRows.concat(StateMap[UpSetState.sorting](group.visibleSets));

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

    return dataRows;
};

var StateMap = {
    groupByIntersectionSize: groupByIntersectionSize,
    groupBySet: groupBySet,
    groupByRelevanceMeasure: groupByRelevanceMeasure,
    groupByOverlapDegree: groupByOverlapDegree,

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
    groupByOverlapDegree: 'groupByOverlapDegree',

    sortByCombinationSize: 'sortByCombinationSize',
    sortBySubSetSize: 'sortBySubSetSize',
    sortByExpectedValue: 'sortByExpectedValue',
    sortBySetItem: 'sortBySetItem'
};

var UpSetState = {
    collapseAll: false,
    expandAll: false,
    // collapseChanged: false,

    grouping: queryParameters["grouping"] || StateOpt.groupByIntersectionSize,
    levelTwoGrouping: undefined,

    /** the degree used in case of groupByOverlapDegree on L1 */
    levelOneDegree: 2,
    /** the degree used in case of groupByOverlapDegree on L2 */
    levelTwoDegree: 2,

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
        levelOneGroups = StateMap[StateOpt[UpSetState.grouping]](subSets, 1, "");

        if (UpSetState.levelTwoGrouping) {
            levelOneGroups.forEach(function (group) {
                group.nestedGroups = StateMap[StateOpt[UpSetState.levelTwoGrouping]](group.subSets, 2, group);
            });
        }
        dataRows = unwrapGroups(levelOneGroups);

    }
    else if (UpSetState.collapseChanged && UpSetState.grouping) {
        dataRows = unwrapGroups(levelOneGroups);
    }

    if (UpSetState.logicGroupChanged) {
        handleLogicGroups(subSets, 1);
        UpSetState.logicGroupChanged = false;

    }

    if (filterGroups && filterGroups.length > 0) {
        var filteredRows = unwrapGroups(filterGroups);
        var separator = new Separator("FILTER_SEPARATOR", 'Natural Intersections');
        filteredRows.push(separator);
        dataRows = filteredRows.concat(dataRows);
    }

    UpSetState.forceUpdate = false;
    UpSetState.expandAll = false;
    UpSetState.collapseAll = false;
    UpSetState.collapseChanged = false;

    renderRows.length = 0;

    var registry = {};
    var prefix = "";

    var count = 1;
    dataRows.forEach(function (element) {
        var wrapper = {};

        if (UpSetState.grouping === StateOpt.groupBySet || UpSetState.levelTwoGrouping === StateOpt.groupBySet) {
            if (element.type === ROW_TYPE.SUBSET) {
                wrapper.id = prefix + element.id;
            }
            else {
                prefix = element.id + "_";
                wrapper.id = element.id;
            }
        }
        else {

            if (registry.hasOwnProperty(element.id)) {
                count = registry[element.id];
                count += 1;
                registry[element.id] = count;
            }
            else {
                registry[element.id] = 1;
            }

            wrapper.id = element.id + '_' + count;
        }
        wrapper.data = element;
        renderRows.push(wrapper);

    });
    previousState = JSON.parse(JSON.stringify(UpSetState));

    queryParameters["grouping"] = UpSetState.grouping;
    // updateQueryParameters();

};

// external events that influence sort.js
function bindEventsForSort() {
    $(EventManager).bind("set-added", function (event, data) {
        UpSetState.logicGroups.forEach(function(lg){
            lg.orClauses.forEach(function(orClause){
                orClause[data.set.id] = {state:ctx.logicStates.DONTCARE};
            })
        })
        UpSetState.logicGroupChanged = true;

    })

    $(EventManager).bind("set-removed", function (event, data) {
        UpSetState.logicGroups.forEach(function(lg){

            lg.orClauses.forEach(function(orClause){
                delete orClause[data.set.id];
            })
        })
        UpSetState.logicGroupChanged = true;

    })


}

bindEventsForSort();
