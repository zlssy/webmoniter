var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var point = new Schema({
    pid: String,
    name: String,
    desc: String,
    type: {type: Number, default: 0},
    tag: Number
});

module.exports = mongoose.model('Point', point);