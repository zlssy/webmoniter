var Model = require('../models/account');

module.exports = {
    checkusername: function (username, cb) {
        Model.findByUsername(username, function (err, data) {
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
    search: function (cond, cb) {
        var query = Model.find(cond || {});
        query.sort({active: 1, createTime:-1});
        query.exec(function (err, data) {
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
    update: function (key, field, cb) {
        Model.update({_id: key}, field, function (err, data) {
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
    resetPwd: function (id, newpwd, cb) {
        var m = new Model();
        m.setPassword(newpwd, function (err, data) {
            if (err) {
                return cb({
                    code: 1,
                    msg: err.message || err
                });
            }
            Model.findByIdAndUpdate(id, {salt: data.salt, hash: data.hash}, function (err, data) {
                if (err) {
                    return cb({
                        code: 2,
                        msg: err.message
                    });
                }
                cb({
                    code: 0,
                    data: data
                });
            });
        });
    }
};