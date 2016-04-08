/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/

var Utilities = function() {
};


Utilities.generateUuid = function() {
    // see broofa's answer in http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    return ( 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16) ;
    }) );
};

Utilities.truncate = function(textElement, w) {

  var too_large = true;

  if(textElement[0][0].getBBox().width<w)
    too_large = false;

  while(too_large) {

    var bbox = textElement[0][0].getBBox();
    var width = bbox.width;
    var height = bbox.height;

    textElement.text(textElement.text().substring(0, textElement.text().length-1));

    if(textElement[0][0].getBBox().width<w)
      too_large = false;

  }

  return textElement.text();
}

// attach the .compare method to Array's prototype to call it on any array
Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

//
Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};
