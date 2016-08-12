define('moniter-index', ['jquery', 'util', 'moniter-linechart'], function ($, util, chart) {
    var main = $('#main'),
        userApi = globalConfig.apiRoot + 'userinfo/get',
        listApi = globalConfig.apiRoot + 'page/map';

    var getUserInfo = function () {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: userApi,
                success: function (json) {
                    if (json.code === 0 && json.data && json.data.length) {
                        resolve(json.data);
                    }
                    else {
                        reject('');
                    }
                },
                error: function (json) {
                    reject(json.msg);
                }
            })
        });
    };

    var getPageInfo = function (pages) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: listApi,
                method: 'post',
                data: {pages: pages.join(',')},
                success: function (json) {
                    if (json.code === 0) {
                        resolve({pages: pages, map: json.data});
                    }
                    else {
                        reject('');
                    }
                },
                error: function (json) {
                    reject(json.msg);
                }
            });
        });
    };

    getUserInfo().then(function (data) {
        var data = data[0];
        if (data && data.platPages && data.platPages.length) {
            return getPageInfo(data.platPages);
        }
        else {
            return new Promise(function (resolve, reject) {
                reject('');
            });
        }
    }).then(function (data) {
        var pages = data.pages, pageinfo = data.map;
        if (pages.length) {
            pages.forEach(function (v) {
                main.append('<div id="c' + v + '"></div>');
                chart({
                    pid: v,
                    container: $('#c' + v),
                    title: getName(v, pageinfo)
                });
            });
        }
        else {
            main.html('<div class="nothing">您的工作台很干净。</div>');
        }
    }).catch(function (e) {
        main.html('<div class="nothing">' + e + '</div>');
    });

    function getName(pageid, map) {
        if (map && pageid) {
            var pagename = map[pageid].name;
            var projectname = map.project[map[pageid].pid];

            return projectname + pagename+'业务监控';
        }
        return '业务监控';
    }

});