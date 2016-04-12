var React = require('react');
var ReactDOM = require('react-dom');
var Store = require('./appStore');
var Actions = require('./appActions');
var Api = require('./appApi');
var Moment = require('moment');
var Quiche = require('quiche');
var Chart = require('react-google-charts');

var App = React.createClass({
    
    getInitialState: function() {
        return(Store.getStore())  
    },
    
    componentDidMount: function() {
        Store.addChangeListener(this._onChange);
        
        Api.fetchVotes();
        Api.fetchUser();
        
         if (voteID != null) {
             console.log('updating to vote view')
            Actions.updateVoteID(voteID)
            Actions.updateView('vote');
        }
            
        if (userState) {
            Actions.updateView('user')
        }
    },
    
    componentWillUnmount: function() {
        Store.removeChangeListener(this._onChange)  
    },
    
    _onChange: function() {
        console.log('store change detected')
        console.log(Store.getStore())
        this.setState(Store.getStore())
    },
    
    getView: function() {
        switch(this.state.currentView) {
            case 'votes':
                return (<VotesView votes = {this.getSortedVotes()} sortBy = {this.state.sortBy} sort = {Actions.updateSortby} />)
                break;
                
            case 'vote':
                console.log(this.state.currentVote)
                return (<VoteView vote = {this.state.currentVote} user = {this.state.user} togglePopup = {Actions.togglePopup} />)
                break;
                
            case 'user':
                return (<UserView votes = {this.state.votesByUser} user = {this.state.user} delete = {this.deleteVote} updateUsername = {this.updateUsername} />)
                break;
                
            default: return true;
        }
    },
    
    deleteVote: function(id) {
        Api.deleteVote(id);
    },
    
    updateUsername: function(name) {
        Api.updateUsername(name);
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
          sortedVotes = this.state.votes.sort(function(a,b){
          return new Date(b.createDate) - new Date(a.createDate);
          });
        }
        
        if (this.state.sortBy === 'oldest') {
          sortedVotes = this.state.votes.sort(function(a,b){
          return new Date(a.createDate) - new Date(b.createDate);
          });
        }
        
        if (this.state.sortBy === 'popular') {
            
          sortedVotes = this.state.votes.sort(function(a, b){
            return (totalVotes(b) - totalVotes(a))
          })
        }
        
        if (this.state.sortBy === 'unpopular') {
          sortedVotes = this.state.votes.sort(function(a, b){
            return (totalVotes(a) - totalVotes(b))
          })
        }
        
        return sortedVotes;
    
  },
    
    render: function() {

        
        return (
        <div>
            <Popup show = {this.state.showPopup} toggle = {Actions.togglePopup} view = {this.state.popupView} vote = {this.state.currentVote}/>
        
            <Title/>
            <LoginStrip user = {this.state.user}/>
            
            <div className = 'wrapper-main'>
                    {this.state.user ? <CreateButton open = {Actions.togglePopup} /> : null}
                    {this.getView()}
                
            </div>
        
        </div>)
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
        this.props.open();
        Actions.updatePopupView('add');
    },
    
    render: function() {
        return(
            <div className = 'create-button' onClick = {this.handleClick}>+</div>
            
            )
    }
});

var VotesView = React.createClass({
    
    render: function() {
        
        return (
            
            <div className = 'wrapper-votesView'>
            
                <VotesSort sort = {this.props.sort} sortBy = {this.props.sortBy}/>
                <VotesWindow votes = {this.props.votes} />
                
            </div>
            
            )
        
    }
    
});

var VotesWindow = React.createClass({
    
    getAllVotes: function() {
        var strips =
        this.props.votes.map(function(vote, index){
            return (<VoteStrip key = {index} vote = {vote}/>)
        })
        
        return strips;
        
    },
    
    render: function() {
        
        if (!this.props.votes) {
            return null
        }
        
        return (
            
            <div className = 'wrapper-votesWindow'>
                
                {this.getAllVotes()}
            
            </div>
            
            )
        
    }
    
});

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
    
});

var Popup = React.createClass({
    
    getView: function() {
        switch(this.props.view) {
            case 'add':
                return (<Popup_Create />);
            case 'edit':
                return (<Popup_Edit vote = {this.props.vote} />);
        }
    },
    
    render: function() {

            return(

                <div>
                {this.props.show ?
                <div>
                    <div className = 'screen' />
                    <div className = 'wrapper-popup'>
                        <div className = 'close-button' onClick = {this.props.toggle}/>
                        {this.getView()}
                    </div>
                </div>
                : null}
                </div>

                )

    }
    
});

var Popup_Create = React.createClass({
    
    getInitialState: function() {
      return({title: 'title', options: ['thing 1', 'thing 2']})  
    },
    
    updateOption: function(index, e) {
      this.state.options[index] = e.target.value;
      console.log(this.state.options);
    },
    
    updateTitle: function(e) {
      this.setState({title: e.target.value});
    },
    
    componentDidUpdate: function() {
      var scroll = document.getElementById('things-window');
      scroll.scrollTop = scroll.scrollHeight;
    },
    
    addOption: function() {
      var newOption = ('thing ' + (this.state.options.length + 1));
      this.state.options.push(newOption);
      this.setState({options: this.state.options})
    },
    
    removeOption: function(index) {
        this.state.options.splice(index, 1);
        this.setState({options: this.state.options})
    },
    
    handleSubmit: function(e) {
        e.preventDefault();
        var newVote = {title: this.state.title, things: this.state.options};
        Api.createVote(newVote);
    },
    
    showOptions: function() {
        return this.state.options.map(function(option, index){
            return (
                <div key = {index}>
                    <input type = 'text' onChange = {this.updateOption.bind(null, index)} placeholder = {option} />
                    {(index > 1) ? <div className = 'add_subtract' onClick = {this.removeOption.bind(null, index)}> - </div> : null}
                </div>
                )
        }.bind(this))
    },

    render: function() {
        return(
            
            <div className = 'wrapper-create'>
                <form onSubmit = {this.handleSubmit}>
                    <div className = 'wrapper-title'>
                        <input type = 'text' name = 'title' placeholder = 'Poll Title' onChange = {this.updateTitle}/>
                    </div>
                    
                    <div className = 'things-window' id = 'things-window'>
                        {this.showOptions()}
                        <div className = 'add_subtract' onClick = {this.addOption}>+</div>
                    </div>
                    
                
                    <div className = 'wrapper-submit'><input type = 'submit' /></div>
                    
                </form>
                
            </div>
            
            )
    }
    
});

var VoteView = React.createClass({
    
    getInitialState: function() {
      return({selection: 0})
    },
    
    setSelection: function(e){
        this.setState({selection: e.target.value})  
    },

    onSubmit: function(e) {
        e.preventDefault();
        
        var selection = this.state.selection;
        var voteId = this.props.vote._id;
        
        Api.castVote({voteId: voteId, selection: selection});
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
        
        if (!this.props.vote) {
            return null;
        }
        
        else
        
        document.title = this.props.vote.title;  
        
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
                    
                    {this.ownsVote() ? <EditVote vote = {this.props.vote} togglePopup = {this.props.togglePopup}/> : null}
                    
                    
                </div>
            </div>
            <div className = 'voteView-right' id = 'right'>
                <center><Chart vote = {this.props.vote} /></center>
            </div>
        </div>
        )
    }
    
});

var Chart = React.createClass({

    drawChart: function() {
        
        var voteData = [['Option', 'Votes']];
        this.props.vote.things.forEach(function(option){
            voteData.push([option.thing, option.votes])
        });
        
        var data = google.visualization.arrayToDataTable(
          voteData
        );

        var options = {
            chartArea:{left:0,top:0,width:'100%',height:'75%'}
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
    },
    
    componentDidMount: function() {
        this.drawChart();
    },
    
    componentDidUpdate: function() {
        console.log('redraw chart')
        google.charts.setOnLoadCallback(this.drawChart);
        this.drawChart();  
    },
    
    render: function() {
        
        return (
            
                <div>
                
                    <div id = 'piechart' className = 'chart' />
                
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
            Api.deleteVote({id : this.props.voteId});
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
        Actions.togglePopup();
        Actions.updatePopupView('edit');
    },
    
    render: function() {
        return(
            
            <div className = 'edit-button' onClick = {this.handleClick}>Edit Poll</div>       
            
            )
    }
});


var UserView = React.createClass({
    
    render: function() {
        
        return (
            
                <div className = 'user-wrapper'>
                    
                    <div className = 'voteView-left'>
                        <UserStats votes = {this.props.votes} user = {this.props.user} updateUsername = {this.props.updateUsername}/>
                    </div>
                    
                    <div className = 'voteView-right'>
                        <span className = 'header'>My Polls</span>
                        <div className = 'votes-wrapper'>
                            <VotesByUser votes = {this.props.votes} delete = {this.props.delete} />
                        </div>
                    </div>
                
                
                </div>
            
            )
    }
    
});


var VotesByUser = React.createClass({
    
    handleClick: function(id) {
        if (confirm('Are you sure you want to delete this?')) {
            this.props.delete({id: id});
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
        e.preventDefault();
        
        if (this.state.username != '') {
            this.props.updateUsername({id: this.props.user._id, name:this.state.username});
        }
        
        this.setState({update: false});
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
    
    handleDelete: function() {
        if (confirm('Are you sure you want to delete this account?  All of your polls will also be removed.')) {
            var user = {id: this.props.user}
            Api.deleteAccount(user);
            window.location = '/auth/logout'
        } else {
            // Do nothing!
        }
    },
    
    render: function() {
        
        if (!this.props.user || !this.props.votes) {
            return null
        }
        
        return (
            <div>
                <div className = 'stat'><span className = 'label'>Name :</span>
                {this.state.update ?
                    <form onSubmit = {this.handleSubmit}>
                        <input type = 'text' placeholder = {this.props.user.username} onChange = {this.updateUsername} />
                        <input type = 'submit' className = 'edit-button' />
                    </form>
                    : <span>{this.props.user.username}</span>
                }
                
                                
                    {this.state.update ?
                        null
                        :
                        <div className = 'edit-button' onClick = {this.toggleUpdate}>Edit</div>
                    }

                </div>
                <div className = 'stat'><span className = 'label'>Active Since:</span> {this.renderDate()}</div>
                <div className = 'stat'><span className = 'label'>Total Polls Created:</span> {this.totalVotes()}</div>
                <div className = 'stat'><span className = 'label'>Total Votes Received:</span> {this.totalVoteCount()}</div>

                <div className = 'delete-wrapper'>
                    <div className = 'edit-button' onClick = {this.handleDelete}>Delete Account</div>
                </div>
                
            </div>
            )
    }
    
});

var Popup_Edit = React.createClass({
    
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
        Api.addOption(thing)
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
            return (<EditOption key = {index} index = {index} option = {thing.thing} removeOption = {this.removeOption} vote = {this.props.vote} /> )
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
    
    handleClick: function(index) {
      var id = this.props.vote._id;
      Api.deleteOption({index: index, id: id})
    },
    
    render: function() {
        
        return (
        <div className = 'option-wrapper' onClick = {this.handleClick.bind(null, this.props.index)}>
            <div className = 'text'>{this.props.option}</div>
        </div>
        )
        
    }
    
});

ReactDOM.render(<App/>, document.getElementById('anchor'));