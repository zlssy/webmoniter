var Record = require('../models/record');

module.exports = {
    save: function (obj, cb) {
        var r = new Record(obj);
        r.save(function (err, data) {
            if(err){
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
    list: function (cond, page, pagesize, staTatol, cb) {
        var r = !!staTatol, query = Record.find(cond || {}), count=0;
        page-=0;pagesize-=0;
        if (r) {
            count = query.count(function (err, data) {
                if(err){
                    return cb({
                        code: 0,
                        data: [],
                        total: 0
                    });
                }
                count = data;
                getData();
            });
        }
        else {
            getData();
        }

        function getData() {
            var query = Record.find(cond || {}).sort({createTime: -1});
            query.skip((page - 1) * pagesize).limit(pagesize || 20);
            query.exec(function (err, data) {
                if (err) {
                    return cb({
                        code: 1,
                        msg: err.message
                    });
                }
                cb({
                    code: 0,
                    data: data,
                    total: count
                });
            });
        }
    },
    stat: function (cond, cb) {
        Record.find(cond || {}, {tag:1, createTime:1, _id: 0}, function (err, data) {
            if(err){
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