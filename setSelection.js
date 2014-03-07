function plotSetSelection() {
    var cellDistance = 20;
    var cellSize = 18;
    var w = 120;
    var headerHeight = 40;
    var setHeight = sets.length * cellDistance
    var h = setHeight + headerHeight;

    var truncateAfter = 25;

    d3.select('#setSelect').select('svg').remove();
    var svg = d3.select('#setSelect').append('svg').attr('width', w)
        .attr('height', h);

    svg.append('text').text('Choose Sets').attr({
        transform: 'translate(0, 20)'
    });

    var setRowScale = d3.scale.ordinal().rangeRoundBands([ headerHeight, h ], 0);
    setRowScale.domain(sets.map(function (d) {
        return d.id;
    }));

    var setGrp = svg.selectAll('.setRow')
        .data(sets)
        .enter()
        .append('g')
        .attr({transform: function (d, i) {
            return 'translate(0, ' + setRowScale(d.id) + ')';
            //  return 'translate(0, ' + ( cellDistance * (i)) + ')';
        },
            class: 'setRow'});

    setGrp.append('rect').attr({
        class: 'setSelectBackground',
        width: w,
        height: cellSize,
        fill: function (d) {
            if (d.isSelected)
                return '#d3d3d3';
            else
                return '#ffffff';
        }


//            transform: function (d, i) {
//                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
//            }

    }).on('click', setClicked);

    setGrp.append('text').text(
        function (d) {
            return d.elementName.substring(0, truncateAfter);
        }).attr({
            class: 'groupLabel',
            id: function (d) {
                return d.elementName.substring(0, truncateAfter);
            },

            y: cellSize - 3,
            x: 3,
            'font-size': cellSize - 4

//            transform: function (d, i) {
//                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
//            }

        }).on('click', setClicked);

    function setClicked(d) {
        updateSetContainment(d);
        console.log(d.elementName + d.isSelected);
    }
}