var Project = require('../models/project');

module.exports = {
    save: function (project, cb) {
        var p = new Project(project);
        p.save(function (err, data) {
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
    listByUser: function (user, cb) {
        Project.find({
            $or: [
                {owner: user},
                {belong: {$in: [user]}}
            ]
        }, function (err, data) {
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
        Project.update({_id: key}, fields, function (err, data) {
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