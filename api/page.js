var Page = require('../models/page');

module.exports = {
    save: function (obj, cb) {
        var p = new Page(obj);
        p.save(function (err, data) {
            if (err) {
                return cb({
                    code: 1,
                    msg: err.message
                });
            }
            cb({
                code: 0,
                data: data
            });
        });
    },
    listByPid: function (pid, cb) {
        Page.find({pid: pid}, function (err, data) {
            if (err) {
                return cb({
                    code: 1,
                    msg: err.message
                });
            }
            cb({
                code: 0,
                data: data
            });
        });
    }
};