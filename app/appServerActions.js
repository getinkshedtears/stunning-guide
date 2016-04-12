var Constants = require('./appConstants');
var Dispatcher = require('./appDispatcher');

module.exports = {
    
    receiveVotes: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.FETCH_VOTES_RESPONSE,
            data: response
        })
    },
    
    receiveUser: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.FETCH_USER_RESPONSE,
            data: response
        })
    },
    
    receiveCreator: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.FETCH_CREATOR_RESPONSE,
            data: response
        })
    },
    
    receiveVote: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.FETCH_VOTE_RESPONSE,
            data: response
        })
    },
    
    receiveVoteCreated: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.CREATE_VOTE_RESPONSE,
            data: response
        })
    },
    
    receiveVotesByUser: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.GET_VOTES_BY_USER_RESPONSE,
            data: response
        })
    },
    
    receiveDeleteVote: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.DELETE_VOTE_RESPONSE,
            data: response
        })
    },
    
    receiveUpdateUsername: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.UPDATE_USERNAME_RESPONSE,
            data: response
        })
    },
    
    receiveCastVote: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.CAST_VOTE_RESPONSE,
            data: response
        })
    },
    
    receiveDeleteAccount: function() {
        Dispatcher.handleServerAction({
            actionType: Constants.DELETE_ACCOUNT_RESPONSE
        })
    },
    
    receiveAddOption: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.ADD_OPTION_RESPONSE,
            data: response
        })
    },
    
    receiveDeleteOption: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.DELETE_OPTION_RESPONSE,
            data: response
        })
    },
    
    receiveDeleteAccount: function(response) {
        Dispatcher.handleServerAction({
            actionType: Constants.DELETE_ACCOUNT_RESPONSE,
            data: response
        })
    }
}