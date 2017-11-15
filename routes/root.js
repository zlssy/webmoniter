var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var Account = require('../models/account');
var implApi = require('../api/impl');
var UserInfo = require('../models/userinfo');
var router = express.Router();
var config = require('../config.json');

global.config = config;
var connStr = "mongodb://" + config.mongodb.server + ":" + config.mongodb.port + "/" + config.mongodb.db;
var connOpt = {};
config.mongodb.user && (connOpt.user = config.mongodb.user);
config.mongodb.pwd && (connOpt.pass = config.mongodb.pwd);

mongoose.connect(connStr, connOpt);

router.get('/reg', function (req, res, next) {
    res.render('reg', {title: '新用户注册'});
});

router.post('/reg', function (req, res, next) {
    var username = req.body.username,
        password = req.body.password,
        name = req.body.name;
    Account.register(new Account({
        username: username,
        name: name,
        active: false
    }), password, function (err, account) {
        if (err) {
            return res.json({
                code: 1,
                msg: err.message
            });
        }
        // passport.authenticate('local')(req, res, function () {
        res.json({
            code: 0,
            data: account
        });
        // });
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {title: '登录', user: req.user});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlush: true
}));

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/checkusername', function (req, res, next) {
    var username = req.body.username;
    Account.findByUsername(username, function (err, data) {
        if (err) {
            return res.json({
                code: 1,
                msg: err.message
            });
        }
        res.json({
            code: 0,
            data: data
        });
    });
});

router.get('/bjs/*', function (req, res, next) {
    // req.session.passport = req.session.passport || {};
    // req.session.passport.user = 'sys';
    // next();
    implApi.badjs.record(req, res, next);
});

router.get('/report/*', function (req, res, next) {
    implApi.record.report(req, res, next);
});

router.all(/\/[^(login)|(reg)|(checkusername)]*/, function (req, res, next) {
    if (!(req.session && req.session.passport && req.session.passport.user && req.session.passport.user != '')) {
        return res.redirect('/login');
    }
    UserInfo.find({username: req.session.passport.user}, function (err, data) {
        if (err) {
            next(err);
        }
        else {
            if (!(data && data.length)) {
                var u = new UserInfo({username: req.session.passport.user});
                u.save(function (err, data) {
                    if (err) {
                        next(err);
                    }
                    else {
                        next();
                    }
                });
            }
            else {
                next();
            }
        }
    });
});

module.exports = router;