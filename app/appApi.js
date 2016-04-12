var serverActions = require('./appServerActions');
var request = require('superagent');

module.exports = {
    
    fetchVotes: function() {
        request
        .get('../api/getVotes')
        .end(function(err, response){
            console.log('votes fetched');
            serverActions.receiveVotes(response.body);
        })
    },
    
    fetchUser: function() {
        request
        .get('../api/loggedIn')
        .end(function(err, response){
            console.log('user received')
            serverActions.receiveUser(response.body)
        })
    },
    
    fetchCreator: function(id) {
        request
        .get('../api/idToName/' + id)
        .end(function(err, response){
            console.log('creator received')
            serverActions.receiveCreator(response.body.username)
        })
    },
    
    fetchVote: function(id) {
        request
        .get('../api/getVote/' + id)
        .end(function(err, response){
            console.log('one vote received')
            serverActions.receiveVote(response.body)
        })
    },
    
    createVote: function(vote) {
        request
        .post('../api/createVote')
        .send(vote)
        .end(function(err, response){
            if (err) {
                console.log(err);
            }
            else {
            console.log(response.body);
            serverActions.receiveVoteCreated(response.body);
            }
        })
    },
    
    getVotesByUser: function() {
        request
        .get('../api/getVotesByUser')
        .end(function(err, response){
            console.log(response.body)
            serverActions.receiveVotesByUser(response.body.result);
        })
    },
    
    deleteVote: function(id) {
        request
        .post('../api/deleteVote')
        .send(id)
        .end(function(err, response){
            serverActions.receiveDeleteVote(response.body);
        })
    },
    
    updateUsername: function(name) {
        request
        .post('../api/setUsername')
        .send(name)
        .end(function(err, response){
            serverActions.receiveUpdateUsername(response.body)
        })
    },
    
    castVote: function(vote) {
        request
        .post('../api/castVote')
        .send(vote)
        .end(function(err, response){
            serverActions.receiveCastVote(response.body);
        })
    },
    
    addOption: function(option) {
        request
        .post('../api/addOption')
        .send(option)
        .end(function(err, response){
            serverActions.receiveAddOption(response.body);
        })
    },
    
    deleteOption: function(option) {
        request
        .post('../api/deleteOption')
        .send(option)
        .end(function(err, response){
            serverActions.receiveDeleteOption(response.body)
        })
    },
    
    deleteAccount: function(user) {
        request
        .post('../api/deleteAccount')
        .send(user)
        .end(function(err, response){
            serverActions.receiveDeleteAccount(response.body)
        })
    }
    
}