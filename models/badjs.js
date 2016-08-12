var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var badjs = new Schema({
    pid: String,
    url: String,
    message: String,
    line: Number,
    col: Number,
    platform: String,
    version: String,
    createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Badjs', badjs);