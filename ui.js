/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 */

Ui = function() {
    var self = this;

    self.lastWindowWidth = 0;
    self.lastWindowHeight = 0;

    self.initialize();
};

/**
 * update container sizes
 */
Ui.prototype.resize = function( event ) {
    if ( ( self.lastWindowWidth != $(window).width() ) && ( self.lastWindowHeight != $(window).height() ) ) {
        $(EventManager).trigger( "ui-resize", { newWidth: $(window).width(), oldWidth: self.lastWindowWidth, newHeight: $(window).height(), oldHeight: self.lastWindowHeight } );

        self.lastWindowHeight = $(window).height();
        self.lastWindowWidth = $(window).width();

        return;
    }

    if ( self.lastWindowWidth != $(window).width() ) {
        $(EventManager).trigger( "ui-horizontal-resize", { newWidth: $(window).width(), oldWidth: self.lastWindowWidth } );

        self.lastWindowWidth = $(window).width();

        return;
    }

    if ( self.lastWindowHeight != $(window).height() ) {
        $(EventManager).trigger( "ui-vertical-resize", { newHeight: $(window).height(), oldHeight: self.lastWindowHeight } );

        self.lastWindowHeight = $(window).height();

        return;
    }
}


Ui.prototype.updateFixedHeightContainers = function() {
    var fixedYContainers = $('.fixed-y-container');
    fixedYContainers.map( function(index) {
        var targetHeight = ( $(window).height() - $(this).offset().top - 20 ) * parseFloat( $(fixedYContainers[index]).attr("data-height-ratio") );
        
        var minHeight = parseInt( $('.fixed-y-container').css( "min-height" ) );
        var maxHeight = parseInt( $('.fixed-y-container').css( "max-height" ) ) || targetHeight;

        var newHeight = Math.min( Math.max( targetHeight, minHeight ), maxHeight );
        $(this).css('height', newHeight + 'px');  
    });        
}


Ui.prototype.initialize = function() {
    var self = this;

    self.lastWindowHeight = $(window).height();
    self.lastWindowWidth = $(window).width();

    self.createHeader();
    self.hideMenu();
    self.updateFixedHeightContainers();   
}

Ui.prototype.createHeader = function() {
    var self = this;

    $( "#show-menu-button").on( "click", function( event ){
        self.toggleMenu();
    });    
}

Ui.prototype.showMenu = function() {
    var self = this;

    $(".ui-menu").show();
}

Ui.prototype.hideMenu = function() {
    var self = this;

    $(".ui-menu").hide();
}

Ui.prototype.toggleMenu = function() {
    var self = this;

    $(".ui-menu").slideToggle( { step: self.updateFixedHeightContainers } );
    //$( "#show-menu-button").toggleClass( "fa-spin");
}