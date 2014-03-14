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
        console.log(d);
        updateSetContainment(d);        
        console.log(d.elementName + ": " + d.isSelected);
    }
}

function plotSetOverview() {

    var majorPadding = 5;
    var minorPadding = 2;
    var cellDistance = 20;
    var cellSize = cellDistance;// - minorPadding;
    var setCellDistance = 12;
    var setCellSize = 10;
    var textHeight = 60;

    var overview = d3.select('#vis').select('svg').append("g").attr({
        class: "visOverview",
        "transform": "translate(" + 0 + "," + 0 + ")"
    })

    var usedSetsLabels = overview.append("g").attr("class", "usedSets").selectAll('.setLabel')
        .data(usedSets)
        .enter();

    // ------------------- set size bars --------------------

    // scale for the size of the subSets, also used for the sets
    var setSizeScale = d3.scale.linear().domain([0, d3.max(usedSets, function (d) {
        return d.setSize;
    })]).nice().range([0, textHeight]);

    usedSetsLabels
        .append('rect')
        .attr({
            class: 'setSizeBackground',
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i )) + ', 60)'
            }, // ' + (textHeight - 5) + ')'
            height: textHeight,
            width: cellSize//setRowScale.rangeBand()
        })
        .on('click', setClicked)


    // background bar
    usedSetsLabels
        .append('rect')
        .attr({
            class: 'setSize',
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i )) + ', ' + ( textHeight - minorPadding - setSizeScale(d.setSize) + 60) + ')'
            }, // ' + (textHeight - 5) + ')'
            height: function (d) {
                return setSizeScale(d.setSize);
            },
            width: cellSize//setRowScale.rangeBand()
        })
      //  .attr("transform", "skewX(45)")
        .on('mouseover', mouseoverColumn)
        .on('mouseout', mouseoutColumn)
        .on('click', setClicked)

    var unusedSets = sets.filter(function(n) {
        return usedSets.indexOf(n) == -1
    });

    var truncateAfter = 15;

    var unusedSetsLabels = overview.append("g").attr("class", "unusedSets").selectAll('.unsedSetsLabel')
        .data(unusedSets)
        .enter();

    unusedSetsLabels
            .append('rect')
            .attr({
                class: 'unusedSetSizeBackground',
                transform: function (d, i) {
                    return 'translate(' + (cellDistance * (i ) + usedSets.length*cellSize) + ', 60)'
                },
                height: textHeight,
                width: cellSize
            })
            .on('click', setClicked)

    // background bar
    unusedSetsLabels
        .append('rect')
        .attr({
            class: 'unusedSetSize',
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i ) + usedSets.length*cellSize) + ', ' + ( textHeight - minorPadding - setSizeScale(d.setSize) + 60) + ')'
            }, // ' + (textHeight - 5) + ')'
            height: function (d) {
                return setSizeScale(d.setSize);
            },
            width: cellSize
        })
       // .on('mouseover', mouseoverColumn)
       // .on('mouseout', mouseoutColumn)
        .on('click', setClicked)

    unusedSetsLabels.append('text').text(
        function (d) {
            return d.elementName.substring(0, truncateAfter);
        }).attr({
            class: 'setLabel',
            id: function (d) {
                return d.elementName.substring(0, truncateAfter);
            },
                transform: function (d, i) {
                    return 'translate(' + (cellDistance * (i + 1) + usedSets.length*cellSize + 5) + ', 115) rotate(90)'
                },
            y: cellSize - 3,
            x: 3,
            'text-anchor': 'end'

//            transform: function (d, i) {
//                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
//            }
      })
      .on('click', setClicked)

    function setClicked(d) {
        console.log(d);
        updateSetContainment(d);        
        console.log(d.elementName + ": " + d.isSelected);
    }


}