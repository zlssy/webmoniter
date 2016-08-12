define('moniter-user', ['jquery', 'util', 'simpleTable', 'pager', 'moment', 'dialog'], function ($, util, table, pager, moment, dialog) {
    var listApi = globalConfig.apiRoot + 'account/search',
        activeApi = globalConfig.apiRoot + 'account/update',
        pwdApi = globalConfig.apiRoot + 'account/resetpwd',
        mainDom = $('#main'),
        resetPwdDom = $('#resetTpl').html();

    // 查询用户信息
    function query() {
        $.ajax({
            url: listApi,
            success: function (json) {
                if (json.code === 0) {
                    if (json.data && json.data.length) {
                        var t = table({
                            cols: [
                                {name: '账号', id: 'username', width: 200, css: 'text-center'},
                                {
                                    name: '状态', id: 'active', width: 40, css: 'text-center', format: function (v) {
                                    return v ? '<span class="correct">✔</span>' : '<span class="error">✘</span>';
                                }
                                },
                                {
                                    name: '创建时间', id: 'createTime', css: 'text-center', format: function (v) {
                                    return moment(v).format('YYYY-MM-DD HH:mm:ss');
                                }
                                },
                                {
                                    name: '最后登录时间',
                                    id: 'lastLoginTime',
                                    css: 'text-center correct',
                                    format: function (v) {
                                        return moment(v).format('YYYY-MM-DD HH:mm:ss');
                                    }
                                },
                                {
                                    name: '操作', id: '_id', css: 'text-center', format: function (v, idef, row) {
                                    var action = [];
                                    action.push('<a href="javascript:;" data-id="' + v + '" data-username="' + row.username + '" class="reset">重置密码</a>');
                                    if (row.username != 'admin') {
                                        action.push('<a href="javascript:;" data-id="' + v + '" class="' + (row.active ? 'stop' : 'active') + '">' + (row.active ? '停用' : '激活') + '</a>');
                                        action.push('<a href="javascript:;" data-id="' + v + '" class="del">删除</a>');
                                    }
                                    return action.join(' | ');
                                }
                                }
                            ],
                            data: json.data
                        });
                        mainDom.html(t.get());
                    }
                    else {
                        mainDom.html('<div class="nothing">暂无任何用户信息。</div>');
                    }
                }
                else {
                    mainDom.html('<div class="nothing">获取数据失败。</div>');
                }
            },
            error: function (json) {
                mainDom.html('<div class="nothing">获取数据失败。</div>');
            }
        });
    }

    // 激活或停用用户
    function activeOrStop(id, active) {
        $.ajax({
            url: activeApi,
            method: 'post',
            data: {
                id: id,
                active: active
            },
            success: function (json) {
                if (json.code === 0) {
                    query();
                    info('更新成功');
                }
                else {
                    info('更新失败');
                }
            },
            error: function (json) {
                info(json.msg);
            }
        })
    }

    // 重置用户密码
    function resetPwd(user, pwd) {
        if (user) {
            $.ajax({
                url: pwdApi,
                method: 'post',
                data: {
                    id: user,
                    pwd: pwd
                },
                success: function (json) {
                    if (json.code === 0) {
                        info('重置密码成功');
                    }
                    else {
                        info('重置密码失败');
                    }
                },
                error: function (json) {
                    info(json.msg);
                }
            });
        }
        else {
            info('用户信息获取失败。');
        }
    }

    // 事件绑定
    function bindEvents() {
        $(document.body).on('click', function (e) {
            var $el = $(e.target || e.srcElement),
                tagname = $el.get(0).tagName.toLowerCase(),
                cls = $el.attr('class'), dw;

            if ('a' === tagname && cls.indexOf('reset') > -1) {
                // 重置密码
                var id = $el.data('id'), username = $el.data('username');
                dw = dialog({
                    title: '重置密码',
                    content: util.formatJson(resetPwdDom, {username: username}),
                    okValue: '保存',
                    ok: function () {
                        var pwdom = $('input[name=pwd]'),
                            repwdom = $('input[name=repwd]'),
                            pwd = pwdom.val(),
                            repwd = repwdom.val();

                        if (pwd !== repwd) {
                            pwdom.addClass('error');
                            repwdom.addClass('error');
                            return false;
                        }
                        else {
                            pwdom.removeClass('error');
                            repwdom.removeClass('error');
                            resetPwd(id, pwd);
                        }
                    },
                    cancelValue: '取消',
                    cancel: function () {

                    }
                });
                dw.showModal();
                $('.ui-dialog input').on('focus', function () {
                    $(this).removeClass('error');
                });
            }
            if ('a' === tagname && cls.indexOf('stop') > -1 || 'a' === tagname && cls.indexOf('active') > -1) {
                // 停用用户 or 激活用户
                var active = cls.indexOf('stop') > -1 ? 0 : 1, key = $el.data('id');
                console.log(active, key);
                key && activeOrStop(key, active);
            }
            if ('a' === tagname && cls.indexOf('del') > -1) {
                // 删除用户
                dw = dialog({
                    title: '温馨提示',
                    content: '是否确实要删除该用户？',
                    okValue: '确定',
                    ok: function () {
                        var uid = $el.data('id');
                        console.log(uid);
                    },
                    cancelValue: '取消',
                    cancel: function () {

                    }
                });
                dw.showModal();
            }
        });
    }

    function info(msg, timer) {
        var t = timer || 1000, d = dialog({
            content: msg
        });
        d.show();
        setTimeout(function () {
            d.close();
        }, timer);
    }

    query();
    bindEvents();
});