/**
 * Created by Alexander Lex on 2/4/14.
 */


var ROW_TYPE =
{
    SET: 'SET_TYPE',
    SUBSET: 'SUBSET_TYPE',
    GROUP: 'GROUP_TYPE',
    AGGREGATE: 'AGGREGATE_TYPE',
    QUERY_GROUP: 'QUERY_GROUP_TYPE',
    SEPARATOR: 'SEPARATOR',
    UNDEFINED: 'UNDEFINED'}

/** the user interface */
var ui; // initialized on document ready event

/** The input datasets */
var sets = [];
var setIdToSet = {};
/** The sets currently in use */
var usedSets = [];
/** The ordered and grouped subsets */
var dataRows = [];
/** Same as dataRows but including a wrapper for the data */
var renderRows = [];
/** The dynamically created subSets */
var subSets = [];
/** The labels of the records */
var labels = [];
/** meta data attributes of the records/items */
var attributes = [];
/** attributes selected by the user (for item visualizations) */
var selectedAttributes = {};
/** The number of combinations that are currently active */
var combinations = 0;

var depth = 0;

/** The depth of the dataset, i.e., how many records it contains */

/** an array representing all items */
var allItems = [];

//var filter = new Filter();

/** Indices of selected items **/
var selectedItems = [];

var selections = new SelectionList(); //an array of selection

var elementViewers = new ElementViewerCollection( "#element-viewers-controls", "#element-viewers-visualization" );

/** The list of available datasets */
var dataSets;

/** Groups of subsets driven by group size */
//var sizeGroups = [];

/** Groups of subsets driven by set containment */
//var setGroups = [];

/** Venn diagram for tutorial mode */
var venn = new VennDiagram("#venn-vis", 40);

/** The current primary grouping */
var levelOneGroups;
/** The smart filter groups */
var filterGroups;

/** How many sets do we want to see by default */
var nrDefaultSets = 6;

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

function Separator(id, elementName) {
    Element.call(this, id, elementName);

    this.type = ROW_TYPE.SEPARATOR;

}

Separator.prototype = Element;
Separator.prototype.constructor = Element;
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
function BaseSet(setID, setName, combinedSets, setData, fake) {
    Element.call(this, setID, setName);

    /** An array of all the sets that are combined in this set. The array contains a 1 if a set at the corresponding position in the sets array is combined. */
    this.combinedSets = combinedSets;

    /** The number of combined dataRows */
    this.nrCombinedSets = 0;

    for (var i = 0; i < this.combinedSets.length; i++) {
        if (this.combinedSets[i] !== 0) {
            this.nrCombinedSets++;
        }
    }
//    console.log(this.nrCombinedSets);

    for (var i = 0; i < setData.length; i++) {
            this.items.push(setData[i]);
            this.setSize++;
    }

//    for (var i = 0; i < setData.length; i++) {
//        if (setData[i] !== 0) {
//            this.items.push(i);
//            this.setSize++;
//        }
//    }

    this.dataRatio = this.setSize / depth;
}

BaseSet.prototype = Element;
BaseSet.prototype.constructor = Element;

function USet(setID, setName, combinedSets, itemList) {
    BaseSet.call(this, setID, setName, combinedSets,[],1);
        for (var i = 0; i < itemList.length; i++) {
        if (itemList[i] !== 0) {
            this.items.push(i);
            this.setSize++;
        }
    }
    this.dataRatio = this.setSize / depth;

    this.type = ROW_TYPE.SET;
    /** Array of length depth where each element that is in this subset is set to 1, others are set to 0 */
    this.itemList = itemList;
    this.isSelected = false;

}

USet.prototype = BaseSet;
USet.prototype.constructor = BaseSet;

function SubSet(setID, setName, combinedSets, itemList, expectedProb) {
    BaseSet.call(this, setID, setName, combinedSets, itemList);
    this.type = ROW_TYPE.SUBSET;
    this.expectedProb = expectedProb;
    this.selections = {};

    var observedProb = this.setSize*1.0 / depth;

//    this.disproportionality =

    this.disproportionality =  observedProb-expectedProb;
//    if (this.disproportionality<1 && this.disproportionality>0) this.disproportionality=-(1/this.disproportionality);
//    if (this.disproportionality>10) this.disproportionality=20;
//    if (this.disproportionality<-10) this.disproportionality=-20;

}

SubSet.prototype.toString = function () {
    return 'Subset + ' + this.id + ' Nr Combined Sets: ' + this.nrCombinedSets;
}

// Not sure how to do this properly with parameters?
SubSet.prototype = USet;
SubSet.prototype.constructor = SubSet;

function Group(groupID, groupName, level) {
    Element.call(this, groupID, groupName);
    this.type = ROW_TYPE.GROUP;

    this.isCollapsed = false;

    this.nestedGroups = undefined;

    /** the nesting level of the group, 1 is no nesting, 2 is one level down */
    this.level = 1;
    if (level) {
        this.level = level;
    }

    /** all subsets */
    this.subSets = [];
    /** the visible subsets */
    this.visibleSets = [];
    this.aggregate = new Aggregate('empty' + groupID, ' Subsets', level + 1);
    /** the hidden/aggregated subsets */
    this.hiddenSets = [];

    //this.setSize = 0;
    this.expectedProb = 0;
    this.disproportionality = 0;
    this.disproportionalitySum =0;

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
        this.expectedProb += subSet.expectedProb;
        this.disproportionality += subSet.disproportionality;
//        if (this.subSets.length>0)
//            this.disproportionality = this.disproportionalitySum/this.subSets.length;

//        this.disproportionality += subSet.disproportionality;
    }

    this.contains = function (element) {
        if (subSets.indexOf(element) >= 0) {
            return true;
        }
        if (element === this.aggregate) {
            return true;
        }
        return false;

    }
}

Group.prototype = Element;
Group.prototype.constructor = Element;

function QueryGroup(groupID, groupName, orClauses) {
    this.type = ROW_TYPE.QUERY_GROUP;
    Group.call(this, groupID, groupName, 1);
    this.orClauses = orClauses;
    // if simple OR Group.. create combinedSet Element
    if (orClauses.length==1){
        this.combinedSets=Object.keys(orClauses[0]).map(function(key){
            return orClauses[0][key].state
        })
    }
}

QueryGroup.prototype = Group;
QueryGroup.prototype.constructor = Group;

function Aggregate(aggregateID, aggregateName, level) {
    Element.call(this, aggregateID, aggregateName);
    this.type = ROW_TYPE.AGGREGATE;
    this.subSets = [];

    this.isCollapsed = true;

    /** the nesting level of the group, 1 is no nesting, 2 is one level down */
    this.level = level;

    //this.setSize = 0;
    this.expectedProb = 0;
    this.disproportionality = 0;

    this.addSubSet = function (subSet) {
        this.subSets.push(subSet);
        this.items = this.items.concat(subSet.items);
        this.setSize += subSet.setSize;
        this.expectedProb += subSet.expectedProb;
        this.disproportionality += subSet.disproportionality;
    }
}

Aggregate.prototype = Element;
Aggregate.prototype.constructor = Element;

function makeSubSet(setMask) {

    var bitMask = 1;
    var tempMask = setMask;
    var sum = 0;
    for (var i = 0; i < usedSets.length; i++) {
        if ((tempMask & bitMask) === 1) {
            sum += 1;
            if (sum > UpSetState.maxCardinality) {
                return;
            }
        }
        tempMask = tempMask >> 1;
    }
    if (sum < UpSetState.minCardinality) {
        return;
    }
    var originalSetMask = setMask;

    var combinedSets = Array.apply(null, new Array(usedSets.length)).map(Number.prototype.valueOf, 0);
//    console.log("combinedSets:",combinedSets);

    var combinedData = Array.apply(null, new Array(depth)).map(Number.prototype.valueOf, 1);

    var isEmpty = true;
    var expectedValue = 1;
    var notExpectedValue = 1;
    var name = '';
    for (var setIndex = usedSets.length - 1; setIndex >= 0; setIndex--) {
        var data = usedSets[setIndex].itemList;
        if ((setMask & bitMask) === 1) {
            combinedSets[setIndex] = 1;
            expectedValue  = expectedValue *  usedSets[setIndex].dataRatio;
            name += usedSets[setIndex].elementName + ' ';
        }
        else {
            notExpectedValue = notExpectedValue * (1- usedSets[setIndex].dataRatio);
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


//    console.log(expectedValue, notExpectedValue);
//    console.log("combinedData:", combinedData);
    expectedValue *= notExpectedValue;
  //  console.log(originalSetMask,name,combinedSets,combinedData,expectedValue);
    var subSet = new SubSet(originalSetMask, name, combinedSets, combinedData, expectedValue);
    subSets.push(subSet);
}

/** takes  a list l of arrays a(i) which represent disjunctive normal form: a(i) OR a(i+1) OR...
 a(i) represents a setMask: 0 - NOT, 1 - MUST, 2- DONTCARE
 if callFunction is null a list of matching subsets is returned
 */
var getSubsetsForMaskList = function (subsets, maskList, callFunction) {
    var res = [];

    var clauseMatches = true;
    var isAhit = false;
    subsets.forEach(function (subset) {

        isAhit = false;
        var combinedSets = subset.combinedSets;
        maskList.forEach(function (compare) {
            if (isAhit == false) {
                var csLength = combinedSets.length
                clauseMatches = (csLength == compare.length)
                if (clauseMatches) {
                    for (var i = 0; i < csLength; i++) {
                        clauseMatches &= (
                            (combinedSets[i] == compare[i])
                                || compare[i] == 2 );
                    }
                }
                if (clauseMatches) {
                    isAhit = true;
                }
            }
        })

        if (isAhit && callFunction != null) {
            callFunction(subset);

        } else if (isAhit) {
            res.push(subset);
        }
    })
    return res;
}
