var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passortLocalMongoose = require("passport-local-mongoose");

var Account = new Schema({
    username: String,
    password: String,
    name: String,
    dep: String,
    active: {type: Boolean, default: false},
    createTime: {type: Date, default: Date.now},
    lastLoginTime: {type: Date, default: Date.now}
});

Account.plugin(passortLocalMongoose);
module.exports = mongoose.model('Account', Account);