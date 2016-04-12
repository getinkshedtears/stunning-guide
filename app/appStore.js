var Constants = require('./appConstants');
var Dispatcher = require('./appDispatcher');
var EventEmitter = require('events').EventEmitter;
var ObjectAssign = require('object-assign');
var Api = require('./appApi');
var Actions = require('./appActions');

var CHANGE_EVENT = 'change';

var _store = {
    votes: [],
    user: {},
    showPopup: false,
    popupView: '',
    sortBy: 'newest',
    currentView: 'votes',
    currentVoteID: '',
    currentVote: null,
    votesByUser: []
}

var appStore = ObjectAssign({}, EventEmitter.prototype, {
    
    addChangeListener: function(cb) {
        this.on(CHANGE_EVENT, cb);
    },
    
    removeChangeListener: function(cb) {
        this.removeListener(CHANGE_EVENT, cb)
    },
    
    getStore: function() {
        return _store
    }

});

Dispatcher.register(function(payload){
    
    var action = payload.action;
    
    switch(action.actionType) {
        case Constants.TOGGLE_POPUP:
            console.log('popup toggle ' + _store.showPopup)
            _store.showPopup = !_store.showPopup
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.UPDATE_POPUP_VIEW:
            _store.popupView = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.UPDATE_SORTBY:
            _store.sortBy = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.FETCH_VOTES_RESPONSE:
            _store.votes = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.FETCH_USER_RESPONSE:
            _store.user = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.UPDATE_VIEW:
            _store.currentView = action.data;
            if (action.data === 'vote') {
                console.log('fetching vote ' + _store.currentVoteID)
                Api.fetchVote(_store.currentVoteID);
            }
            if (action.data === 'user') {
                Api.getVotesByUser();
            }
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.UPDATE_VOTEID:
            _store.currentVoteID = action.data;
            Api.fetchVote(action.data);
            Api.fetchCreator(action.data);
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.FETCH_CREATOR_RESPONSE:
            _store.creator = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.FETCH_VOTE_RESPONSE:
            _store.currentVote = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.CREATE_VOTE_RESPONSE:
            console.log('redirect to ' + action.data.vote._id)
            window.location = "/votes/" + action.data.vote._id;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.GET_VOTES_BY_USER_RESPONSE:
            _store.votesByUser = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.DELETE_VOTE_RESPONSE:
            _store.votes = action.data;
            Api.getVotesByUser();
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.UPDATE_USERNAME_RESPONSE:
            _store.user = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.CAST_VOTE_RESPONSE:
            _store.currentVote = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.DELETE_ACCOUNT_RESPONSE:
            appStore.emit(CHANGE_EVENT);
            break;
        
        case Constants.ADD_OPTION_RESPONSE:
            _store.currentVote = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.DELETE_OPTION_RESPONSE:
            _store.currentVote = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        case Constants.DELETE_ACCOUNT_RESPONSE:
            _store.votes = action.data;
            appStore.emit(CHANGE_EVENT);
            break;
            
        default: return true;
    }
    
    
})

module.exports = appStore;