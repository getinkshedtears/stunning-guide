module.exports = function(passport) {
    
    
var express = require('express');
var router = express.Router();
var Vote = require('../models/vote');
var User = require('../models/user')

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.user) {
        res.render('index', { title: 'Votality' })
    }
    else res.render('index', {title: 'Votality'})
  
});

router.get('/profile', function(req, res){
    if (req.user) {
        res.render('index', {title: 'Votality', userState: true})
    }
    else res.render('index', {title: 'no profile'})
})

router.get('/fail', function(req, res){
    res.json({message: 'failure'})
});

router.get('/votes/:id', function(req, res){
    res.render('index', {title: 'Votality', vote : req.params.id})
})

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/fail',
            failureFlash: true
        }));
        
router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/fail',
            failureFlash: true
        }));
        
router.get('/auth/logout', function(req, res){
    console.log('logout')
    req.logout();
    res.redirect('/');
});

router.get('/api/loggedIn', function(req, res){
    res.json(req.user);
})

router.get('/api/getVotes', function(req, res){
    Vote.find({}, function(err, docs){
        res.json(docs);
    })
})

router.get('/api/getVote/:id', function(req, res) {
    Vote.findById(req.params.id, function(err, docs){
        res.send(docs);
    })
});

router.post('/api/deleteVote', function(req, res){
    var id = req.body.id;
    Vote.remove({_id: id}, function(err){
        res.json({message: 'Deleted'})
    })
})


router.post('/api/createVote', function(req, res){
    var title = req.body.title;
    var things = req.body.things;
    var user = req.user._id
    var date = new Date();
    var arr = [];
    
    things.forEach(function(thing){
        var obj = {thing: thing, votes: 0};
        arr.push(obj);
    })
    
    var newVote = new Vote();
        newVote.title = title;
        newVote.things = arr;
        if (user) {
        newVote.creatorId = user;
        }
        newVote.createDate = date;
        
        newVote.save(function(err, success){
            if(err) {
                res.send(err)
            }
            else
            res.json({vote: newVote})
        })
});

router.post('/api/castVote', function(req, res){
    var id = req.body.voteId;
    var selection = req.body.selection;
    
    Vote.findById(id, function(err, doc){
        doc.castVote(selection);
        doc.save();
        res.json({vote: doc.things[selection]})
    })
    
});

router.post('/api/addOption', function(req, res){
    var newThing = req.body.thing;
    var id = req.body.id;
    
    Vote.findById(id, function(err, doc){
        doc.addThing(newThing);
        doc.save();
        res.json({doc: doc})
    })
    
});

router.post('/api/deleteOption', function(req, res){
    var id = req.body.id
    var index = req.body.index;
    
    Vote.findById(id, function(err, doc){
        doc.removeThing(index);
        res.json({doc: doc})
    })
})

router.post('/api/setUsername', function(req, res){
    var newName = req.body.name;
    var id = req.body.id;
    
    User.findById(id, function(err, doc){
        doc.setUsername(newName);
        res.json({doc: doc})
    })
})

router.get('/api/getVotesByUser', function(req, res){
    
    var user = req.user._id;
    
    Vote.find({creatorId: user}, function(err, docs){
        res.json({result: docs})
    })
    
});

router.get('/api/idToName/:id', function(req, res){
    
    User.findById(req.params.id, function(err, doc){
        if (err) {
            res.json({name: 'invalid'})
        }
        else {
            res.json({name: doc})
        }
    })
})

return router;
}