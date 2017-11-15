define('moniter-reg', ['jquery', 'dialog'], function ($, dialog) {
    var nameDom = $('input[name=name]'),
        usernameDom = $('input[name=username]'),
        passwordDom = $('input[name=password]'),
        repwdDom = $('input[name=repassword]');

    $('.btn.btn-primary').on('click', function () {
        var name = nameDom.val(),
            username = usernameDom.val(),
            pwd = passwordDom.val(),
            repwd = repwdDom.val();

        if (username && pwd && pwd === repwd) {
            $.ajax({
                url: '/reg',
                method: 'post',
                data: {username: username, password: pwd, name: name},
                success: function (json) {
                    if (json.code === 0) {
                        location.href = '/login';
                    }
                    else {
                        dialog({
                            title: '温馨提示',
                            content: '注册失败！'
                        }).show();
                    }
                },
                error: function (json) {
                    dialog({
                        title: '温馨提示',
                        content: '注册失败！'
                    }).show();
                }
            });
        }
    });

    $('.btn.reset').on('click', function () {
        usernameDom.val('');
        passwordDom.val('');
        repwdDom.val('');
    });

    usernameDom.on('blur', function () {
        checkUsername($(this).val(), function (ret, exist) {
            if (ret) {
                if (exist) {
                    usernameDom.removeClass('correct').addClass('error');
                }
                else {
                    usernameDom.removeClass('error').addClass('correct');
                }
            }
            else {
                usernameDom.removeClass('correct').addClass('error');
            }
        });
    });

    function checkUsername(username, cb) {
        $.ajax({
            url: '/checkusername',
            method: 'post',
            data: {username: username},
            success: function (json) {
                if (0 === json.code) {
                    if (json.data) {
                        cb(true, true);
                    }
                    else {
                        cb(true, false);
                    }
                }
                else {
                    cb(false, json.msg);
                }
            },
            error: function (json) {
                cb(false, json.msg);
            }
        });
    }

});