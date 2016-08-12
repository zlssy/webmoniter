define('moniter-userchoose', ['jquery', 'dialog', 'util'], function ($, dialog, util) {
    var userApi = globalConfig.apiRoot + 'account/search',
        guid = 10,
        templates = [],
        itemTpl = '<li class="user">{name}</li>';

    templates.push('<div id="{id}" class="moniter-user-choose">');
    templates.push('<div class="user-choose-toolbar"></div>');
    templates.push('<div class="user-choose-wrapper">');

    templates.push('<div class="user-choose-left">');
    templates.push('<h4>未选用户</h4><ul id="{id}-left"><li>Loading</li></ul>');
    templates.push('</div>');
    templates.push('<div class="user-choose-right">');
    templates.push('<h4>已选用户</h4><ul id="{id}-right"></ul>');
    templates.push('</div>');
    templates.push('<div id="{id}-control" class="user-choose-control"><span class="move-2-right">&gt;&gt;</span><br /><span class="move-2-left">&lt;&lt;</span></div>');

    templates.push('</div>');
    templates.push('</div>');

    function UserChoose(opt) {
        var self = this;
        this.opt = $.extend({}, opt || {});
        this.choose = $.extend(true, [], Object.prototype.toString.call(this.choose) === '[object String]' ? [this.opt.users] : this.opt.users || []);
        this.id = getGUID();
        this.width = this.opt.width || 500;
        this.height = this.opt.height || 500;
        this.allUsers = [];
        this.nonchoose = [];
        this.init.apply(this);
        this.compent = dialog({
            title: '用户选择',
            content: util.format(templates.join(''), {id: this.id}),
            okValue: '确定',
            ok: function () {
                typeof self.opt.callback === 'function' && self.opt.callback(self.choose, self);
            },
            cancelValue: '取消',
            cancel: function () {
                typeof self.opt.cancelCallback === 'function' && self.opt.cancelCallback();
            }
        });
        this.show();
        this.UI = $('#' + this.id);
        this.resetPosition();
        this.bindEvents();
    }

    UserChoose.prototype = {
        init: function () {
            var self = this;
            this.getAllUser(function () {
                var choose = self.choose;
                self.allUsers.forEach(function (v) {
                    if (v.active && choose.indexOf(v.username) < 0) {
                        self.nonchoose.push(v.username);
                    }
                });
                self.updateChoose();
            });
        },
        getAllUser: function (cb) {
            var self = this;
            $.ajax({
                url: userApi,
                success: function (json) {
                    if (json.code === 0) {
                        self.allUsers = json.data;
                        typeof cb === 'function' && cb(self.allUsers, self);
                    }
                },
                error: function (json) {

                }
            });
        },
        updateChoose: function () {
            var list = [];
            for (var i = 0, l = this.nonchoose.length; i < l; i++) {
                list.push(util.format(itemTpl, {name: this.nonchoose[i]}));
            }
            $('#' + this.id + '-left').html(list.join(''));
            list = [];
            for (var i = 0, l = this.choose.length; i < l; i++) {
                list.push(util.format(itemTpl, {name: this.choose[i]}));
            }
            $('#' + this.id + '-right').html(list.join(''));
        },
        resetPosition: function () {
            var dwidth = $('html').width(),
                dheight = $('html').height(),
                top = 0, left = 0;

            if (dwidth > this.width) {
                left = (dwidth - this.width) / 2;
            }
            if (dheight > this.height) {
                top = (dheight - this.height) / 2;
            }
            if (this.UI) {
                this.UI.css({
                    width: this.width + 'px',
                    height: this.height + 'px',
                    top: top,
                    left: left
                });
                this.UI.find('#' + this.id + '-left, #' + this.id + '-right').css({
                    height: (this.height - 52) + 'px'
                });
                this.UI.find('#' + this.id + '-control').css({
                    'line-height': '48px',
                    'padding-top': (this.height / 2 - 24) + 'px'
                });
            }
        },
        bindEvents: function () {
            var self = this;
            this.UI && this.UI.on('click', function (e) {
                var $el = $(e.target || e.srcElement),
                    tagname = $el.get(0).tagName.toLowerCase(),
                    cls = $el.attr('class');

                if (cls && cls.indexOf('move-2-right') > -1) {
                    // move choose to right
                    $('#' + this.id + '-left .user.choose').each(function (i, v) {
                        var user = util.trim($(v).html()), index = self.nonchoose.indexOf(user);
                        if (index > -1) {
                            self.nonchoose.splice(index, 1);
                        }
                        self.choose.push(user);
                    });
                    self.updateChoose();
                }
                if (cls && cls.indexOf('move-2-left') > -1) {
                    // move choose to left
                    $('#' + this.id + '-right .user.choose').each(function (i, v) {
                        var user = util.trim($(v).html()), index = self.choose.indexOf(user);
                        if (index > -1) {
                            self.choose.splice(index, 1);
                        }
                        self.nonchoose.push(user);
                    });
                    self.updateChoose();
                }
                if ('li' === tagname && cls && cls.indexOf('user') > -1) {
                    $el.toggleClass('choose');
                }
            }).on('dblclick', function (e) {
                var $el = $(e.target || e.srcElement),
                    tagname = $el.get(0).tagName.toLowerCase(),
                    cls = $el.attr('class');
                if ('li' === tagname && cls && cls.indexOf('user') > -1) {
                    // move user to other side
                    var user = util.trim($el.html());
                    if (self.nonchoose.indexOf(user) > -1) {
                        self.nonchoose.splice(self.nonchoose.indexOf(user), 1);
                        self.choose.push(user);
                    }
                    else if (self.choose.indexOf(user) > -1) {
                        self.choose.splice(self.choose.indexOf(user), 1);
                        self.nonchoose.push(user);
                    }
                    self.updateChoose();
                }
            });
        },
        show: function () {
            this.compent && this.compent.show();
        },
        hide: function () {
            this.compent && this.compent.hide();
        }
    };

    function getGUID() {
        return '__uc__' + (guid++);
    }

    return function (opt) {
        return new UserChoose(opt);
    }
});