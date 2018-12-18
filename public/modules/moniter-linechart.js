define('moniter-linechart', ['jquery', 'util', 'moment', 'echarts', 'underscore'], function ($, util, moment, echarts, _) {
    var pointApi = globalConfig.apiRoot + 'point/list?pid=',
        recordApi = globalConfig.apiRoot + 'record/statbydate?',
        vRecordApi = globalConfig.apiRoot + 'record/stat?',
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
        this.vPointMap = {};
        this.linechart = null;
        this.vLinecharts = [];
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
            var self = this;
            this.container.html('');
            this.getSeries().then(function () {
                if (!isEmptyObject(self.pointMap)) {
                    self.container.append('<div id="' + self.id + '" style="width:' + self.getWidth() + 'px; height:' + self.getHeight() + 'px;"></div>');
                    self.linechart = echarts.init($('#' + self.id).get(0));
                    self.linechart.showLoading();
                    self.getLatestMonthData().then(function (data) {
                        self.linechart.hideLoading();
                        self.drawMultiLine(data);
                    }).catch(function (message) {
                        self.linechart.hideLoading();
                        self.container.find('#' + self.id).hide();
                    });
                }
                if (!isEmptyObject(self.vPointMap)) {
                    self.getValueRecord().then(function (data) {
                        self.drawMultiArea(data);
                    }).catch(function (message) {
                    });
                }
            }).catch(function (msg) {
                self.linechart && self.linechart.hideLoading();
            });
            this.bindEvents();
        },
        getSeries: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: pointApi + self.pid,
                    success: function (json) {
                        if (json.code === 0 && json.data && json.data.length) {
                            for (var i = 0; i < json.data.length; i++) {
                                if (json.data[i].type === 0) {
                                    self.pointMap[json.data[i].tag] = {
                                        name: json.data[i].name,
                                        color: ''
                                    };
                                }
                                else if (json.data[i].type === 1) {
                                    self.vPointMap[json.data[i].tag] = {
                                        name: json.data[i].name,
                                        color: ''
                                    }
                                }
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
                var tags = [];
                for (var k in self.vPointMap) {
                    if (self.vPointMap.hasOwnProperty((k))) {
                        tags.push(k);
                    }
                }
                tags = tags.length ? {tag: tags.join(',')} : {};
                $.ajax({
                    url: recordApi + util.object2param($.extend(true, {}, self.cond, tags)),
                    success: function (json) {
                        if (json.code === 0) {
                            resolve(json.data);
                        }
                        else {
                            reject('Get Record Failure');
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
            var d, t, v, n = moment().dayOfYear(), dates = {}, ymd, allDates = [];
            for (var i = data.length - 1; i >= 0; i--) {
                d = data[i];
                t = d.tag;
                v = moment(d.date).format("D") - 0;
                ymd = moment(d.date).format("YYYY-MM-DD");
                !dates[t] && (dates[t] = []);
                dates[t].push(ymd);
                !this.pointMap[t].data && (this.pointMap[t].data = []);
                !this.pointMap[t].map && (this.pointMap[t].map = {});
                this.pointMap[t].map[ymd] = d.count;
            }
            // 确定时间范围， 同时调整数据集合
            for (var k in dates) {
                allDates = allDates.concat(dates[k]);
            }
            allDates = _.uniq(allDates).sort();
            this.date = allDates;
            for (var k in this.pointMap) {
                if (this.pointMap.hasOwnProperty(k)) {
                    for (var i = 0; i < allDates.length; i++) {
                        this.pointMap[k].data && this.pointMap[k].data.push(this.pointMap[k].map[allDates[i]] || 0);
                    }
                }
            }
            return this.pointMap;
        },
        getValueRecord: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                var tags = [];
                for (var k in self.vPointMap) {
                    if (self.vPointMap.hasOwnProperty((k))) {
                        tags.push(k);
                    }
                }
                tags = tags.length ? {tag: tags.join(',')} : {};
                $.ajax({
                    url: vRecordApi + util.object2param($.extend(true, {}, self.cond, tags)),
                    success: function (json) {
                        if (json.code === 0) {
                            resolve(json.data);
                        }
                        else {
                            reject('Get Record Failure');
                        }
                    },
                    error: function (err) {
                        reject(err.message);
                    }
                });
            });
        },
        drawMultiArea: function (data) {
            var group_data = this.getValueGroup(data);
            for (var k in group_data) {
                if (group_data.hasOwnProperty(k) && this.vPointMap.hasOwnProperty(k)) {
                    this.drawSingleArea(k, group_data[k].date, group_data[k].data);
                }
            }
        },
        drawSingleArea: function (id, xd, yd) {
            this.container.append('<div id="' + this.id + '_' + id + '" style="width:' + this.getWidth() + 'px; height:' + this.getHeight() + 'px;"></div>');
            var c = echarts.init($('#' + this.id + '_' + id).get(0));
            var opt = {
                tooltip: {
                    trigger: 'axis',
                    position: function (pt) {
                        return [pt[0], '10%'];
                    }
                },
                title: {
                    left: 'center',
                    text: this.title.replace('业务监控', '') + this.vPointMap[id].name + '趋势图',
                },
                toolbox: {
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xd
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%']
                },
                dataZoom: [{
                    type: 'slider',
                    start: 0,
                    end: 100
                }, {
                    start: 0,
                    end: 10,
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
                series: [
                    {
                        name: '值',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        roam: false,
                        itemStyle: {
                            normal: {
                                color: 'rgb(255, 70, 131)'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgb(255, 158, 68)'
                                }, {
                                    offset: 1,
                                    color: 'rgb(255, 70, 131)'
                                }])
                            }
                        },
                        data: yd
                    }
                ]
            };

            c.setOption(opt);
            this.vLinecharts.push(c);
        },
        getValueGroup: function (data) {
            var data_map = {}, d;
            for (var i = 0; i < data.length; i++) {
                d = data[i];
                !data_map[d.tag] && (data_map[d.tag] = {date: [], data: []});
                data_map[d.tag].date.push(moment(d.createTime).format('YYYY-MM-DD hh:mm:ss'));
                data_map[d.tag].data.push(d.value || 0);
            }
            return data_map;
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
        },
        bindEvents: function () {
        }
    };

    function isEmptyObject(obj) {
        if (obj) {
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
        }
        return true;
    }

    return function (opt) {
        return new LineChart(opt);
        ;
    }
});