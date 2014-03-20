/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/

Utilities = function() {
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