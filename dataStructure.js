/**
 * Created by alexsb on 2/4/14.
 */

ROW_TYPE =
{
    SET: "SET_TYPE",
    SUBSET: "SUBSET_TYPE",
    GROUP: "GROUP_TYPE",
    AGGREGATE: "AGGREGATE_TYPE"}

/** The input datasets */
var sets = [];
/** The ordered and grouped subsets */
var renderRows = [];
/** The dynamically created subSets */
var subSets = [];
/** The labels of the records */
var labels = [];
/** The number of combinations that are currently active */
var combinations = 0;
/** The depth of the dataset, i.e., how many records it contains */
var depth = 0;

/** Indices of selected items **/
var selectedItems = [];

/** The list of available datasets */
var dataSets;

/** Groups of subsets driven by group size */
var sizeGroups = [];

/**
 * Base class for Sets, subsets, groups.
 * @param setID
 * @param setName
 * @param combinedSets
 * @param setData
 * @constructor
 */
function BaseSet(setID, setName, combinedSets, setData) {
    /** The binary representation of the set */
    this.id = setID;
    /** The rowName of the set */
    this.rowName = setName;
    /** An array of all the sets that are combined in this set. The array contains a 1 if a set at the corresponding position in the sets array is combined. */
    this.combinedSets = combinedSets;

    /** The number of combined renderRows */
    this.nrCombinedSets = 0;

    /** The indices of the data items in this set */
    this.items = [];
    /** The number of elements in this (sub)set */
    this.setSize = 0;

    /** The ratio of elements that are contained in this set */
    this.dataRatio = 0.0;

    for (var i = 0; i < this.combinedSets.length; i++) {
        if (this.combinedSets[i] != 0) {
            this.nrCombinedSets++;
        }
    }

    for (var i = 0; i < setData.length; i++) {
        if (setData[i] != 0) {
            this.items.push(i);
            this.setSize++;
        }
    }

    this.dataRatio = this.setSize / depth;

}

function Set(setID, setName, combinedSets, itemList) {
    this.type = ROW_TYPE.SET;
    BaseSet.call(this, setID, setName, combinedSets, itemList);
    /** Array of length depth where each element that is in this subset is set to 1, others are set to 0 */
    this.itemList = itemList;
}

Set.prototype = BaseSet;
Set.prototype.constructor = BaseSet;

function SubSet(setID, setName, combinedSets, itemList, expectedValue) {
    this.type = ROW_TYPE.SUBSET;
    BaseSet.call(this, setID, setName, combinedSets, itemList);
    this.expectedValue = expectedValue;

    // this.expectedValueDeviation = this.setSize - this.expectedValue;
    this.expectedValueDeviation = (this.dataRatio - this.expectedValue) * depth;

    //   console.log(rowName + " DR: " + this.dataRatio + " EV: " + this.expectedValue + " EVD: " + this.expectedValueDeviation);

}

SubSet.prototype.toString = function () {
    return "Subset + " + this.id + " Nr Combined Sets: " + this.nrCombinedSets;
}

function Group(groupID, groupName) {
    this.type = ROW_TYPE.GROUP;
    this.rowName = groupName;
    this.id = groupID;
    this.visibleSets = [];
    this.hiddenSets = [];
    this.subSets = [];

    this.setSize = 0;
    this.expectedValue = 0;
    this.expectedValueDeviation = 0;

    this.addSubSet = function (subSet) {
        this.subSets.push(subSet);
        if (subSet.setSize > 0) {
            this.visibleSets.unshift(subSet);

        }
        else {
            this.hiddenSets.unshift(subSet);
        }

        this.setSize += subSet.setSize;
        this.expectedValue += subSet.expectedValue;
        this.expectedValueDeviation += subSet.expectedValueDeviation;
    }
}

// Not sure how to do this properly with parameters?
SubSet.prototype = Set;
SubSet.prototype.constructor = SubSet;

function makeSubSet(setMask) {
    var originalSetMask = setMask;

    var combinedSets = Array.apply(null, new Array(sets.length)).map(Number.prototype.valueOf, 0);
    var bitMask = 1;

    var combinedData = Array.apply(null, new Array(depth)).map(Number.prototype.valueOf, 1);

    var isEmpty = true;
    var expectedValue = 1;
    var notExpectedValue = 1;
    var name = "";
    for (var setIndex = sets.length - 1; setIndex >= 0; setIndex--) {
        var data = sets[setIndex].itemList;
        if ((setMask & bitMask) == 1) {
            combinedSets[setIndex] = 1;
            expectedValue *= sets[setIndex].dataRatio;
            name += sets[setIndex].rowName + " ";
        }
        else {
            notExpectedValue *= (1 - sets[setIndex].dataRatio);
        }
        for (i = 0; i < data.length; i++) {
            if ((setMask & bitMask) == 1) {
                if (!(combinedData[i] == 1 && data[i] == 1)) {
                    combinedData[i] = 0;
                }
            }
            else {
                // remove the element from the combined data if it's also in another set
                if ((combinedData[i] == 1 && data[i] == 1)) {
                    combinedData[i] = 0;
                }
            }
        }

        // update the set mask for the next iteration
        setMask = setMask >> 1;
    }

    expectedValue *= notExpectedValue;
    var subSet = new SubSet(originalSetMask, name, combinedSets, combinedData, expectedValue);
    subSets.push(subSet);
}

function groupBySetSize() {
    sizeGroups = [];
    for (var i = 0; i < sets.length; i++) {
        sizeGroups.push(new Group("SetSizeG_" + (i+1), (i +1) + "-Set Subsets"));
    }
    subSets.forEach(function (subSet) {
        var group = sizeGroups[subSet.nrCombinedSets - 1]
        if (group != null)
            group.addSubSet(subSet);
        else
            console.log("Fail" + group + subSet.nrCombinedSets);
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
        // move all elements with viewer intersections to the top
        if (a.nrCombinedSets != b.nrCombinedSets) {
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
        if (a.nrCombinedSets != b.nrCombinedSets) {
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
function sortBySetSizeGroups() {
    renderRows.length = 0;

    for (var i = 0; i < sizeGroups.length; i++) {
        var group = sizeGroups[i];
        renderRows.push(group);
        for (var j = 0; j < group.visibleSets.length; j++) {
            renderRows.push(group.visibleSets[j]);
        }
    }
}


