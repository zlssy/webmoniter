define('moniter-linechart', ['jquery', 'util', 'moment', 'echarts'], function ($, util, moment, echarts) {
    var pointApi = globalConfig.apiRoot + 'point/list?pid=',
        recordApi = globalConfig.apiRoot + 'record/stat?',
        guid = 1;

    function getWidth() {
        return $('body').width() - 260;
    }

    function getGUID() {
        return 'm' + (guid++);
    }

    function LineChart(opt) {
        this.opt = $.extend({}, opt);
        var container = this.opt.container || 'body';
        this.id = getGUID();
        this.pid = this.opt.pid || '';
        this.container = typeof container === 'string' ? $(container) : container;
        this.title = opt.title || '业务监控';
        this.pointMap = {};
        this.linechart = null;
        this.startDate = moment().add(-30, 'days');
        this.endDate = moment();
        this.date = [];
        this.data = [];
        this.cond = {
            pid: this.pid,
            startDate: new Date(this.startDate).getTime(),
            enddate: new Date(this.endDate).getTime()
        };
        this.init.apply(this);
    }

    LineChart.prototype = {
        init: function () {
            this.container.html('<div id="' + this.id + '" style="width:' + this.getWidth() + 'px; height:' + this.getHeight() + 'px;"></div>');
            this.linechart = echarts.init($('#' + this.id).get(0));

            for (var i = 0; i < 30; i++) {
                this.date.push(moment().add(i - 29, 'days').format('YYYY-MM-DD'));
            }

            this.linechart.showLoading();
            this.initData();
        },
        initData: function () {
            var self = this;
            this.getSeries().then(function(){
                return self.getLatestMonthData();
            }).then(function (data) {
                self.linechart.hideLoading();
                self.drawMultiLine(data);
            }).catch(function (msg) {
                self.linechart.hideLoading();
                console.log(msg);
            });
        },
        getSeries: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: pointApi + self.pid,
                    success: function (json) {
                        if (json.code === 0 && json.data && json.data.length) {
                            for (var i = 0; i < json.data.length; i++) {
                                self.pointMap[json.data[i].tag] = {
                                    name: json.data[i].name,
                                    color: '',
                                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                };
                            }
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
        },
        getLatestMonthData: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: recordApi + util.object2param(self.cond),
                    success: function (json) {
                        if (json.code === 0) {
                            resolve(json.data);
                        }
                    },
                    error: function (json) {
                        reject(json.msg);
                    }
                });
            });
        },
        drawMultiLine: function (data) {
            var legend = [], series = [], p;
            this.getGroup(data);
            for (var k in this.pointMap) {
                if (this.pointMap.hasOwnProperty(k)) {
                    p = this.pointMap[k];
                    legend.push(p.name);
                    series.push({
                        name: p.name,
                        type: 'line',
                        data: p.data,
                        markPoint: {
                            data: [
                                {type: 'max', name: '最大值'},
                                {type: 'min', name: '最小值'}
                            ]
                        }
                    });
                }
            }
            var opt1 = {
                tooltip: {
                    trigger: 'axis',
                    position: function (pt) {
                        return [pt[0], '10%'];
                    }
                },
                title: {
                    left: 'center',
                    text: this.title
                },
                legend: {
                    top: 'bottom',
                    data: legend
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.date
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%']
                },
                series: series
            };
            this.linechart.setOption(opt1);
        },
        getGroup: function (data) {
            var d, t, v, n = moment().dayOfYear();
            for (var i = 0, l = data.length; i < l; i++) {
                d = data[i];
                t = d.tag;
                v = 29 - (n - moment(d.createTime).dayOfYear());
                this.pointMap[t].data[v >= 0 ? v : 0]++;
            }
            return this.pointMap;
        },
        hide: function () {
            this.container.hide();
        },
        show: function () {
            this.container.show();
        },
        getWidth: function () {
            return this.opt.width || getWidth();
        },
        getHeight: function () {
            return this.opt.height || 500;
        }
    };

    return function (opt) {
        return new LineChart(opt);
    }
});