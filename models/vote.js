var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteSchema = new Schema({
    title: String,
    things: [{thing: String, votes: Number, _id: false}],
    createDate: Date,
    expiry: Date,
    creatorId: String,
});

voteSchema.methods.castVote = function(int) {
    this.things[int].votes = this.things[int].votes + 1;
}

voteSchema.methods.addThing = function(str) {
    this.things.push({thing: str, votes: 0})
}

voteSchema.methods.removeThing = function(index) {
    this.things.splice(index, 1);
    this.save();
}

module.exports = mongoose.model('Vote', voteSchema);