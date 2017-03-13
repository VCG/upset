require('font-awesome-webpack');
window.$ = require('jquery');

require('./css/html_styles.scss');
require('./css/set_view.scss');
require('./css/element_view.scss');

require('script-loader!./event-manager');
require('script-loader!./venn');
require('script-loader!./utilities');
require('script-loader!./attribute');
require('script-loader!./viewer/word-cloud');
require('script-loader!./viewer/scatterplot');
require('script-loader!./viewer/histogram');
require('script-loader!./viewer/variant-frequency');
require('script-loader!./element-viewer');
require('script-loader!./dataLoading');
require('script-loader!./filter');
require('script-loader!./selection');
require('script-loader!./dataStructure');
require('script-loader!./ui');
require('script-loader!./setSelection');
require('script-loader!./sort');
require('script-loader!./highlight');
require('script-loader!./scrollbar');
require('script-loader!./items');
require('script-loader!./setGrouping');
require('script-loader!./logicPanel');
require('script-loader!./brushableScale');
require('script-loader!./statisticGraphs');
require('script-loader!./upset');

module.exports = {
  UpSet: window.UpSet,
  Ui: window.Ui
};
