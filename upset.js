/**
 * author: Alexander Lex - alex@seas.harvard.edu Inspired by ?
 * author: Nils Gehlenborg - nils@hms.harvard.edu
 */


d3.json("datasets.json", function (error, json) {
    if (error) return console.warn(error);
    dataSets = json;
    load()
});

function load() {
    var header = d3.select("#header");
    header.append('div').html('&darr; # intersections.').attr({id: 'sortIntersect',
        class: 'myButton'})
    var dataSelect = header.append('div').text('Choose Dataset: ');
    var select = dataSelect.append("select");
    select.on("change", change)
        .selectAll("option").data(dataSets).enter().append("option")
        .attr("value", function (d) {
            return d.file;
        })
        .attr("id", "dataSetSelector")
        .text(function (d) {
            return d.text;
        })

    loadDataset(dataSets[0].file);
}

function loadDataset(dataFile) {
    d3.text(dataFile, "text/csv", dataLoad);
}


function dataLoad(data) {
    clearSelectedItems();

    var dsv = d3.dsv(";", "text/plain");
    var rows = dsv.parseRows(data).map(function (row) {
        return row.map(function (value) {
            var intValue = parseInt(value, 10)
            if (isNaN(intValue))
                return value;
            return intValue;
        });
    });
    // the raw set arrays
    var rawSets = [];
    // the names of the sets are in the columns
    var setNames = rows.shift();
    // we drop the first cell - this should be empty
    setNames.shift();

    // initialize the raw set arrays
    for (var setCount = 0; setCount < setNames.length; setCount++) {
        rawSets.push(new Array());
    }

    for (var i = 0; i < rows.length; i++) {
        labels.push(rows[i][0]);
        for (var setCount = 0; setCount < setNames.length; setCount++) {
            rawSets[setCount].push(rows[i][setCount + 1]);
        }
    }

    depth = labels.length;

    var setID = 1;
    for (var i = 0; i < rawSets.length; i++) {
        var combinedSets = Array.apply(null, new Array(rawSets.length)).map(Number.prototype.valueOf, 0);
        combinedSets[i] = 1;
        var setName = setNames[i];
        var set = new Set(setID, setName, combinedSets, rawSets[i]);
        setID = setID << 1;
        sets.push(set);
    }

    combinations = Math.pow(2, sets.length) - 1;

    for (var i = 1; i <= combinations; i++) {
        makeSubSet(i)
    }

    // sort by size of set overlap
    subSets.sort(function (a, b) {
        return b.setSize - a.setSize;
    });

    plot();
}

function change() {
    sets.length = 0;
    subSets.length = 0;
    labels.length = 0;
    loadDataset(this.options[this.selectedIndex].value);
}


function setSelectedItems( indices ) {
	selectedItems = indices;
	
	plotSelectedItems();
}


function clearSelectedItems() {
    selectedItems.length = 0;

	plotSelectedItems();
}


function plot() {

    var cellDistance = 20;
    var cellSize = 18;
    var textHeight = 60;
    var textSpacing = 3;

    var majorPadding = 5;
    var xStartSetSizes = cellDistance * sets.length + majorPadding;
    var setSizeWidth = 700;
    var subSetSizeWidth = 300;

    var xStartExpectedValues = xStartSetSizes + subSetSizeWidth + 20;
    var expectedValueWidth = 300;

    var labelTopPadding = 15;

    var paddingTop = 30;
    var paddingSide = 20;

    var truncateAfter = 25;

    var setCellDistance = 12;
    var setCellSize = 10;

    var w = 1300;
    var setMatrixHeight = sets.length * setCellDistance + majorPadding;
    var subSetMatrixHeight = combinations * cellDistance;
    var h = subSetMatrixHeight + textHeight + setMatrixHeight;

    d3.select("#vis").select("svg").remove();
    var svg = d3.select("#vis").append("svg").attr("width", w)
        .attr("height", h);

    //####################### SETS ##################################################

    var rowRientation = "horizontal"; // "vertical"

    if(rowRientation=="horizontal") {

        var setRowScale = d3.scale.ordinal().rangeRoundBands([ 0, setMatrixHeight - majorPadding ], 0);

        setRowScale.domain(sets.map(function (d) {
            return d.setID;
        }));

        var setGrp = svg.selectAll('.setRow')
            .data(sets)
            .enter()
            .append('g')
            .attr({transform: function (d, i) {
                return 'translate(0, ' + setRowScale(d.setID) + ')';
                //  return 'translate(0, ' + ( cellDistance * (i)) + ')';
            },
                class: 'setRow'});

        // ------------ the connection lines ----------------------

        svg.selectAll('.connection')
            .data(sets)
            .enter()
            .append('polygon')
            .attr({
                points: function (d, i) {

                    // lower edge
                    var subLeft = ( cellDistance * i) + ", " + setMatrixHeight + " ";
                    var subRight = (cellDistance * (i + 1) - 2) + ", " + setMatrixHeight + " ";
                    var setTop = xStartSetSizes + ", " + (setCellDistance * i  ) + " ";
                    var setBottom = xStartSetSizes + ", " + (setCellDistance * (i + 1) - 2) + " ";

                    return (subLeft + subRight + setBottom + setTop );
                },
                class: 'connection'
            }
        );

    // ------------------- set size bars --------------------

        // scale for the size of the subSets, also used for the sets
        var subSetSizeScale = d3.scale.linear().domain([0, d3.max(subSets, function (d) {
            return d.setSize;
        })]).nice().range([0, subSetSizeWidth]);

        svg.selectAll('.setRow')
            .append('rect')
            .attr({
                class: 'setSize',
                transform: "translate(" + xStartSetSizes + ", 0)", // " + (textHeight - 5) + ")"
                width: function (d) {
                    return subSetSizeScale(d.setSize);
                },
                height: setCellSize//setRowScale.rangeBand()
            });


    } else { // vertical rows

      var setRowScale = d3.scale.ordinal().rangeRoundBands([ 0, sets.length * (cellSize + 2)], 0);

      var subSetSizeHeight = setMatrixHeight - majorPadding;

      setRowScale.domain(sets.map(function (d) {
          return d.setID;
      }));

      var setGrp = svg.selectAll('.setRow')
          .data(sets)
        .enter()
          .append('g')
          .attr({transform: function (d, i) {
              return 'translate(' + setRowScale(d.setID) + ', 0)';
              //  return 'translate(0, ' + ( cellDistance * (i)) + ')';
          },
              class: 'setRow'});

  // ------------------- set size bars --------------------

      // scale for the size of the subSets, also used for the sets
      var subSetSizeScale = d3.scale.linear().domain([0, d3.max(subSets, function (d) {
          return d.setSize;
      })]).nice().range([0, subSetSizeHeight]);

      svg.selectAll('.setRow')
          .append('rect')
          .attr({
              class: 'setSize',
              transform: function (d) { return "translate(0, "+ (subSetSizeHeight-subSetSizeScale(d.setSize))+")"}, // " + (textHeight - 5) + ")"
              height: function (d) {
                  return subSetSizeScale(d.setSize);
              },
              width: cellSize//setRowScale.rangeBand()
          });

    }

// ################## SUBSETS #########################

// ------------ the set labels -------------------

    var setLabels = svg.selectAll(".setLabel")
        .data(sets)
        .enter();

    setLabels.append('rect').attr({
        transform: function (d, i) {
            return 'translate(' + (cellDistance * i ) + ', ' + setMatrixHeight + ')';
        },
        width: cellSize,
        height: textHeight - 2,
        class: "connection"
    });

    setLabels.append("text").text(
        function (d) {
            return d.setName.substring(0, truncateAfter);
        }).attr({
            class: "setLabel",
            id: function (d) {
                return d.setName.substring(0, truncateAfter);
            },
            transform: function (d, i) {
                return 'translate(' + (cellDistance * (i ) + cellDistance / 2) + ',' + (setMatrixHeight + textHeight - textSpacing) + ')rotate(270)';
            }

        });

    d3.selectAll("#sortIntersect").on(
        "click",
        function (d) {
            sortByCombinationSize();
            rowTransition();
        });

    // sort based on occurrence of one specific data item
    d3.selectAll(".setLabel").on(
        "click",
        function (d) {
            sortOnSetItem(d)
            rowTransition();
        });

    // ------------------- the rows -----------------------

    var rowScale = d3.scale.ordinal().rangeRoundBands([ setMatrixHeight + textHeight, h ], 0);

    rowScale.domain(subSets.map(function (d) {
        return d.setID;
    }));

    var grp = svg.selectAll('.row')
        .data(subSets)
        .enter()
        .append('g')
        .attr({transform: function (d, i) {
            return 'translate(0, ' + rowScale(d.setID) + ')';
//            return 'translate(0, ' + (textHeight + cellDistance * (i)) + ')';
        },
            class: 'row'});

    // -------------------- row transitions ----------------------------

    function rowTransition() {
        rowScale.domain(subSets.map(function (d) {
            return d.setID;
        }));

        svg.selectAll(".row").transition().duration(function (d, i) {
                return 2000;
            }
        ).attr({transform: function (d) {
                return 'translate(0, ' + rowScale(d.setID) + ')';
            }});
    }

    // ------------ the combination matrix ----------------------

    var grays = [ "#f0f0f0", "#636363"];
    // scale for the set participation
    var setScale = d3.scale.ordinal().domain([0, 1]).range(grays);

    grp.selectAll('.row')
        .append('g')
        .attr({class: 'combination'
        })

    grp.selectAll('.combination').data(function (d) {
        return d.combinedSets
    }).enter()
        .append('rect')
        .on("click", function(d) {
        	// click event for cells
        })
        .attr('x', function (d, i) {
            return (cellDistance) * i;
        })
        .attr({width: cellSize,
            height: cellSize})
        .style("fill", function (d) {
            return setScale(d);
        });

    // ------------------- set size bars --------------------

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
    var subSetSizeScale = d3.scale.linear().domain([0, d3.max(subSets, function (d) {
        return d.setSize;
    })]).nice().range([0, subSetSizeWidth]);

    var subSetSizeAxis = d3.svg.axis().scale(subSetSizeScale).orient("top").ticks(4);

    svg.append("g").attr()
        .attr({class: "axis",
            transform: "translate(" + xStartSetSizes + "," + (setMatrixHeight + textHeight - 5) + ")"
        })
        .call(subSetSizeAxis);

    svg.selectAll('.row')
        .append('rect')
        .on("click", function(d) {
        	setSelectedItems( d.items );
        })        
        .attr({
            class: 'subSetSize',
            transform: "translate(" + xStartSetSizes + ", 0)", // " + (textHeight - 5) + ")"
            width: function (d) {
                return subSetSizeScale(d.setSize);
            },
            height: cellSize
        });

    d3.selectAll(".subsetSizeLabel").on(
        "click",
        function (d) {
            sortBySubsetSize();
            rowTransition();
        });

    // ----------------------- expected value bars -------------------

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
    var minDeviation = d3.min(subSets, function (d) {
        return d.expectedValueDeviation;
    });
    var maxDeviation = d3.max(subSets, function (d) {
        return d.expectedValueDeviation;
    });

    var expectedValueScale = d3.scale.linear().domain([minDeviation, maxDeviation]).nice().range([0, expectedValueWidth]);

    var expectedValueAxis = d3.svg.axis().scale(expectedValueScale).orient("top").ticks(4);

    svg.append("g").attr()
        .attr({class: "axis",
            transform: "translate(" + xStartExpectedValues + "," + (setMatrixHeight + textHeight - 5) + ")"
        })
        .call(expectedValueAxis);

    svg.selectAll('.row')
        .append('rect')
        .attr({
            class: function (d) {
                return d.expectedValueDeviation < 0 ? "expectedValueDeviation negative" : "expectedValueDeviation positive";
            },
            transform: function (d) {
                var start = expectedValueScale(d3.min([0, d.expectedValueDeviation]));
                //  console.log(d.setName + " expected: " + d.expectedValueDeviation + " start: " + start);
                start += xStartExpectedValues;
                return "translate(" + start + ", 0)";
            },
            width: function (d) {
                return Math.abs(expectedValueScale(d.expectedValueDeviation) - expectedValueScale(0));
            },
            height: cellSize
        });

    d3.selectAll(".expectedValueLabel").on(
        "click",
        function (d) {
            sortByExpectedValue();
            rowTransition();
        });
}


function plotSelectedItems() {

    var majorPadding = 5;
    var setCellDistance = 12;
    var cellDistance = 20;
    var textHeight = 12;
    var textSpacing = 3;

    var xStartSetSizes = cellDistance * sets.length + majorPadding;
    var setMatrixHeight = sets.length * setCellDistance + majorPadding;

	var svg = d3.select("#vis").select("svg");
		svg.selectAll(".itemLabel").remove();

    var itemLabels = svg.selectAll(".itemLabel")
        .data(selectedItems)
        .enter();

    itemLabels.append("text").text(
        function (d) {
            //return d.setName.substring(0, truncateAfter);
            return( labels[d] );
        }).attr({
            class: "itemLabel",
            id: function (d) {
            	return( "itemLabel-" + d );
                //return d.setName.substring(0, truncateAfter);
            },
            transform: function (d, i) {
                return 'translate(' + (700+xStartSetSizes)  + ',' + (setMatrixHeight + i* ( textHeight + textSpacing) ) + ')rotate(0)';
            }
        });
}
