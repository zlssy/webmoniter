var Badjs = require('../models/badjs');

module.exports = {
    list: function (cond, page, pagesize, readCount, cb) {
        var query = Badjs.find(cond || {}), rc = !!readCount, count = 0;
        page -= 0; pagesize -= 0;
        if (rc) {
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
            var query = Badjs.find(cond || {}).sort({createTime: -1});
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
    save: function (obj, cb) {
        var b = new Badjs(obj);
        b.save(function (err, data) {
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