var UserInfo = require('../models/userinfo');

module.exports = {
    save: function (obj, cb) {
        var u = new UserInfo(obj);
        u.save(function (err, data) {
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
    get: function (key, cb) {
        UserInfo.find({username: key}, function (err, data) {
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
    update: function (key, fields, cb) {
        UserInfo.update({username: key}, fields, function (err, data) {
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