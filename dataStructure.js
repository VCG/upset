/**
 * Created by alexsb on 2/4/14.
 */


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