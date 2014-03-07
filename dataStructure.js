/**
 * Created by alexsb on 2/4/14.
 */


ROW_TYPE =
{
    SET: 'SET_TYPE',
    SUBSET: 'SUBSET_TYPE',
    GROUP: 'GROUP_TYPE',
    AGGREGATE: 'AGGREGATE_TYPE',
    UNDEFINED: 'UNDEFINED'}

/** The input datasets */
var sets = [];
/** The sets currently in use */
var usedSets = [];
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

/** How many sets do we want to see by default */
var nrDefaultSets = 3;

/**
 * The base element for all rows (sets, groups, subsets, aggregates)
 * @param id
 * @param elementName
 * @constructor
 */
function Element(id, elementName) {
    this.id = id;
    this.elementName = elementName;
    /** The indices of the data items in this set */
    this.items = [];
    /** The number of elements in this (sub)set */
    this.setSize = 0;
    /** The ratio of elements that are contained in this set */
    this.dataRatio = 0.0;

}

/**
 * Base class for Sets, subsets, groups.
 *
 * The setID is set to Element.id and is a binary representation of the contained set
 * @param setID
 * @param setName
 * @param combinedSets
 * @param setData
 * @constructor
 */
function BaseSet(setID, setName, combinedSets, setData) {
    Element.call(this, setID, setName);

    /** An array of all the sets that are combined in this set. The array contains a 1 if a set at the corresponding position in the sets array is combined. */
    this.combinedSets = combinedSets;

    /** The number of combined renderRows */
    this.nrCombinedSets = 0;

    for (var i = 0; i < this.combinedSets.length; i++) {
        if (this.combinedSets[i] !== 0) {
            this.nrCombinedSets++;
        }
    }

    for (var i = 0; i < setData.length; i++) {
        if (setData[i] !== 0) {
            this.items.push(i);
            this.setSize++;
        }
    }

    this.dataRatio = this.setSize / depth;

}

BaseSet.prototype = Element;
BaseSet.prototype.constructor = Element;

function Set(setID, setName, combinedSets, itemList) {
    BaseSet.call(this, setID, setName, combinedSets, itemList);
    this.type = ROW_TYPE.SET;
    /** Array of length depth where each element that is in this subset is set to 1, others are set to 0 */
    this.itemList = itemList;
    this.isSelected = false;
}

Set.prototype = BaseSet;
Set.prototype.constructor = BaseSet;

function SubSet(setID, setName, combinedSets, itemList, expectedValue) {
    BaseSet.call(this, setID, setName, combinedSets, itemList);
    this.type = ROW_TYPE.SUBSET;
    this.expectedValue = expectedValue;

    // this.expectedValueDeviation = this.setSize - this.expectedValue;
    this.expectedValueDeviation = (this.dataRatio - this.expectedValue) * depth;
}

SubSet.prototype.toString = function () {
    return 'Subset + ' + this.id + ' Nr Combined Sets: ' + this.nrCombinedSets;
}

// Not sure how to do this properly with parameters?
SubSet.prototype = Set;
SubSet.prototype.constructor = SubSet;

function Group(groupID, groupName) {
    Element.call(this, groupID, groupName);
    this.type = ROW_TYPE.GROUP;

    /** all subsets */
    this.subSets = [];
    /** the visible subsets */
    this.visibleSets = [];
    this.aggregate = new Aggregate('empty' + groupID, 'Empty Subsets');
    /** the hidden/aggregated subsets */
    this.hiddenSets = [];

    //this.setSize = 0;
    this.expectedValue = 0;
    this.expectedValueDeviation = 0;

    this.addSubSet = function (subSet) {
        this.subSets.push(subSet);
        if (subSet.setSize > 0) {
            this.visibleSets.unshift(subSet);

        }
        else {
            this.hiddenSets.unshift(subSet);
            this.aggregate.addSubSet(subSet);
        }
        this.items = this.items.concat(subSet.items);
        this.setSize += subSet.setSize;
        this.expectedValue += subSet.expectedValue;
        this.expectedValueDeviation += subSet.expectedValueDeviation;
    }
}

Group.prototype = Element;
Group.prototype.constructor = Element;

function Aggregate(aggregateID, aggregateName) {
    Element.call(this, aggregateID, aggregateName);
    this.type = ROW_TYPE.AGGREGATE;
    this.subSets = [];

    //this.setSize = 0;
    this.expectedValue = 0;
    this.expectedValueDeviation = 0;

    this.addSubSet = function (subSet) {
        console.log('test');
        this.subSets.push(subSet);
        this.items = this.items.concat(subSet.items);
        this.setSize += subSet.setSize;
        this.expectedValue += subSet.expectedValue;
        this.expectedValueDeviation += subSet.expectedValueDeviation;
    }
}

Aggregate.prototype = Element;
Aggregate.prototype.constructor = Element;

function makeSubSet(setMask) {
    var originalSetMask = setMask;

    var combinedSets = Array.apply(null, new Array(usedSets.length)).map(Number.prototype.valueOf, 0);
    var bitMask = 1;

    var combinedData = Array.apply(null, new Array(depth)).map(Number.prototype.valueOf, 1);

    var isEmpty = true;
    var expectedValue = 1;
    var notExpectedValue = 1;
    var name = '';
    for (var setIndex = usedSets.length - 1; setIndex >= 0; setIndex--) {
        var data = usedSets[setIndex].itemList;
        if ((setMask & bitMask) === 1) {
            combinedSets[setIndex] = 1;
            expectedValue *= usedSets[setIndex].dataRatio;
            name += usedSets[setIndex].elementName + ' ';
        }
        else {
            notExpectedValue *= (1 - usedSets[setIndex].dataRatio);
        }
        for (i = 0; i < data.length; i++) {
            if ((setMask & bitMask) === 1) {
                if (!(combinedData[i] === 1 && data[i] === 1)) {
                    combinedData[i] = 0;
                }
            }
            else {
                // remove the element from the combined data if it's also in another set
                if ((combinedData[i] === 1 && data[i] === 1)) {
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