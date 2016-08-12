var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var project = new Schema({
    name: String,
    owner: String,
    belong: [String],
    createTime: {type: Date, default: Date.now},
    lastModify: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Project', project);