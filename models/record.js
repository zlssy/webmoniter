var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var record = new Schema({
    pid: String,
    tag: Number,
    value: String,
    createTime: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Record', record);