require('font-awesome-webpack');
window.$ = require('jquery');

require('./css/html_styles.scss');
require('./css/set_view.scss');
require('./css/element_view.scss');

require('script!./event-manager');
require('script!./venn');
require('script!./utilities');
require('script!./attribute');
require('script!./viewer/word-cloud');
require('script!./viewer/scatterplot');
require('script!./viewer/histogram');
require('script!./viewer/variant-frequency');
require('script!./element-viewer');
require('script!./dataLoading');
require('script!./filter');
require('script!./selection');
require('script!./dataStructure');
require('script!./ui');
require('script!./setSelection');
require('script!./sort');
require('script!./highlight');
require('script!./scrollbar');
require('script!./items');
require('script!./setGrouping');
require('script!./logicPanel');
require('script!./brushableScale');
require('script!./statisticGraphs');
require('script!./upset');

module.exports = {
  UpSet: window.UpSet,
  Ui: window.Ui
};
