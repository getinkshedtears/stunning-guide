var React = require('react');
var ReactDOM = require('react-dom');
var request= require('superagent');
var Quiche = require('quiche');
var Moment = require('moment');

window.fbAsyncInit = function() {
    FB.init({
      appId      : '495924703942654',
      xfbml      : true,
      version    : 'v2.5'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));


var App = React.createClass({
    
    getInitialState: function() {
        
        return({
            allVotes: [],
            showPopup: false,
            popupView: '',
            user: null,
            voteId: '',
            vote: {},
            view: 'votes',
            userVotes: [],
            sortBy: 'newest',
            creatorName: ''
        })
    },
    
    authStatus: function() {
        request
        .get('/api/loggedIn')
        .end(function(err, res){
            if (res.body) {
            this.setState({user: res.body})
            this.getVotesByUser();
            }
            else
            this.setState({user: null})
        }.bind(this))
    },
    
    componentDidMount: function() {
        this.authStatus();
        
        if (voteID != null) {
            this.setState({voteId: voteID})
            this.setVote(voteID);
            this.setState({view: 'vote'});
        }
            else {
            this.getAllVotes();
            }
            
        if (userState) {
            this.setState({view: 'user'})
        }
    },
    
    togglePopup: function(view) {
        this.setState({popupView: view})   
        this.setState({showPopup: !this.state.showPopup})  
    },
    
    setView: function(view) {
        this.setState({view: view})
    },
    
    getView: function() {
      if (this.state.view === 'votes') {
          return <VotesView allVotes = {this.getSortedVotes()} sort = {this.setSortBy} sortBy = {this.state.sortBy}/>
      };
      if (this.state.view === 'vote') {
          return <VoteView vote = {this.state.vote} creatorName = {this.state.creatorName} user = {this.state.user} castVote = {this.castVote} deleteVote = {this.deleteVote} togglePopup = {this.togglePopup}/>
      }
      if (this.state.view === 'user') {
          return <UserView votes = {this.state.userVotes} user = {this.state.user} deleteVote = {this.deleteVote}/>
      }
    },
    
    setSortBy: function(sort) {
        if (this.state.sortBy !== sort) {
            this.setState({sortBy: sort})
        }
    },
    
    setVoteId: function(id) {
        this.setState({voteId: id});
        this.setVote(id);
    },
    
    getCreator: function() {
          request
          .get('../api/idToName/' + this.state.vote.creatorId)
          .end(function(err, data){
              console.log(data.body.name.username)
              this.setState({creatorName: data.body.name.username})
          }.bind(this))
    },
    
    setVote: function(id) {
        var route = '../api/getVote/' + id;
        
        request
        .get(route)
        .end(function(err, data){
            this.setState({vote: data.body})
            this.getCreator();
        }.bind(this))
    },
    
    getAllVotes: function() {
        request
        .get('../api/getVotes')
        .end(function(err, data){
            this.setState({allVotes: data.body})
        }.bind(this))
    },
    
    castVote: function(vote) {
        request
            .post('../api/castVote')
            .send(vote)
            .end(function(err, data){
                console.log(data);
                this.updateVote();
            }.bind(this))
    },
    
    updateVote: function() {
        var route = '../api/getVote/' + this.state.voteId;
        
        request
        .get(route)
        .end(function(err, data){
            this.setState({vote: data.body})
        }.bind(this))
    },
    
    deleteVote: function(id) {
        var route = '../api/deleteVote';
        
        request
        .post(route)
        .send({id: id})
        .end(function(err, data){
            console.log(data.message)
            this.getVotesByUser();
        }.bind(this))
    },
    
    addOption: function(thing) {
      request
      .post('../api/addOption')
      .send(thing)
      .end(function(err, data){
          console.log('adding option')
          console.log(data.body.doc)
          this.updateVote()
      }.bind(this))
    },
    
    removeOption: function(option) {
      request
      .post('../api/deleteOption')
      .send(option)
      .end(function(err, data){
          this.updateVote();
          console.log(data);
      }.bind(this))
        
    },
    
    getVotesByUser: function() {
      
      request
        .get('../api/getVotesByUser')
        .end(function(err, data){
            console.log(data.body.result);
            this.setState({userVotes: data.body.result})
        }.bind(this))
    },

    getSortedVotes: function() {
        
        var sortedVotes;
        var totalVotes = function(vote) {
            var total = 0;
            for (var i = 0; i < vote.things.length; i++) {
                total = total + vote.things[i].votes
            }
            return total;
        }
    
        if (this.state.sortBy === 'newest') {
          sortedVotes = this.state.allVotes.sort(function(a,b){
          return new Date(b.createDate) - new Date(a.createDate);
          });
        }
        
        if (this.state.sortBy === 'oldest') {
          sortedVotes = this.state.allVotes.sort(function(a,b){
          return new Date(a.createDate) - new Date(b.createDate);
          });
        }
        
        if (this.state.sortBy === 'popular') {
            
          sortedVotes = this.state.allVotes.sort(function(a, b){
            return (totalVotes(b) - totalVotes(a))
          })
        }
        
        if (this.state.sortBy === 'unpopular') {
          sortedVotes = this.state.allVotes.sort(function(a, b){
            return (totalVotes(a) - totalVotes(b))
          })
        }
        
        return sortedVotes;
    
  },
    
    render: function() {
        
        return(
            <div>
                {this.state.showPopup ? <Popup close = {this.togglePopup} view = {this.state.popupView} setView = {this.setView} vote = {this.state.vote} setVoteId = {this.setVoteId} addOption = {this.addOption} removeOption = {this.removeOption}/> : null}
                
                <Title/>
                <LoginStrip open = {this.togglePopup} user = {this.state.user}/>
                
                <div className = 'wrapper-main'>
                    
                    {this.state.user ? <CreateButton open = {this.togglePopup} /> : null}
                
                    {this.getView()}
                
                </div>
                
            </div>
            )
    }
});

var Title = React.createClass({
   
   render: function() {
       
       return(
           <div className = 'title-header'><a href = '/'>Votality</a></div>
           )
       
   } 
    
});

var LoginStrip = React.createClass({
    
    render: function() {
        
        return(
            <div className = 'wrapper-login'>
                {this.props.user ? 
                    <div>
                    <span> Welcome, {this.props.user.username} !</span>
                    <div className = 'link'><a href = '../profile'>Profile</a></div>
                    <div className = 'link'><a href = '/auth/logout'>Logout</a></div>
                    </div>
                    : null}
            
                {this.props.user ? null : <div>
                    <div className = 'login'>
                        <a href = '/auth/twitter'><img src = '/images/loginwithtwitter.png' /></a>
                    </div>
                    <div className = 'login'>
                        <a href = '/auth/facebook'><img src = '/images/loginwithfacebook.png' /></a>
                    </div>
                </div>}
            
            </div>
            )
    }
    
});

var CreateButton = React.createClass({
    
    handleClick: function() {
        this.props.open('create');
    },
    
    render: function() {
        return(
            <div className = 'create-button' onClick = {this.handleClick}>+</div>
            
            )
    }
})

var VotesSort = React.createClass({
    
    getClass: function(active) {
        if (this.props.sortBy === active) {
            return 'sortBy-active' ;
        }
        else return 'sortBy-inactive'
    },
    
    render: function() {
        
        return(
                <div className = 'wrapper-votesSort'>
                    <div className = {this.getClass('newest')} onClick = {this.props.sort.bind(null, 'newest')}>Newest</div>
                    <div className = {this.getClass('oldest')} onClick = {this.props.sort.bind(null, 'oldest')}>Oldest</div>
                    <div className = {this.getClass('popular')} onClick = {this.props.sort.bind(null, 'popular')}>Most Popular</div>
                    <div className = {this.getClass('unpopular')} onClick = {this.props.sort.bind(null, 'unpopular')}>Least Popular</div>
                </div>
            )
        
    }
    
})

var VotesView = React.createClass({
    
    setSortBy: function(str) {
        this.props.sort(str);
    },
    
    render: function() {
        
        return (
            
            <div className = 'wrapper-votesView'>
            
                <VotesSort sort = {this.setSortBy} sortBy = {this.props.sortBy}/>
                <VotesWindow allVotes = {this.props.allVotes} />
                
            </div>
            
            )
        
    }
    
})

var VotesWindow = React.createClass({
    
    getAllVotes: function() {
        var strips =
        this.props.allVotes.map(function(vote, index){
            return (<VoteStrip key = {index} vote = {vote}/>)
        })
        
        return strips;
        
    },
    
    render: function() {
        
        if (!this.props.allVotes) {
            return null
        }
        
        return (
            
            <div className = 'wrapper-votesWindow'>
            
                {this.getAllVotes()}
            
            </div>
            
            )
        
    }
    
})

var VoteStrip = React.createClass({
    
    url: function() {
        return ('/votes/' + this.props.vote._id);
    },
    
    render: function() {
        return(
            
            <a href = {this.url()}><div className = 'wrapper-voteStrip'>
                {this.props.vote.title}
            </div></a>
            
            )
    }
    
})

var Popup = React.createClass({
    
    getView: function() {
        if (this.props.view === 'loginregister') {
            return <LoginRegisterView />
        }
        if (this.props.view === 'create') {
            return <CreateView closeWindow = {this.props.close} setView = {this.props.setView} setVoteId = {this.props.setVoteId}/>
        }
        if (this.props.view === 'add') {
            return <AddView addOption = {this.props.addOption} vote = {this.props.vote} removeOption = {this.props.removeOption} />
        }
    },
    
    render: function() {
        
        return(
            <div>
                <div className = 'screen' />
                <div className = 'wrapper-popup'>
                    <div className = 'close-button' onClick = {this.props.close}/>
                    {this.getView()}
                </div>
            </div>
            )
    }
    
})

var AddView = React.createClass({
    
    getInitialState: function() {
        return ({text: ''})
    },

    updateText: function(str) {
        this.setState({text: str})
    },
    
    handleChange: function(e) {
        this.updateText(e.target.value);
    },
    
    handleSubmit: function(e) {
        e.preventDefault();
        var thing = {id: this.props.vote._id, thing: this.state.text}
        console.log(thing)
        this.props.addOption(thing)
        document.getElementsByName('addOption')[0].reset()
    },
    
    removeOption: function(index) {
        if (confirm('Are you sure you want to delete this?')) {
            var option = {index: index, id: this.props.vote._id}
            this.props.removeOption(option) 
        } else {
            // Do nothing!
        }
         
    },
    
    allOptions: function() {
        var allOptions = null;
        if (this.props.vote) {
            console.log(this.props.vote.things)
        allOptions = this.props.vote.things.map(function(thing, index){
            return (<EditOption key = {index} index = {index} option = {thing.thing} removeOption = {this.removeOption} /> )
        }.bind(this));
        allOptions.reverse();
        }
        return allOptions;
    },
    
    render: function() {
        
        
        
        return(
                <div className = 'addView-wrapper'>
                    <div className = 'header'>Edit Options</div>
                    
                    <div className = 'scroll'>{this.allOptions()}</div>
                    
                    <div className = 'bottom'>
                        <form onSubmit = {this.handleSubmit} name = 'addOption'>
                            <input type = 'text' onChange = {this.handleChange}/>
                            <input type = 'submit' value = 'add'/>
                        </form>
                    </div>
                </div>
            
            )
        
    }
    
});

var EditOption = React.createClass({
    
    render: function() {
        
        return (
        <div className = 'option-wrapper' onClick = {this.props.removeOption.bind(null, this.props.index)}>
            <div className = 'text'>{this.props.option}</div>
        </div>
        )
        
    }
    
});

var LoginRegisterView = React.createClass({
    
    openPopup: function() {
        var signinWin = window.open("/auth/facebook", "SignIn", "width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0");
        signinWin.focus();
        return false;
    },
    
    render: function() {
        return(
            <div className = 'wrapper-login-register'>
                <div className = 'title'>Register or Log In</div>
                
               <div className = 'facebook'><a href = '/auth/facebook'><img src = '/images/loginwithfacebook.png' /></a></div>
               
               <div className = 'facebook'><a href = '/auth/twitter'><img src = '/images/loginwithtwitter.png' /></a></div>
               
            </div>
            )
    }
})

var CreateView = React.createClass({
    
    getInitialState: function() {
      return({title: 'Title', things: ['Thing 1', 'Thing 2']})  
    },
    
    addThing: function() {
        var newThing = 'Thing ' + (this.state.things.length + 1)
        this.state.things.push(newThing);  
        this.setState({things: this.state.things})
    },
    
    removeThing: function() {
        if (this.state.things.length > 2) {
        this.state.things.pop();
        this.setState({things: this.state.things})
        }
    },
    
    updateThing: function(index, e) {
        this.state.things[index] = e.target.value;
        this.setState({things: this.state.things})
    },
    
    updateTitle: function(e) {
      this.setState({title: e.target.value})  
    },
    
    createVote: function(vote) {
        request
            .post('/api/createVote')
            .send(vote)
            .end(function(err, data){
                this.props.setVoteId(data.body.vote._id);
                window.location = "/votes/" + data.body.vote._id;
            }.bind(this))
    },
    
    onSubmit: function(e) {
        var self = this;
        
        e.preventDefault();
        
        var things = this.state.things;
        var title = this.state.title;
        
        var vote = {title: title, things: things};
        
        this.createVote(vote);
    },

    thingInputs: function() {
        
      var newThing = this.state.things.map(function(thing, index){
          return (
              <div>
                <input key = {index} type = 'text'  placeholder = {thing} onChange = {this.updateThing.bind(null, index)}/>
              </div>
              )
      }.bind(this))
      
      return newThing
    },
    
    render: function() {
        return(
            
            <div className = 'wrapper-create'>
                <form onSubmit = {this.onSubmit}>
                    <div className = 'wrapper-title'>
                        <input type = 'text' name = 'title' placeholder = 'Vote Title' onChange = {this.updateTitle}/>
                    </div>
                    
                    <div className = 'buttons'>
                        <div className = 'button' onClick = {this.addThing}>add</div>
                        <div className = 'button' onClick = {this.removeThing}>remove</div>
                    </div>
                    
                    <div className = 'things-window'>
                        {this.thingInputs()}
                    </div>
                
                    <div className = 'wrapper-submit'><button type = 'submit'>submit</button></div>
                    
                </form>
                
            </div>
            
            )
    }
});

var VoteView = React.createClass({
    
    getInitialState: function() {
      return({selection: 0, username: 'test'})
    },
    
    setSelection: function(e){
        this.setState({selection: e.target.value})  
    },

    
    onSubmit: function(e) {
        e.preventDefault();
        
        var selection = this.state.selection;
        var voteId = this.props.vote._id;
        
        this.props.castVote({voteId: voteId, selection: selection});
    },
    
    ownsVote: function() {

        if (!this.props.user) {
            return false
        }
        else {
        return (this.props.user._id === this.props.vote.creatorId)
        }
    },
    
    getOptions: function() {
            if (this.props.vote.things){
            return (
                
                this.props.vote.things.map(function(thing, index) {
                    return (
                        <option key = {index} value = {index}>{thing.thing}</option>
                        )
                }))
            }
    },
    
    share: function() {
        FB.ui(
        {
        method: 'share',
        href: window.location.href
        }, function(response){});  
    },
    
    render: function() {
        
        document.title = this.props.vote.title;
        
        if (!this.props.vote.things) {
            return null;
        }
        
        else
        
        return (
        <div>
            <div className = 'vote_title'><span className = 'title'>{this.props.vote.title}</span><p/><span className = 'author'>created by {this.props.creatorName} on {Moment(this.props.vote.createDate).format('MMMM Do YYYY')}</span></div>
            
            <div className = 'voteView-left'>
                <div className = 'vote_title'>
                    
                    <span className = 'cast'>Cast a vote</span>
                    <form onSubmit = {this.onSubmit}>
                        <select value={this.state.selection} onChange = {this.setSelection}>
                            {this.getOptions()}
                        </select>
                        
                        <input type = 'submit' className = 'vote-button' value = 'Vote!' />
                    </form>
                    
                    <div className = 'share'>
                        <div className = 'share-to-facebook' onClick = {this.share}>Share to Facebook</div>
                    </div>
                    
                    {this.ownsVote() ? <EditVote deleteVote = {this.props.deleteVote} vote = {this.props.vote} togglePopup = {this.props.togglePopup}/> : null}
                    
                    
                </div>
            </div>
            <div className = 'voteView-right'>
                <div className = 'graph-wrapper'><center><Chart vote = {this.props.vote} /></center></div>
            </div>
        </div>
        )
    }
    
});

var EditVote = React.createClass({
    
    render: function() {
        return (
                <div className = 'edit-wrapper'>
                    <DeleteVote voteId = {this.props.vote._id} deleteVote = {this.props.deleteVote} />
                    <AddOption togglePopup = {this.props.togglePopup} />
                </div>
            )
    }
    
})

var DeleteVote = React.createClass({
    
    handleClick: function() {
        if (confirm('Are you sure you want to delete this?')) {
            this.props.deleteVote(this.props.voteId);
            window.location = '/';
        } else {
            // Do nothing!
        }
    },
    
    render: function() {
        return(
            <div className = 'edit-button' onClick = {this.handleClick}> Delete Poll </div>
    )}
    
});

var AddOption = React.createClass({
    
    handleClick: function(str) {
        this.props.togglePopup('add')
    },
    
    render: function() {
        return(
            
            <div className = 'edit-button' onClick = {this.handleClick}>Edit Poll</div>       
            
            )
    }
})

var Chart = React.createClass({
    
    createChart: function() {
        
        function getRandomColor() {
            return ('#'+Math.floor(Math.random()*16777215).toString(16));
        }
        
        
        var pie = new Quiche('pie');
        pie.setTransparentBackground(); // Make background transparent
        
        //if vote total is 0, display all potential categories equally
        var totalVotes = 0;
            this.props.vote.things.forEach(function(thing){
                totalVotes = totalVotes + thing.votes
            });
            
        if (totalVotes === 0) {
        
            this.props.vote.things.forEach(function(thing){
                pie.addData(thing.votes+1, thing.thing, getRandomColor());
            })
        
        }
        
        else {
            
            this.props.vote.things.forEach(function(thing){
                pie.addData(thing.votes, thing.thing, getRandomColor());
            })
            
        }

        var imageUrl = pie.getUrl(true); // First param controls http vs. https
        
        return imageUrl;
    },
    
    render: function() {
        
        return (
            
                <div>
                
                    <img src = {this.createChart()}/>
                
                </div>
            
            )
        
    }
    
})

var UserView = React.createClass({
    
    render: function() {
        
        return (
            
                <div className = 'user-wrapper'>
                    
                    <div className = 'voteView-left'>
                        <UserStats user = {this.props.user} votes = {this.props.votes}/>
                    </div>
                    
                    <div className = 'voteView-right'>
                        <span className = 'header'>My Polls</span>
                        <div className = 'votes-wrapper'>
                            <VotesByUser votes = {this.props.votes} deleteVote = {this.props.deleteVote} />
                        </div>
                    </div>
                
                
                </div>
            
            )
    }
    
});


var VotesByUser = React.createClass({
    
    handleClick: function(id) {
        if (confirm('Are you sure you want to delete this?')) {
            this.props.deleteVote(id);
        } else {
            // Do nothing!
        }
      
    },
    
    renderVotes: function() {
        var votes = this.props.votes.map(function(vote, index){
            return (<ProfileStrip key = {index} vote = {vote} deleteVote = {this.handleClick}/>)
        }.bind(this))
        
        return votes;
    },

    
    render: function() {
        
        if (!this.props.votes) {
            return null
        }
        
        else return (
            <div>
                {this.renderVotes()}
            </div>
            
            )
        
    }
    
});

var ProfileStrip = React.createClass({
   
   url: function() {
        return ('/votes/' + this.props.vote._id);
    },
    
    totalVotes: function() {
      var total = 0;
      this.props.vote.things.forEach(function(thing){
          total = total + thing.votes
      })
      
      return total;
        
    },
    
    daysActive: function() {
      var start = Moment(this.props.vote.createDate);
      var today = Moment(new Date());
      var days = today.diff(start, 'days');
      
      return days + 1;
        
    },
    
    render: function() {
        return(
            
            <div className = 'wrapper-voteStrip-small'>
                <div className = 'close-button' onClick = {this.props.deleteVote.bind(null, this.props.vote._id)} />
                <span className = 'title'><a href = {this.url()}>{this.props.vote.title}</a></span>
                <div>Days Active: {this.daysActive()}</div>
                <div>Total Votes: {this.totalVotes()}</div>
            </div>
            
            )
    }
    
});

var UserStats = React.createClass({
    
    getInitialState: function() {
        
        return({username: '', update: false})
        
    },
    
    totalVotes: function() {
        return this.props.votes.length;
    },
    
    toggleUpdate: function() {
      this.setState({update : !this.state.update})  
    },
    
    updateUsername: function(e) {
      this.setState({username: e.target.value})  
    },
    
    handleSubmit: function(e) {
        if (this.state.username != '') {
        request
        .post('../api/setUsername')
        .send({id: this.props.user._id, name: this.state.username})
        .end(function(err, data){
            console.log(data)
        })
        }
    },
    
    totalVoteCount: function() {
        var total = 0;
        this.props.votes.forEach(function(vote){
            vote.things.forEach(function(thing){
                total = total + thing.votes;
            })
        })
        return total;
    },
    
    renderDate: function() {
        var createDate = new Date(this.props.user.createDate);
        return Moment(createDate).format('dddd, MMMM Do YYYY');
    },
    
    render: function() {
        
        if (!this.props.user) {
            return null
        }
        
        return (
            <div>
                <div className = 'stat'><span className = 'label'>Name :</span> {this.props.user.username}
                    {this.state.update ?
                        <form onSubmit = {this.handleSubmit}>
                        <input type = 'text' placeholder = {this.props.user.username} onChange = {this.updateUsername} />
                        <input type = 'submit' className = 'edit-button' />
                        </form>
                        :
                        <div className = 'edit-button' onClick = {this.toggleUpdate}>Edit</div>
                    }
                </div>
                <div className = 'stat'><span className = 'label'>Active Since:</span> {this.renderDate()}</div>
                <div className = 'stat'><span className = 'label'>Total Polls Created:</span> {this.totalVotes()}</div>
                <div className = 'stat'><span className = 'label'>Total Votes Received:</span> {this.totalVoteCount()}</div>

                <div className = 'delete-wrapper'>
                    <div className = 'edit-button'>Delete Account</div>
                </div>
                
            </div>
            )
    }
    
});

ReactDOM.render(<App/>, document.getElementById('anchor'));