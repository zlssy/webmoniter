define('moniter-view', ['jquery', 'util', 'dialog', 'moment', 'pager', 'simpleTable', 'moniter-linechart', 'bootstrap-datetimepicker'], function ($, util, dialog, moment, pager, simpleTable, chart) {
    var pid = util.url.getUrlParam('pid'),
        title = decodeURIComponent(util.url.getUrlParam('name')),
        listApi = globalConfig.apiRoot + 'record/list',
        pointApi = globalConfig.apiRoot + 'point/list?pid=',
        pageApi = globalConfig.apiRoot + 'page/list?pid=' + pid,
        userApi = globalConfig.apiRoot + 'userinfo/get',
        updateUserApi = globalConfig.apiRoot + 'userinfo/update',
        mainDom = $('#main'),
        chartsDom = $('#charts'),
        pages = $('#pages'),
        startDom = $('input[name=start]'),
        endDom = $('input[name=end]'),
        pagerDom = $('.pager-wrapper'),
        useDom = $('#use'),
        searchBtn = $('#search'),
        clearBtn = $('#clear'),
        pointMap = {},
        pageMap = {},
        chartsMap = {},
        userInfo,
        sequenceTimer = 2000,
        actionLock = {},
        queryCondition = {
            pid: '',
            page: 1,
            rc: 1,
            pagesize: 20
        },
        pager1;

    var getPage = function () {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: pageApi,
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
            });
        });
    };

    function getPoint() {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: pointApi + queryCondition.pid,
                success: function (json) {
                    if (json.code === 0 && json.data && json.data.length) {
                        var data = json.data;
                        for (var i = 0; i < data.length; i++) {
                            d = data[i];
                            pointMap[d.tag] = d.name;
                        }
                        resolve(data);
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

    }

    function query() {
        $.ajax({
            url: getUrl(),
            success: function (json) {
                if (0 === json.code) {
                    if (json.data && json.data.length) {
                        var t = simpleTable({
                            cols: [
                                {
                                    name: '监测点', id: 'tag', width: 260, css: 'correct', format: function (v) {
                                    return pointMap[v] || '';
                                }
                                },
                                {name: '值', id: 'value', width: 200, css: 'error'},
                                {
                                    name: '时间', id: 'createTime', width: 90, format: function (v, idef, row) {
                                    return v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : v;
                                }
                                }
                            ]
                        });
                        t.setData(json.data);
                        mainDom.html(t.get());
                        if (queryCondition.rc === 1) {
                            pager1 && (pager1 = null);
                            pager1 = new pager({
                                total: json.total || 0,
                                pageno: queryCondition.page,
                                pagesize: queryCondition.pagesize,
                                useAjax: true,
                                group: 3,
                                view: 2,
                                onpage: function (p) {
                                    queryCondition.page = p.pageno;
                                    query();
                                }
                            });
                        }
                        queryCondition.rc = 0;
                        var pagerCode = pager1 && pager1.get() || '';
                        pagerCode ? pagerDom.show().html(pagerCode) : pagerDom.hide();
                    }
                    else {
                        mainDom.html('<div class="nothing">无任何相关数据。</div>');
                        pagerDom.html('').hide();
                    }
                }
            },
            error: function (json) {
                mainDom.html('<div class="nothing">请求数据失败。</div>');
                pagerDom.html('').hide();
            }
        });
    }

    function bindEvents() {
        // 开始，结束日期控件初始化
        startDom.datetimepicker({
            autoclose: true
        });
        endDom.datetimepicker({
            autoclose: true
        });
        // 检索按钮绑定事件
        searchBtn.on('click', function () {
            var sd = startDom.val(),
                ed = endDom.val();
            sd ? queryCondition.startdate = new Date(moment(sd)).getTime() : delete queryCondition.startdate;
            ed ? queryCondition.enddate = new Date(moment(ed)).getTime() : delete queryCondition.enddate;
            queryCondition.rc = 1;
            queryCondition.page = 1;
            query();
        });
        // 清除按钮绑定事件
        clearBtn.on('click', function () {
            startDom.val('');
            endDom.val('');
        });
        // 切换页面
        pages.on('change', function () {
            var pid = $(this).val();
            queryCondition.pid = pid;
            syncPages();
            getPoint().then(query).catch(function (e) {
                mainDom.html('<div class="nothing">' + (e ? e : '请求数据失败。') + '</div>');
                pagerDom.html('').hide();
            });
            showCharts();
        });
        useDom.on('click', function () {
            if (!actionLock.use) {
                actionLock.use = true;
                setTimeout(function () {
                    actionLock.use = false;
                }, sequenceTimer);
                var page = pages.val(), act = useDom.prop('checked'), original = userInfo.platPages.join(',');
                if (act) {
                    userInfo.platPages.push(page);
                }
                else {
                    if (userInfo.platPages.indexOf(page) > -1) {
                        userInfo.platPages.splice(userInfo.platPages.indexOf(page), 1);
                    }
                }
                $.ajax({
                    url: updateUserApi,
                    method: 'post',
                    data: {page: userInfo.platPages.join(',')},
                    success: function (json) {
                        if (json.code === 0) {
                            info('推送成功');
                        }
                        else {
                            info('推送失败');
                            userInfo.platPages = original.split(',');
                        }
                    },
                    error: function (json) {
                        info(json.msg);
                        userInfo.platPages = original.split(',');
                    }
                })
            }
        });
    }

    function getUrl() {
        return listApi + '?' + util.object2param(queryCondition);
    }

    function setPageSelect(data) {
        options = [];
        data.forEach(function (v) {
            pageMap[v._id] = v.name;
            options.push('<option value="' + v._id + '">' + v.name + '</option>');
        });
        pages.append($(options.join('')));
    }

    function showCharts() {
        for (var m in chartsMap) {
            if (chartsMap.hasOwnProperty(m)) {
                chartsMap[m].hide();
            }
        }

        if (queryCondition.pid) {
            var c = chartsMap[queryCondition.pid];
            if (c) {
                c.show();
            }
            else {
                chartsDom.append('<div id="c' + queryCondition.pid + '"></div>');
                chartsMap[queryCondition.pid] = chart({
                    container: $('#c' + queryCondition.pid),
                    pid: queryCondition.pid,
                    title: pageMap[queryCondition.pid] + '业务监控'
                });
            }
        }
    }

    function getUserInfo() {
        $.ajax({
            url: userApi,
            success: function (json) {
                if (json.code === 0) {
                    userInfo = json.data[0];
                    syncPages();
                }
            },
            error: function (json) {

            }
        });
    }

    function syncPages() {
        if (userInfo) {
            var page = pages.val();
            if (userInfo.platPages.indexOf(page) > -1) {
                useDom.prop('checked', true);
            }
            else {
                useDom.prop('checked', false);
            }
        }
    }

    function info(msg, timer) {
        var d = dialog({
            content: msg
        }), t = timer || 1000;
        d.show();
        setTimeout(function () {
            d.close();
        }, t);
    }

    getPage().then(function (data) {
        queryCondition.pid = data[0]._id;
        setPageSelect(data);
        showCharts();
        syncPages();
        return getPoint();
    }).then(query).catch(function (e) {
        mainDom.html('<div class="nothing">' + (e ? e : '请求数据失败。') + '</div>');
        pagerDom.html('').hide();
    });
    getUserInfo();
    bindEvents();
    $('.breadcrumb > span').html(title);
});