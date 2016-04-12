var Dispatcher = require('flux').Dispatcher;
var appDispatcher = new Dispatcher();

appDispatcher.handleViewAction = function(action) {
  this.dispatch({
      source: 'VIEW_ACTION',
      action: action
  })  
};

appDispatcher.handleServerAction = function(action) {
  this.dispatch({
    source: 'SERVER_ACTION',
    action: action
  })
}

module.exports = appDispatcher;