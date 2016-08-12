var Point = require('../models/point');

module.exports = {
    create: function (point, cb) {
        var p = new Point(point);
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
    list: function (pid, cb) {
        var query = Point.find({pid: pid});
        query.sort({tag: -1}).exec(function (err, data) {
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
    del: function (id, cb) {
        Point.findOneAndRemove({_id: id}, function (err, data) {
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