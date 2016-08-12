define('moniter-project', ['jquery', 'util', 'simpleTable', 'dialog', 'moment', 'moniter-userchoose'], function ($, util, ST, dialog, moment, userchoose) {
    var listApi = globalConfig.apiRoot + 'project/list',
        saveApi = globalConfig.apiRoot + 'project/create',
        updateApi = globalConfig.apiRoot+'project/update',
        createTpl = $('#createTpl').html(),
        mainDom = $('#main'),
        map = {}, userPanel,
        createPanel;

    function getList() {
        $.ajax({
            url: listApi,
            success: function (json) {
                if (0 === json.code) {
                    if (json.data && json.data.length) {
                        var t = ST({
                            cols: [
                                {name: '项目名称', id: 'name', width: 100},
                                {name: '创建者', id: 'owner', width: 60},
                                {
                                    name: '所有者', id: 'belong', format: function (v) {
                                    return v.join(',');
                                }
                                },
                                {
                                    name: '操作', id: '_id', width: 180, format: function (id, idname, row) {
                                    var action = [], name = row.name;
                                    map[id] = row;
                                    action.push('<a href="/badjs/view?pid=' + id + '&name=' + name + '">BadJs</a>');
                                    action.push('<a href="/view/view?pid=' + id + '&name=' + name + '">视图</a>');
                                    if (globalConfig.user === row.owner) {
                                        action.push('<a href="javascript:void(0);" data-id="' + id + '" class="share">共享</a>');
                                        action.push('<a href="/point/manage?pid=' + id + '&name=' + name + '">监控点</a>');
                                    }
                                    return action.join(' | ');
                                }
                                }
                            ]
                        });
                        t.setData(json.data);
                        mainDom.html(t.get());
                    }
                    else {
                        mainDom.html('<div class="nothing">暂无项目</div>');
                    }
                }
            },
            error: function (json) {
                info(json.msg);
            }
        })
    }

    function bindEvents() {
        $(document.body).on('click', function (e) {
            var $el = $(e.target || e.srcElement),
                tag = $el.get(0).tagName.toLowerCase(),
                id = $el.attr('id'),
                cls = $el.attr('class');

            // 保存项目
            if ('button' === tag && 'p-save' === id) {
                var projectName = $('input[name=name]').val();
                if (projectName) {
                    $.ajax({
                        url: saveApi,
                        method: 'post',
                        data: {name: projectName},
                        success: function (json) {
                            createPanel && createPanel.close().remove();
                            getList();
                        },
                        error: function (json) {
                            info(json.msg);
                            createPanel && createPanel.close().remove();
                        }
                    })
                }
            }
            // 创建项目
            if ('button' === tag && 'p-create' === id) {
                createPanel = dialog({
                    title: '创建项目',
                    content: createTpl
                });
                createPanel.show();
            }

            if (cls && cls.indexOf('share') > -1) {
                var key = $el.data('id');
                userPanel && (userPanel = null);
                userPanel = userchoose({
                    users: map[key] && map[key].belong || [],
                    callback: function (belong) {
                        $.ajax({
                            url: updateApi,
                            method: 'post',
                            data: {
                                id: key,
                                belong: belong.join(',')
                            },
                            success: function (json) {
                                if(json.code === 0){
                                    getList();
                                }
                                else{
                                    info('更新失败');
                                }
                            },
                            error: function (json) {
                                info('更新失败');
                            }
                        });
                    }
                });
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

    getList();
    bindEvents();
});