/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/


var Attribute = function() {
	// nothing here
};

Attribute.matchesType = function( sourceType, targetType ) {
	if ( sourceType === targetType ) {
		return true;
	}

	if ( sourceType === 'integer' ) {
		return targetType === 'numeric';
	}

	if ( sourceType === 'float' ) {
		return targetType === 'numeric';
	}

	return false;
};
