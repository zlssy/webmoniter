var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var point = new Schema({
    pid: String,
    name: String,
    desc: String,
    tag: Number
});

module.exports = mongoose.model('Point', point);