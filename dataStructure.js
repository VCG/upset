/**
 * Created by alexsb on 2/4/14.
 */

/** The input datasets */
var sets = [];
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
    this.setID = setID;
    /** The name of the set */
    this.setName = setName;
    /** An array of all the sets that are combined in this set. The array contains a 1 if a set at the corresponding position in the sets array is combined. */
    this.combinedSets = combinedSets;

    /** The number of combined subSets */
    this.nrCombinedSets = 0;

    /** The indices of the data items in this set */
    this.items =[];
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
    BaseSet.call(this, setID, setName, combinedSets, itemList);
    /** Array of length depth where each element that is in this subset is set to 1, others are set to 0 */
    this.itemList = itemList;
}

Set.prototype = BaseSet;
Set.prototype.constructor = BaseSet;


function SubSet(setID, setName, combinedSets,itemList, expectedValue) {
    BaseSet.call(this, setID, setName, combinedSets, itemList);
    this.expectedValue = expectedValue;
    this.expectedValueDeviation = (this.dataRatio - this.expectedValue) * depth;
    //   console.log(setName + " DR: " + this.dataRatio + " EV: " + this.expectedValue + " EVD: " + this.expectedValueDeviation);

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
    var name = ""
    for (var setIndex = sets.length - 1; setIndex >= 0; setIndex--) {
        var data = sets[setIndex].itemList;
        if ((setMask & bitMask) == 1) {
            combinedSets[setIndex] = 1;
            expectedValue *= sets[setIndex].dataRatio;
            name += sets[setIndex].setName + " ";
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


// ----------------------- Sort Functions ----------------------------


function sortOnSetItem(set) {
    var setIndex = sets.indexOf(set);
    subSets.sort(function (a, b) {
        // move all elements that contain the clicked set to the top
        if (b.combinedSets[setIndex] !== a.combinedSets[setIndex]) {
            return b.combinedSets[setIndex] - a.combinedSets[setIndex];
        }
        // move all elements with viewer intersections to the top
        if (a.nrCombinedSets != b.nrCombinedSets) {
            return a.nrCombinedSets - b.nrCombinedSets;
        }
        // if the number of combined sets is identical, we can pick the largest one
        return b.setID - a.setID;
    });
}

function sortByCombinationSize() {
// sort by number of combinations
    subSets.sort(function (a, b) {
        if (a.nrCombinedSets != b.nrCombinedSets) {
            return a.nrCombinedSets - b.nrCombinedSets;
        }
        // if the number of combined sets is identical, we can pick the largest one
        return b.setID - a.setID;
    });
}

function sortBySubsetSize() {
// sort by size of set overlap
    subSets.sort(function (a, b) {
        return b.setSize - a.setSize;
    });
}

function sortByExpectedValue() {
// sort by size of set overlap
    subSets.sort(function (a, b) {
        return Math.abs(b.expectedValueDeviation) - Math.abs(a.expectedValueDeviation);
    });
}


