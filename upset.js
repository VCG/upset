$(EventManager).bind( "item-selection-added", function( event, data ) {
    console.log( "Selection was added to selection list with color " + selections.getColor( data.selection ) + ' and ' + data.selection.items.length + ' items.' );

    plotSelectionTabs( "#selection-tabs", selections, data.selection );
    plotSelectedItems( "#item-table", data.selection );
});

$(EventManager).bind( "item-selection-updated", function( event, data ) {
    console.log( 'Selection was updated! New length is ' + data.selection.items.length + ' items.' );

    plotSelectionTabs( "#selection-tabs", selections, data.selection );
    plotSelectedItems( "#item-table", data.selection );
});


$(EventManager).bind( "item-selection-removed", function( event, data ) {
    console.log( "Selection was removed from selection list." );

    var newActiveSelectionIndex = data.index > 0 ? data.index - 1 : 0;

    plotSelectionTabs( "#selection-tabs", selections, selections.getSelection(newActiveSelectionIndex) );
    plotSelectedItems( "#item-table", selections.getSelection(newActiveSelectionIndex) );
});

function plot() {

    var cellDistance = 20;
    var cellSize = 18;
    var textHeight = 60;
    var textSpacing = 3;

    var majorPadding = 5;
    var xStartSetSizes = cellDistance * usedSets.length + majorPadding;
    var setSizeWidth = 700;
    var subSetSizeWidth = 300;

    /** The width from the start of the set vis to the right edge */


    var xStartExpectedValues = xStartSetSizes + subSetSizeWidth + 20;
    var expectedValueWidth = 300;

    var setVisWidth = expectedValueWidth + subSetSizeWidth + majorPadding + cellDistance + xStartSetSizes;

    var labelTopPadding = 15;

    var paddingTop = 30;
    var paddingSide = 20;

    var truncateAfter = 25;

    var setCellDistance = 12;
    var setCellSize = 10;

    var w = 850;
    var setMatrixHeight = usedSets.length * setCellDistance + majorPadding;
    var subSetMatrixHeight;
    var h;
    var svgHeight = 600;

    var rowScale;

    function initRows() {

        subSetMatrixHeight = renderRows.length * cellDistance;
        h = subSetMatrixHeight + textHeight + setMatrixHeight;

        rowScale = d3.scale.ordinal().rangeRoundBands([ setMatrixHeight + textHeight, h ], 0);

        rowScale.domain(renderRows.map(function (d) {
            return d.id;
        }));
    }

    initRows();

    d3.select('#vis').select('svg').remove();
    var svg = d3.select('#vis').append('svg').attr('width', w)
        .attr('height', svgHeight);

    // Rows container for vertical panning
    var gRows = svg.append('g')
        .attr('class', 'gRows')
        .data([
            {'x': 0, 'y': 0}
        ]);

    // Extra layer for vertical panning
    svg.append('rect').attr({
        x: 0,
        y: 0,
        width: w,
        height: (setMatrixHeight + textHeight - 5),
        fill: 'white'
    });
    //####################### SETS ##################################################

    var rowRientation = 'horizontal'; // 'vertical'

    if (rowRientation === 'horizontal') {

        var setRowScale = d3.scale.ordinal().rangeRoundBands([ 0, setMatrixHeight - majorPadding ], 0);

        setRowScale.domain(usedSets.map(function (d) {
            return d.id;
        }));

        var setGrp = svg.selectAll('.setRow')
            .data(usedSets, function (d) {
                return d.id;
            })
            .enter()
            .append('g')
            .attr({transform: function (d, i) {
                return 'translate(0, ' + setRowScale(d.id) + ')';
                //  return 'translate(0, ' + ( cellDistance * (i)) + ')';
            },
                class: 'setRow'});

        // ------------ the connection lines ----------------------

        svg.selectAll('.connection')
            .data(usedSets)
            .enter()
            .append('polygon')
            .attr({
                points: function (d, i) {

                    // lower edge
                    var subLeft = ( cellDistance * i) + ', ' + setMatrixHeight + ' ';
                    var subRight = (cellDistance * (i + 1) - 2) + ', ' + setMatrixHeight + ' ';
                    var setTop = xStartSetSizes + ', ' + (setCellDistance * i  ) + ' ';
                    var setBottom = xStartSetSizes + ', ' + (setCellDistance * (i + 1) - 2) + ' ';

                    return (subLeft + subRight + setBottom + setTop );
                },
                class: 'connection diagonal'
            }
        )
            .on('mouseover', mouseoverColumn)
            .on('mouseout', mouseoutColumn)

        // ------------------- set size bars --------------------

        // scale for the size of the subSets, also used for the sets
        var subSetSizeScale = d3.scale.linear().domain([0, d3.max(renderRows, function (d) {
            console.log(" a " + d.data.setSize);
            return d.data.setSize;
        })]).nice().range([0, subSetSizeWidth]);

        svg.selectAll('.setRow')
            .append('rect')
            .attr({
                class: 'setSize',
                transform: 'translate(' + xStartSetSizes + ', 0)', // ' + (textHeight - 5) + ')'
                width: function (d) {
                    return subSetSizeScale(d.setSize);
                },
                height: setCellSize//setRowScale.rangeBand()
            })
            .on('mouseover', mouseoverColumn)
            .on('mouseout', mouseoutColumn)

    } else { // vertical rows

        var setRowScale = d3.scale.ordinal().rangeRoundBands([ 0, usedSets.length * (cellSize + 2)], 0);

        var subSetSizeHeight = setMatrixHeight - majorPadding;

        setRowScale.domain(usedSets.map(function (d) {
            return d.id;
        }));

        var setGrp = svg.selectAll('.setRow')
            .data(usedSets)
            .enter()
            .append('g')
            .attr({transform: function (d, i) {
                return 'translate(' + setRowScale(d.id) + ', 0)';
                //  return 'translate(0, ' + ( cellDistance * (i)) + ')';
            },
                class: 'setRow'});

        // ------------------- set size bars --------------------

        // scale for the size of the subSets, also used for the sets
        var subSetSizeScale = d3.scale.linear().domain([0, d3.max(renderRows, function (d) {
            return d.data.setSize;
        })]).nice().range([0, subSetSizeHeight]);

        svg.selectAll('.setRow')
            .append('rect')
            .attr({
                class: 'setSize',
                transform: function (d) {
                    return 'translate(0, ' + (subSetSizeHeight - subSetSizeScale(d.setSize)) + ')'
                }, // ' + (textHeight - 5) + ')'
                height: function (d) {
                    return subSetSizeScale(d.setSize);
                },
                width: cellSize//setRowScale.rangeBand()
            });

    }


// ------------ the set labels -------------------

    var setLabels = svg.selectAll('.setLabel')
        .data(usedSets)
        .enter();

    setLabels.append('rect').attr({
        transform: function (d, i) {
            return 'translate(' + (cellDistance * i ) + ', ' + setMatrixHeight + ')';
        },
        width: cellSize,
        height: textHeight - 2,
        class: 'connection vertical'
    })
        .on('mouseover', mouseoverColumn)
        .on('mouseout', mouseoutColumn)

    setLabels.append('text').text(
        function (d) {
            return d.elementName.substring(0, truncateAfter);
        }).attr({
            class: 'setLabel',
            id: function (d) {
                return d.elementName.substring(0, truncateAfter);
            },
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
            }

        })
        .on('mouseover', mouseoverColumn)
        .on('mouseout', mouseoutColumn)

//    var rowScale = d3.scale.ordinal().rangeRoundBands([ setMatrixHeight + textHeight, h ], 0);
//
//    rowScale.domain(dataRows.map(function (d) {
//        return d.id;
//    }));



    // ------------------- set size bars header --------------------

    svg.append('rect')
        .attr({
            class: 'labelBackground subsetSizeLabel',
            transform: 'translate(' + xStartSetSizes + ',' + (setMatrixHeight + labelTopPadding) + ')',
            height: '20',
            width: subSetSizeWidth

        });

    svg.append('text').text('Subset Size')
        .attr({
            class: 'columnLabel subsetSizeLabel',
            transform: 'translate(' + (xStartSetSizes + subSetSizeWidth / 2) + ',' + (setMatrixHeight + labelTopPadding + 10) + ')'
        });

    // scale for the size of the plottingSets
    var subSetSizeScale = d3.scale.linear().domain([0, d3.max(dataRows, function (d) {
        return d.setSize;
    })]).nice().range([0, subSetSizeWidth]);

    var subSetSizeAxis = d3.svg.axis().scale(subSetSizeScale).orient('top').ticks(4);

    svg.append('g').attr()
        .attr({class: 'axis',
            transform: 'translate(' + xStartSetSizes + ',' + (setMatrixHeight + textHeight - 5) + ')'
        })
        .call(subSetSizeAxis);

    // ------------ expected value header -----------------------

    svg.append('rect')
        .attr({
            class: 'labelBackground expectedValueLabel',
            // id: ,
            transform: 'translate(' + xStartExpectedValues + ',' + (setMatrixHeight + labelTopPadding) + ')',
            height: '20',
            width: expectedValueWidth

        });

    svg.append('text').text('Deviation from Expected Value')
        .attr({
            class: 'columnLabel expectedValueLabel',
            transform: 'translate(' + (xStartExpectedValues + expectedValueWidth / 2) + ',' + (setMatrixHeight + labelTopPadding + 10) + ')'
        });

    // scale for the size of the plottingSets
    var minDeviation = d3.min(dataRows, function (d) {
        return d.expectedValueDeviation;
    });
    if (minDeviation > 0) {
        minDeviation = 0;
    }
    var maxDeviation = d3.max(dataRows, function (d) {
        return d.expectedValueDeviation;
    });

    var expectedValueScale = d3.scale.linear().domain([minDeviation, maxDeviation]).nice().range([0, expectedValueWidth]);

    var expectedValueAxis = d3.svg.axis().scale(expectedValueScale).orient('top').ticks(4);

    svg.append('g').attr()
        .attr({class: 'axis',
            transform: 'translate(' + xStartExpectedValues + ',' + (setMatrixHeight + textHeight - 5) + ')'
        })
        .call(expectedValueAxis);

    // Invisible background to capture the pan interaction with the subsets
    gRows.append('rect').attr({
        x: 0,
        y: setMatrixHeight,
        width: w-120,
        height: h,
        fill: 'white',
        class: 'background-subsets'
    });

    plotSubSets();
    setUpSortSelections();

    // ################## SUBSETS #########################


    function plotSubSets() {

        // ------------------- the rows -----------------------

        var subSets = gRows.selectAll('.row')
            .data(renderRows, function (d, i) {
                //    console.log("what: " + d.id + '' + i);
                //  return d.id + '' + i;
                return d.id;

            });

        var grp = subSets
            .enter()
            .append('g')
            .attr({
                //transform: function (d, i) {
                // return 'translate(0, ' + rowScale(d.id) + ')';
//            return 'translate(0, ' + (textHeight + cellDistance * (i)) + ')';
                //},
                class: function (d) {
                    return 'row ' + d.data.type;
                }
            });

        subSets.exit().remove();

        //  var rows = svg.selectAll('.row');
        subSets.transition().duration(function (d, i) {
                return 2000;
            }
        ).attr({transform: function (d) {
                return 'translate(0, ' + rowScale(d.id) + ')';

            }, class: function (d) {
                //    console.log(d.type);
                return 'row ' + d.data.type;
            }});

        // ------------ the combination matrix ----------------------

        var grays = [ '#f0f0f0', '#636363'];
        // scale for the set containment
        var setScale = d3.scale.ordinal().domain([0, 1]).range(grays);

        subSets.filter(function (d) {
            return d.data.type === ROW_TYPE.SUBSET;
        }).selectAll('g').data(function (d) {
                // binding in an array of size one
                return [d.data.combinedSets];
            }
        ).enter()
            .append('g')
            .attr({class: 'combination'
            });
//            .each(function (d) {
//                console.log(d);
//            });

        svg.selectAll('.combination').selectAll('rect').data(function (d) {
            return d;
        }).enter()
            .append('rect')
            .on('click', function (d) {
                // click event for cells
            })
            .attr('x', function (d, i) {
                return (cellDistance) * i;
            })
            .attr({
                width: cellSize,
                height: cellSize,
                class: 'cell'
            })
            .style('fill', function (d) {
                return setScale(d);

            })
            .on('mouseover', mouseoverCell)
            .on('mouseout', mouseoutCell)

        // Handling groups

        var groups = svg.selectAll('.row').select(function (d, i) {
            if (d.data.type === ROW_TYPE.GROUP || d.data.type === ROW_TYPE.AGGREGATE)
                return this;
            return null;
        })

        groups.append('rect').attr({
            class: 'groupBackGround',
            width: setVisWidth,
            height: cellSize,
            x: 0,
            y: 0
        }).on('click', function (d) {
                collapseGroup(d.data);
                rowTransition();
            });

        //  console.log('g2: ' + groups);

        groups.append('text').text(function (d) {
            if (d.data.type === ROW_TYPE.GROUP)
                return d.data.elementName;
            else if (d.data.type === ROW_TYPE.AGGREGATE)
                return d.data.subSets.length + ' empty subsets';
        })
            .attr({class: 'groupLabel',
                y: cellSize - 3,
                x: 3,
                'font-size': cellSize - 4

            });

        // ------------------------ set size bars -------------------

        svg.selectAll('.row')
            .append('rect')
            .on('click', function (d) {

                // extract a subset defintion for use with the subset filter
                var subsetDefinition = {};
                for (var x = 0; x < d.data.combinedSets.length; ++x) {
                    subsetDefinition[usedSets[x].id] = d.data.combinedSets[x];
                }

                var filterList = [];

                // create subset filter and create new selection based on all items
                var selection = new Selection(allItems);

                filterList.push( { attributeId: attributes.length-1, id: "subset", parameters: { subset: subsetDefinition }, uuid: Utilities.generateUuid() } );

                for ( var a = 0; a < attributes.length - 1; ++a ) {
                    if ( attributes[a].type === 'integer' || attributes[a].type === 'float' ) {
                        filterList.push( { attributeId: a, id: "numericRange", parameters: { min: attributes[a].min, max: attributes[a].max }, uuid: Utilities.generateUuid() } );
                    }

                    if ( attributes[a].type === 'string' || attributes[a].type === 'id' ) {
                        filterList.push( { attributeId: a, id: "stringRegex", parameters: { pattern: "." }, uuid: Utilities.generateUuid() } );
                    }
                }

                selection.filters = filterList;
                selection.applyFilters();
                selections.addSelection(selection);
                d3.select(this).style("fill", selections.getColor(selection));

                // === Experiments ===
                // create a set count filter and create new selection based on previous subset
                //selections.addSelection(selection.createSelection( attributes.length-2, "numericRange", { min: "1", max: "1" } ));                

                // create a regex filter on name and create new selection based on previous subset
                //selections.addSelection(selection.createSelection( 0, "stringRegex", { pattern: "^[A-B].+$" } ));                
            })
            .attr({
                class: 'subSetSize',

                transform: function (d) {
                    var y = 0;
                    if (d.data.type !== ROW_TYPE.SUBSET)
                        y = cellSize / 3 * .4;
                    return   'translate(' + xStartSetSizes + ', ' + y + ')'; // ' + (textHeight - 5) + ')'
                },

                width: function (d) {
                    return subSetSizeScale(d.data.setSize);
                },
                height: function (d) {
                    if (d.data.type === ROW_TYPE.SUBSET)
                        return cellSize;
                    else
                        return cellSize / 3;
                }
            })
            .on('mouseover', mouseoverRow)
            .on('mouseout', mouseoutRow)

        // ----------------------- expected value bars -------------------

        svg.selectAll('.row')
            .append('rect')
            .attr({
                class: function (d) {
                    return d.data.expectedValueDeviation < 0 ? 'expectedValueDeviation negative' : 'expectedValueDeviation positive';
                },
                transform: function (d) {
                    var start = expectedValueScale(d3.min([0, d.data.expectedValueDeviation]));
                    start += xStartExpectedValues;
                    var y = 0;
                    if (d.data.type !== ROW_TYPE.SUBSET)
                        y = cellSize / 3 * 1.7;
                    return 'translate(' + start + ', ' + y + ')';
                },
                width: function (d) {
                    console.log(d.data.expectedValueDeviation)
                    return Math.abs(expectedValueScale(d.data.expectedValueDeviation) - expectedValueScale(0));
                },
                height: function (d) {
                    if (d.data.type === ROW_TYPE.SUBSET)
                        return cellSize;
                    else
                        return cellSize / 3;
                }
            })
            .on('mouseover', mouseoverRow)
            .on('mouseout', mouseoutRow)

        function zooming() {
            d3.select(this).attr('transform', 'translate(0, ' + d3.event.translate[0] + ')');
            console.log(h, svgHeight)
            // Subset background should stick to his place
            d3.select(".background-subsets").attr('transform', function (d, i) {
                return 'translate(' + [ 0, -d3.event.translate[0] ] + ')'
            })

        }

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on('zoom', zooming);

        d3.select('.gRows').call(zoom);

    }

// -------------------- row transitions ----------------------------

    function rowTransition() {

        initRows();
        plotSubSets();

    }

    function setUpSortSelections() {
        d3.selectAll('#sortIntersect').on(
            'click',
            function (d) {
                UpSetState.grouping = sortByCombinationSize;
                updateState();
                rowTransition();
            });

        d3.selectAll('#groupSetSize').on(
            'click',
            function (d) {
                UpSetState.grouping = sortBySetSizeGroups;
                updateState();

                rowTransition();
            });

        d3.selectAll('#groupSet').on(
            'click',
            function (d) {
                UpSetState.grouping = sortBySetGroups;
                updateState();

                rowTransition();
            });

        // sort based on occurrence of one specific data item
        d3.selectAll('.setLabel').on(
            'click',
            function (d) {
                UpSetState.grouping = sortOnSetItem(d.data);
                updateState();

                rowTransition();
            });

        d3.selectAll('.subsetSizeLabel').on(
            'click',
            function (d) {
                UpSetState.grouping = sortBySubsetSize;
                updateState();
                rowTransition();
            });
        d3.selectAll('.expectedValueLabel').on(
            'click',
            function (d) {
                UpSetState.grouping = sortByExpectedValue;
                updateState();

                rowTransition();
            });
    }
}