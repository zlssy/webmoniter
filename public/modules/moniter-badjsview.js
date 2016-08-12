define('moniter-badjsview', ['jquery', 'util', 'simpleTable', 'moment', 'pager', 'bootstrap-datetimepicker'], function ($, util, simpleTable, moment, pager, datepicker) {
    var searchApi = globalConfig.apiRoot + 'badjs/list',
        mainDom = $('#main'),
        startDom = $('input[name=start]'),
        endDom = $('input[name=end]'),
        pagerDom = $('.pager-wrapper'),
        searchBtn = $('#search'),
        clearBtn = $('#clear'),
        queryCondition = {
            pid: util.url.getUrlParam('pid'),
            page: 1,
            rc: 1,
            pagesize: 20
        },
        pager1;

    function query() {
        $.ajax({
            url: getUrl(),
            success: function (json) {
                if (0 === json.code) {
                    if (json.data && json.data.length) {
                        var t = simpleTable({
                            cols: [
                                {name: '错误信息', id: 'message', width: 260, css: 'error'},
                                {name: '错误网址', id: 'url', width: 200, css: 'correct'},
                                {
                                    name: '时间', id: 'createTime', width: 90, format: function (v, idef, row) {
                                    return v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : v;
                                }
                                },
                                {name: '行', id: 'line', width: 40, css: 'text-center'},
                                {name: '列', id: 'col', width: 40, css: 'text-center'},
                                {name: '平台', id: 'platform', width: 60, css: 'text-center'},
                                {name: '浏览器版本', id: 'version'}
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
        startDom.datetimepicker({
            autoclose: true
        });
        endDom.datetimepicker({
            autoclose: true
        });
        searchBtn.on('click', function () {
            var sd = startDom.val(),
                ed = endDom.val();
            sd ? queryCondition.startdate = new Date(moment(sd)).getTime() : delete queryCondition.startdate;
            ed ? queryCondition.enddate = new Date(moment(ed)).getTime() : delete queryCondition.enddate;
            queryCondition.rc = 1;
            queryCondition.page = 1;
            query();
        });
        clearBtn.on('click', function () {
            startDom.val(''); endDom.val('');
        });
    }

    function getUrl() {
        return searchApi + '?' + util.object2param(queryCondition);
    }

    query();
    bindEvents();
    $('.breadcrumb > span').html(decodeURIComponent(util.url.getUrlParam('name')));
});