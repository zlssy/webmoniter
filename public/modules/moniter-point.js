define('moniter-point', ['jquery', 'util', 'dialog', 'simpleTable'], function ($, util, dialog, simpleTable) {
    var pid = util.url.getUrlParam('pid'),
        projectName = decodeURIComponent(util.url.getUrlParam('name')),
        projectNameDom = $('#project-name'),
        pointDom = $('#point-container'),
        pageDom = $('#page-container'),
        pagelistApi = globalConfig.apiRoot + 'page/list?pid=' + pid,
        pagesaveApi = globalConfig.apiRoot + 'page/save',
        listApi = globalConfig.apiRoot + 'point/list',
        saveApi = globalConfig.apiRoot + 'point/create',
        delApi = globalConfig.apiRoot + 'point/del',
        createTpl = $('#createTpl').html(),
        maxTag = 1,
        pageInfo, curPageInfo,
        createPanel,
        pagePanel;

    var getPage = function () {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: pagelistApi,
                success: function (json) {
                    if (json.code === 0) {
                        resolve(json.data);
                    }
                    else {
                        reject(json.msg);
                    }
                },
                error: function (json) {
                    reject(json.msg);
                }
            });
        });
    };

    function query() {
        projectNameDom.html(projectName + '&nbsp;&gt;&nbsp;【' + curPageInfo.name + '】');
        $.ajax({
            url: listApi + '?pid=' + curPageInfo._id,
            success: function (json) {
                if (0 === json.code) {
                    if (json.data && json.data.length) {
                        var t = simpleTable({
                            cols: [
                                {name: "名称", id: 'name', width: 200},
                                {
                                    name: "类型", id: 'type', format: function (v) {
                                    return ['<span style="color:red;">按量统计</span>', '<span style="color:green;">按值统计</span>'][v - 0] || '&nbsp;';
                                }
                                },
                                {name: "标记", id: 'tag', width: 60, css: 'text-center'},
                                {
                                    name: "操作", id: '_id', width: 120, css: 'text-center',
                                    format: function (v, idef, row) {
                                        var action = [];
                                        action.push('<a href="javascript:;" data-id="' + v + '" class="del">删除</a>');
                                        // action.push('<a href="javascript:;" data-id="' + v + '">上移</a>');
                                        // action.push('<a href="javascript:;" data-id="' + v + '">下移</a>');
                                        return action.join(' | ');
                                    }
                                }
                            ]
                        });
                        t.setData(json.data);
                        pointDom.html(t.get());
                        json.data.forEach(function (v) {
                            maxTag = Math.max(maxTag, v.tag - 0);
                        });
                        maxTag++;
                    }
                    else {
                        pointDom.html('<div class="nothing">还没有任何监控点。</div>');
                    }
                }
                else if (-1 === json.code) {
                    location.href = '/login';
                }
                else {
                    pointDom.html('<div class="nothing">获取数据失败。</div>');
                }
            },
            error: function (json) {
                pointDom.html('<div class="nothing">获取数据失败。</div>');
            }
        });
    }

    function bindEvents() {
        $(document.body).on('click', function (e) {
            var $el = $(e.target || e.srcElement),
                tagname = $el.get(0).tagName.toLowerCase(),
                id = $el.attr('id'),
                cls = $el.attr('class');

            var name, desc, tag, type, index;
            if ('button' === tagname && 'p-create' === id) {
                createPanel = dialog({
                    title: '创建监控点',
                    content: util.formatJson(createTpl, {
                        pagename: curPageInfo.name,
                        maxTag: maxTag
                    })
                });
                createPanel.show();
            }
            if ('button' === tagname && 'page-create' === id) {
                pagePanel = dialog({
                    title: '创建监控页面',
                    content: $('#createPageTpl').html()
                });
                pagePanel.show();
            }
            if ('button' === tagname && 'p-save' === id) {
                name = $('input[name=name]').val();
                desc = $('input[name=desc]').val();
                tag = $('input[name=tag]').val();
                type = $('select[name=type]').val();

                if (curPageInfo._id && name && /\d+/.test(tag)) {
                    $.ajax({
                        url: saveApi,
                        method: 'post',
                        data: {
                            pid: curPageInfo._id,
                            name: name,
                            desc: desc,
                            type: type,
                            tag: tag
                        },
                        success: function (json) {
                            if (0 === json.code) {
                                query();
                                createPanel && createPanel.close().remove();
                            }
                            else if (-1 === json.code) {
                                location.href = '/login';
                            }
                        },
                        error: function (json) {
                            info(json.msg);
                            createPanel && createPanel.close().remove();
                        }
                    });
                }
            }
            if ('button' === tagname && 'page-save' === id) {
                name = $('input[name=pname]').val();
                desc = $('input[name=pdesc]').val();

                if (pid && name) {
                    $.ajax({
                        url: pagesaveApi,
                        method: 'post',
                        data: {
                            pid: pid,
                            name: name,
                            desc: desc
                        },
                        success: function (json) {
                            if (0 === json.code) {
                                initPage();
                                pagePanel && pagePanel.close().remove();
                            }
                            else if (-1 === json.code) {
                                location.href = '/login';
                            }
                        },
                        error: function (json) {
                            info(json.msg);
                            pagePanel && pagePanel.close().remove();
                        }
                    });
                }
            }
            if ('a' === tagname && 'del' === cls) {
                var d = dialog({
                    title: '温馨提示',
                    content: '您确实要删除该监控点？',
                    okValue: '确定',
                    ok: function () {
                        var id = $el.data('id');
                        if (id) {
                            $.ajax({
                                url: delApi,
                                method: 'post',
                                data: {id: id},
                                success: function (json) {
                                    if (0 === json.code) {
                                        query();
                                    }
                                    else if (-1 === json.code) {
                                        location.href = '/login';
                                    }
                                },
                                error: function (json) {
                                    info(json.msg);
                                }
                            })
                        }
                    },
                    cancelValue: '取消',
                    cancel: function () {
                        d.close();
                    }
                });
                d.showModal();
            }
            if ('td' === tagname && cls.indexOf('page-name') > -1) {
                index = $el.parents('table').find('td.page-name').index($el);
                curPageInfo = pageInfo[index] || {};
                maxTag = 1;
                query();
                $('tr.active').removeClass('active');
                $el.parents('tr').addClass('active');
            }
        });
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

    function initPage() {
        getPage().then(function (data) {
            if (data.length) {
                pageInfo = data;
                curPageInfo = pageInfo[0];
                var t = simpleTable({
                    cols: [
                        {name: '页面ID', id: '_id', width: 220, css: 'text-center'},
                        {name: '页面名称', id: 'name', css: 'text-center page-name'}
                    ],
                    data: data
                });
                pageDom.html(t.get());
                pageDom.find('tbody>tr:first').addClass('active');
                query();
            }
            else {
                pageDom.html('<div class="nothing">还没有任何页面。</div>');
                pointDom.html('<div class="nothing">还没有任何监控点。</div>');
            }
        }).catch(function (e) {
            console.log(e);
        });
    }

    initPage();
    bindEvents();
    projectNameDom.html(projectName);
});