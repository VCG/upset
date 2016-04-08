/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 */

var Ui = function() {
    var self = this;

    self.lastWindowWidth = 0;
    self.lastWindowHeight = 0;

    // needs to be called
    self.initialize();
    self.initWidthHandler();
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
        var paddingBottom = parseInt( $(fixedYContainers[index]).css( 'padding-bottom' ) ) || 0;
       // console.log( paddingBottom );
        var targetHeight = ( $(window).height() - $(this).offset().top - paddingBottom ) * parseFloat( $(fixedYContainers[index]).attr("data-height-ratio") );
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

    $( "#load-data-header").on( "click", function( event ){
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


Ui.prototype.initWidthHandler = function(){
    $("#moveHandle").on("drag")

    $(function() {
        var isDragging = false;
        var startX = undefined;
        var endX = undefined;
        var leftWidth = undefined;
        var rightLeft = undefined;

        $("#moveHandle")
            .mousedown(function(event) {
                event.stopPropagation()
              //  console.log("MD");
                if ( !isDragging ) {
                    startX = event.clientX; //#set-vis-container
                    leftWidth = $(".ui-layout-center").width();
                    rightLeft = $(".ui-layout-east").offset().left;
                    isDragging = true;
                }

            });

        $(window).mouseup(function() {
            if ( isDragging ) {
//                endX = event.clientX;
//                $(".ui-layout-center").width( leftWidth + (endX - startX) );
//                   $("#right").offset( { left: rightLeft + (endX - startX) } );
//                   $("#right").width( rightLeft - (endX - startX) );
                isDragging = false;
            }


        });

        $(window).mousemove(function(event) {

            if ( isDragging ) {
                endX = event.clientX;

                event.stopPropagation()

                $(".ui-layout-center").width( leftWidth + (endX - startX) );
                $("#vis").width( leftWidth + (endX - startX) );
//                $("#vis svg").width( leftWidth + (endX - startX) );
//                $("#right").offset( { left: rightLeft + (endX - startX) } );
//                $("#right").width( rightLeft - (endX - startX) );

                $(EventManager).trigger( "vis-svg-resize", { newWidth:+(leftWidth + (endX - startX)) });

            }
        });

    });






}
