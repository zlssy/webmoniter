var express = require('express');
var router = express.Router();
var implApi = require('../api/impl');

var reg = /\/([^/]+)\/([^/]+)\/?.*?/;

router.all(reg, function (req, res, next) {
    var module = req.params[0],
        action = req.params[1];

    try{
        implApi[module][action](req, res, next);
    }
    catch (e){
        next();
    }
});

module.exports = router;