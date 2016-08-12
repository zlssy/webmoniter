var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var page = new Schema({
    pid: String,
    name: String,
    desc: String
});

module.exports = mongoose.model('Page', page);