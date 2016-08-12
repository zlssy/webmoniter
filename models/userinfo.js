var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userInfo = new Schema({
    username: String,
    name: String,
    platPages: [String]
});
module.exports = mongoose.model('UserInfo', userInfo);