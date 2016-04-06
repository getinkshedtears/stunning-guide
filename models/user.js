var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String,
    createDate: Date,
    facebook         : {
        id           : String,
        token        : String,
        name         : String
    },
    twitter :{
      id: String,
      token: String,
    },
    votes: Array
});

userSchema.methods.setUsername = function(str) {
    this.username = str;
    this.save();
};

module.exports = mongoose.model('User', userSchema);