var Constants = require('./appConstants');
var Dispatcher = require('./appDispatcher');
var Api = require('./appApi');

module.exports = {
    togglePopup: function() {
        Dispatcher.handleViewAction({
            actionType: Constants.TOGGLE_POPUP,
        })
    },
    
    updatePopupView: function(view) {
        Dispatcher.handleViewAction({
            actionType: Constants.UPDATE_POPUP_VIEW,
            data: view
        })
    },
    
    updateSortby: function(str) {
        Dispatcher.handleViewAction({
            actionType: Constants.UPDATE_SORTBY,
            data: str
        })
    },
    
    fetchVotes: function() {
        Dispatcher.handleViewAction({
            actionType: Constants.FETCH_VOTES,
        })
        Api.fetchVotes();
    },
    
    updateView: function(str) {
        Dispatcher.handleViewAction({
            actionType: Constants.UPDATE_VIEW,
            data: str
        })
    },
    
    updateVoteID: function(id) {
        Dispatcher.handleViewAction({
            actionType: Constants.UPDATE_VOTEID,
            data: id
        })
    }
}