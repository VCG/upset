function plotSelectedItems() {

    var majorPadding = 5;
    var setCellDistance = 12;
    var cellDistance = 20;
    var textHeight = 12;
    var textSpacing = 3;

    var xStartSetSizes = cellDistance * sets.length + majorPadding;
    var setMatrixHeight = sets.length * setCellDistance + majorPadding;

    var svg = d3.select('#vis').select('svg');
    svg.selectAll('.itemLabel').remove();

    var itemLabels = svg.selectAll('.itemLabel')
        .data(selectedItems)
        .enter();

    itemLabels.append('text').text(
        function (d) {
            //return d.elementName.substring(0, truncateAfter);
            return( labels[d] );
        }).attr({
            class: 'itemLabel',
            id: function (d) {
                return( 'itemLabel-' + d );
                //return d.elementName.substring(0, truncateAfter);
            },
            transform: function (d, i) {
                return 'translate(' + (700 + xStartSetSizes) + ',' + (setMatrixHeight + i * ( textHeight + textSpacing) ) + ')rotate(0)';
            }
        });
}