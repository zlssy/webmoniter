var express = require('express');
var router = express.Router();
var _ = require('underscore');
var title = '新环境监控系统1.0';

/* GET home page. */
router.get('/project', function (req, res, next) {
    render('project', req, res, next);
});

router.get('/badjs/view', function (req, res, next) {
    render('badjsview', req, res, next,{
        module: 'project'
    });
});

router.get('/point/manage', function (req, res, next) {
    render('point', req, res, next, {
        module: 'project'
    });
});

router.get('/view/view', function (req, res, next) {
    render('view', req, res, next, {
        module: 'project'
    });
});

router.get('/user', function (req, res, next) {
    render('user', req, res, next);
});

router.get('/test', function (req, res, next) {
    render('test', req, res, next, {
        module: 'test',
        action: 'ab'
    });
});

router.get('/', function (req, res, next) {
    render('index', req, res, next);
});

function render(view) {
    var req = arguments[1], res = arguments[2], ext = arguments[4] || {};
    res && res.render(view, _.extend({
        title: title,
        module: view
    }, ext));
}

module.exports = router;
