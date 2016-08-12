var Account = require('./account');
var Project = require('./project');
var Page = require('./page');
var Badjs = require('./badjs');
var Point = require('./point');
var Record = require('./record');
var UserInfo = require('./userinfo');
var PageModel = require('../models/page');
var ProjectModel = require('../models/project');

function checkLogin(req, res, cb) {
    if (!(req.session && req.session.passport && req.session.passport.user)) {
        return res.json({
            code: -1,
            msg: 'not login'
        });
    }
    cb();
}

module.exports = {
    account: {
        checkusername: function (req, res, next) {
            checkLogin(req, res, function () {
                Account.checkusername(req.body.username, function (o) {
                    res.json(o);
                });
            });
        },
        search: function (req, res, next) {
            checkLogin(req, res, function () {
                var key = req.body.key, cond;
                if (key) {
                    cond = new RegExp(key);
                }
                else {
                    cond = {};
                }
                Account.search(cond, function (o) {
                    res.json(o);
                });
            });
        },
        update: function (req, res, next) {
            checkLogin(req, res, function () {
                var id = req.body.id,
                    active = req.body.active;
                if (id) {
                    Account.update(id, {active: active}, function (o) {
                        res.json(o);
                    });
                }
                else {
                    res.json({
                        code: 10,
                        msg: 'lost id.'
                    });
                }
            });
        },
        resetpwd: function (req, res, next) {
            checkLogin(req, res, function () {
                var id = req.body.id,
                    pwd = req.body.pwd;
                if (id && pwd) {
                    Account.resetPwd(id, pwd, function (o) {
                        res.json(o);
                    });
                }
                else {
                    res.json({
                        code: 10,
                        msg: 'lost required parameters.'
                    });
                }
            });
        }
    },
    project: {
        create: function (req, res, next) {
            checkLogin(req, res, function () {
                var user = req.session.passport.user,
                    name = req.body.name;
                if (user && name) {
                    Project.save({
                        name: name,
                        owner: user,
                        belong: [user]
                    }, function (o) {
                        res.json(o);
                    });
                }
            });
        },
        update: function (req, res, next) {
            checkLogin(req, res, function () {
                checkLogin(req, res, function () {
                    var id = req.body.id,
                        belong = req.body.belong,
                        fields = {};
                    if (id) {
                        if (belong != null) {
                            fields.belong = belong.split(',');
                        }
                        Project.update(id, fields, function (o) {
                            res.json(o);
                        });
                    }
                    else {
                        res.json({
                            code: 10,
                            msg: 'lost id.'
                        });
                    }
                });
            });
        },
        list: function (req, res, next) {
            checkLogin(req, res, function () {
                var user = req.session.passport.user;
                Project.listByUser(user, function (o) {
                    res.json(o);
                });
            });
        }
    },
    page: {
        save: function (req, res, next) {
            checkLogin(req, res, function () {
                var name = req.body.name,
                    pid = req.body.pid,
                    desc = req.body.desc;

                if (name && pid) {
                    Page.save({
                        pid: pid,
                        name: name,
                        desc: desc
                    }, function (o) {
                        res.json(o);
                    });
                }
                else {
                    res.json({
                        code: 10,
                        msg: 'lost pid or name'
                    });
                }
            });
        },
        list: function (req, res, next) {
            checkLogin(req, res, function () {
                var pid = req.query['pid'];
                if (pid) {
                    Page.listByPid(pid, function (o) {
                        res.json(o);
                    });
                }
                else {
                    res.json({
                        code: 10,
                        msg: 'lost pid.'
                    });
                }
            });
        },
        map: function (req, res, next) {
            checkLogin(req, res, function () {
                var pages = req.body.pages, p, r = {};
                if (pages) {
                    p = pages.split(',');
                    PageModel.find({_id: {$in: p}}, function (err, data) {
                        if (err) {
                            return res.json({
                                code: 1,
                                msg: err.message
                            });
                        }
                        else {
                            var projectIdMap = {}, projectIDs = [];
                            for (var i = 0, l = data.length; i < l; i++) {
                                r[data[i]._id] = {name: data[i].name, pid: data[i].pid};
                                projectIdMap[data[i].pid] = 1;
                            }
                            for (var k in projectIdMap) {
                                if (projectIdMap.hasOwnProperty(k)) {
                                    projectIDs.push(k);
                                }
                            }
                            if (projectIDs.length) {
                                ProjectModel.find({_id: {$in: projectIDs}}, function (err, data) {
                                    if (err) {
                                        return res.json({
                                            code: 0,
                                            data: r
                                        });
                                    }
                                    else {
                                        var projectMap = {};
                                        for (var i = 0, l = data.length; i < l; i++) {
                                            projectMap[data[i]._id] = data[i].name;
                                        }
                                        r.project = projectMap;
                                        res.json({
                                            code: 0,
                                            data: r
                                        });
                                    }
                                });
                            }
                            else {
                                res.json({
                                    code: 0,
                                    data: r
                                });
                            }
                        }
                    });
                }
                else {
                    res.json({
                        code: 10,
                        msg: 'lost pages.'
                    });
                }
            });
        }
    },
    badjs: {
        record: function (req, res, next) {
            var r = req.query['r'];
            if (r) {
                var rs = r.split('|'),
                    pid = rs[0],
                    line = rs[1] === void(0) ? -1 : rs[1] || 0,
                    col = rs[2] === void(0) ? -1 : rs[2] || 0,
                    url = rs[3],
                    platform = rs[4],
                    version = rs[5],
                    msg = rs[6];
                Badjs.save({
                    pid: pid,
                    url: url,
                    line: line,
                    col: col,
                    platform: platform,
                    version: version,
                    message: msg
                }, function (o) {
                    res.json(o);
                });
            }
            else {
                res.json({
                    code: 10,
                    msg: ''
                });
            }
        },
        list: function (req, res, next) {
            checkLogin(req, res, function () {
                var pid = req.query['pid'],
                    startDate = req.query['startdate'],
                    endDate = req.query['enddate'],
                    page = req.query['page'] || 1,
                    pagesize = req.query['pagesize'] || 20,
                    rc = req.query['rc'] || 1,
                    cond = [],
                    q = {};
                cond.push({pid: pid});
                if (pid) {
                    startDate && cond.push({createTime: {$gt: startDate}});
                    endDate && cond.push({createTime: {$lt: endDate}});
                    cond.length === 1 ? q = cond[0] : q = {$and: cond};
                    Badjs.list(q, page, pagesize, !!rc, function (o) {
                        res.json(o);
                    });
                }
                else {
                    res.json({
                        code: 10,
                        msg: 'lost pid'
                    });
                }
            });
        }
    },
    point: {
        list: function (req, res, next) {
            Point.list(req.query['pid'], function (o) {
                res.json(o);
            });
        },
        create: function (req, res, next) {
            var p = {};
            p.pid = req.body.pid;
            p.name = req.body.name;
            p.desc = req.body.desc;
            p.tag = req.body.tag - 0;
            if (p.pid && p.name) {
                Point.create(p, function (o) {
                    res.json(o);
                });
            }
            else {
                res.json({
                    code: 10,
                    msg: 'lost pid or name.'
                });
            }
        },
        del: function (req, res, next) {
            var id = req.body.id;
            if (id) {
                Point.del(id, function (o) {
                    res.json(o);
                });
            }
            else {
                res.json({
                    code: 10,
                    msg: 'lost id.'
                });
            }
        }
    },
    record: {
        report: function (req, res, next) {
            var a = req.query['a'],
                b = req.query['b'],
                bArr, p;
            if (a && b) {
                bArr = b.split('|');
                try {
                    for (var i = 0, l = bArr.length; i < l; i += 2) {
                        Record.save({
                            pid: a,
                            tag: bArr[i],
                            value: bArr[i + 1] || ''
                        }, function (o) {
                            res.end('');
                        });
                    }
                    res.json({
                        code: 0
                    });
                } catch (e) {
                    res.json({
                        code: 1,
                        msg: e.message
                    });
                }
            }
            else {
                res.json({
                    code: 10,
                    msg: ''
                });
            }
        },
        list: function (req, res, next) {
            checkLogin(req, res, function () {
                var pid = req.query['pid'],
                    startDate = req.query['startdate'],
                    endDate = req.query['enddate'],
                    page = req.query['page'] || 1,
                    pagesize = req.query['pagesize'] || 20,
                    rc = req.query['rc'] || 1,
                    cond = [],
                    q = {};
                cond.push({pid: pid});
                if (pid) {
                    startDate && cond.push({createTime: {$gt: startDate}});
                    endDate && cond.push({createTime: {$lt: endDate}});
                    cond.length === 1 ? q = cond[0] : q = {$and: cond};
                    Record.list(q, page, pagesize, !!rc, function (o) {
                        res.json(o);
                    });
                }
                else {
                    res.json({
                        code: 10,
                        msg: 'lost pid'
                    });
                }
            });
        },
        stat: function (req, res, next) {
            checkLogin(req, res, function () {
                var pid = req.query['pid'],
                    startDate = req.query['startdate'],
                    endDate = req.query['enddate'],
                    cond = [{pid: pid}], q = {};
                startDate && cond.push({createTime: {$gt: startDate}});
                endDate && cond.push({createTime: {$lt: endDate}});
                if (pid) {
                    cond.length === 1 ? q = cond[0] : q = {$and: cond};
                    Record.stat(q, function (o) {
                        res.json(o);
                    });
                }
                else {
                    res.json({
                        code: 10,
                        msg: 'lost pid'
                    });
                }
            });
        }
    },
    userinfo: {
        save: function (req, res, next) {
            checkLogin(req, res, function () {
                var page = req.body.page || '';
                UserInfo.save({
                    username: req.session.passport.user,
                    platPages: page.split(',')
                }, function (o) {
                    res.json(o);
                });
            });
        },
        get: function (req, res, next) {
            checkLogin(req, res, function () {
                UserInfo.get(req.session.passport.user, function (o) {
                    res.json(o);
                });
            });
        },
        update: function (req, res, next) {
            checkLogin(req, res, function () {
                var page = req.body.page || '';
                UserInfo.update(req.session.passport.user, {platPages: page.split(',')}, function (o) {
                    res.json(o);
                });
            });
        }
    }
};