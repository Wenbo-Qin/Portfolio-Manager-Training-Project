/*   */
$(window).load(function () {
    $(".loading").fadeOut()
})

$(function () {
    echarts_1();
    echarts_3();
    echarts_4();

    zb1();
    zb2();
    zb3();
    zb4();
    loadTotalAsset();

    //右下角扇形图
    function echarts_1() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('echart1'));

        // 默认数据（与原格式一致）
        const defaultData = {
            total_stock: 60,    // 股票默认值
            total_fund: 5,      // 基金默认值
            total_gold: 15,     // 黄金默认值
            total_bond: 25,     // 债券默认值
            total_liquid: 20    // 流动资金默认值
        };

        let totalSum = 1; // 初始值避免除0

        // 定义数据变量（默认使用默认数据）
        let assetData = defaultData;

        function renderChart() {
            option = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{b} : {c} ({d}%)"
                },
                legend: {
                    right: 0,
                    top: 30,
                    height: 160,
                    itemWidth: 10,
                    itemHeight: 10,
                    itemGap: 10,
                    textStyle: {
                        color: 'rgba(255,255,255,.9)',
                        fontSize: 14
                    },
                    orient: 'vertical',
                    data: ['股票', '基金', '黄金', '债券', '流动资金'] // 恢复图例数据

                },
                calculable: true,
                series: [
                    {
                        name: ' ',
                        color: ['#8891DB', '#FFFF00', '#4cb9cf', '#62c98d', '#FFC0CB', '#205acf', '#c9c862', '#c98b62', '#c962b9', '#7562c9', '#c96262', '#c25775', '#00b7be'],
                        type: 'pie',
                        radius: [50, 90],
                        center: ['40%', '60%'],
                        roseType: 'radius',
                        label: {
                            normal: {
                                show: true
                            },
                            emphasis: {
                                show: true
                            }
                        },

                        labelLine: {
                            normal: {
                                show: true
                            },
                            emphasis: {
                                show: true
                            }
                        },

                        data: [
                            { value: assetData.total_stock, name: '股票' },
                            { value: assetData.total_fund, name: '基金' },
                            { value: assetData.total_gold, name: '黄金' },
                            { value: assetData.total_bond, name: '债券' },
                            { value: assetData.total_liquid, name: '流动资金' },
                        ]
                    },
                ]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        }


        // 页面加载时立即执行初始渲染（显示默认数据）
        renderChart();

        // 接口请求获取数据（保留原格式）
        $.get('/api/annual-asset-sum', function (res) {
            if (!res || !res.success || !res.data) {
                console.error('获取资产总和数据失败：', res?.error || '未知错误');
                return;  // 失败时保持默认数据
            }

            // 解析接口数据（严格遵循原格式）
            assetData = {
                total_stock: Number(res.data.total_stock) || 0,
                total_fund: Number(res.data.total_fund) || 0,
                total_gold: Number(res.data.total_gold) || 0,
                total_bond: Number(res.data.total_bond) || 0,
                total_liquid: Number(res.data.total_liquid) || 0
            };

            // 计算总和（保留除法逻辑）
            totalSum = Object.values(assetData).reduce((sum, value) => {
                return sum + value;
            }, 0);

            // 处理总和为0的情况（避免NaN）
            if (totalSum === 0) {
                totalSum = 1;
            }

            // 更新数据后重新渲染（原逻辑不变）
            renderChart();
        });

        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }


    // 确保页面加载时初始化图表（关键：如果没调用，图表不会加载）
    $(function () {
        echarts_1(); // 初始化饼图
    });

    //折线图
    function echarts_3() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('echart3'));

        const defaultStock = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
        const defaultFund = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
        const defaultGold = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
        const defaultBond = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

        // 定义数据变量（包含黄金）
        let stockData = defaultStock;
        let fundData = defaultFund;
        let goldData = defaultGold;
        let bondData = defaultBond; // 新增黄金数据变量

        function renderChart() {
            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        lineStyle: {
                            color: '#57617B'
                        }
                    }
                },
                legend: {

                    //icon: 'vertical',
                    data: ['股票', '基金', '黄金', '债券'],
                    //align: 'center',
                    // right: '35%',
                    top: '0',
                    textStyle: {
                        color: "#fff",
                        fontSize: 15    //新设置的字体
                    },
                    // itemWidth: 15,
                    // itemHeight: 15,
                    itemGap: 20,
                },
                grid: {
                    left: '0',
                    right: '20',
                    top: '10',
                    bottom: '15',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: 'rgba(255,255,255,.6)',
                            fontSize: 14
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,.1)'
                        }
                    },
                    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                }, {}],
                yAxis: [{
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: 'rgba(255,255,255,.6)'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,.1)'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255,255,255,.1)'
                        }
                    },
                    // 新增：固定 Y 轴最大值为 200
                    max: 180
                }],
                series: [{
                    name: '股票',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 2
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(24, 163, 64, 0.3)'
                            }, {
                                offset: 0.8,
                                color: 'rgba(24, 163, 64, 0)'
                            }], false),
                            shadowColor: 'rgba(0, 0, 0, 0.1)',
                            shadowBlur: 10
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#cdba00',
                            borderColor: 'rgba(137,189,2,0.27)',
                            borderWidth: 12
                        }
                    },
                    data: stockData
                }, {
                    name: '基金',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 2
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(39, 122,206, 0.3)'
                            }, {
                                offset: 0.8,
                                color: 'rgba(39, 122,206, 0)'
                            }], false),
                            shadowColor: 'rgba(0, 0, 0, 0.1)',
                            shadowBlur: 10
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#277ace',
                            borderColor: 'rgba(0,136,212,0.2)',
                            borderWidth: 12
                        }
                    },
                    data: fundData
                }, {
                    name: '黄金',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 2
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(39, 122,206, 0.3)'
                            }, {
                                offset: 0.8,
                                color: 'rgba(39, 122,206, 0)'
                            }], false),
                            shadowColor: 'rgba(0, 0, 0, 0.1)',
                            shadowBlur: 10
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#e52f0fff',
                            borderColor: 'rgba(0,136,212,0.2)',
                            borderWidth: 12
                        }
                    },
                    data: goldData
                }, {
                    name: '债券',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 2
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(39, 122,206, 0.3)'
                            }, {
                                offset: 0.8,
                                color: 'rgba(39, 122,206, 0)'
                            }], false),
                            shadowColor: 'rgba(0, 0, 0, 0.1)',
                            shadowBlur: 10
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#0fe521ff',
                            borderColor: 'rgba(0,136,212,0.2)',
                            borderWidth: 12
                        }
                    },
                    data: bondData
                }]
            };
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        }

        // 页面加载时立即执行初始渲染（显示默认数据）
        renderChart();

        //接口请求获取数据
        $.get('/api/asset-monthly-details', function (res) {  // 此处修改为正确的接口地址
            if (!res || !res.success || !res.data || res.data.length !== 12) {
                console.error('数据格式错误或接口失败：', res?.error || '未知错误');
                return;
            }

            // 解析股票数据
            var newStock = [];
            for (var i = 0; i < res.data.length; i++) {
                var item = res.data[i];
                var val = item.stock || 0;
                newStock.push(Math.round(Number(val)));
            }

            // 解析基金数据
            var newFund = [];
            for (var i = 0; i < res.data.length; i++) {
                var item = res.data[i];
                var val = item.fund || 0;
                newFund.push(Math.round(Number(val)));
            }

            // 解析黄金数据（注意：此处字段名应为 item.gold，之前代码写错了）
            var newGold = [];
            for (var i = 0; i < res.data.length; i++) {
                var item = res.data[i];
                var val = item.gold || 0;  // 修正：从 item.gold 获取黄金数据
                newGold.push(Math.round(Number(val)));
            }

            // 解析债券数据（注意：此处字段名应为 item.bond，之前代码写错了）
            var newBond = [];
            for (var i = 0; i < res.data.length; i++) {
                var item = res.data[i];
                var val = item.bond || 0;  // 修正：从 item.bond 获取债券数据
                newBond.push(Math.round(Number(val)));
            }

            // 更新数据并重新渲染
            stockData = newStock;
            fundData = newFund;
            goldData = newGold;
            bondData = newBond;
            renderChart();
        });


        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }


    function echarts_4() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('echart4'));

        const defaultInvestment = [4, 6, 36, 6, 8, 6, 4, 6, 30, 6, 8, 12];
        const defaultLiquid = [4, 2, 34, 6, 8, 6, 4, 2, 32, 6, 8, 18];
        const defaultTotal = [10, 50, 80, 30, 90, 40, 70, 33, 100, 40, 80, 20];

        let investmentData = defaultInvestment;
        let liquidData = defaultLiquid;
        let totalData = defaultTotal;

        // 定义数据变量（默认使用默认数据）
        function renderChart() {
            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        lineStyle: {
                            color: '#57617B'
                        }
                    }
                },
                "legend": {

                    "data": [
                        { "name": "投资" },
                        { "name": "流动资金" },
                        { "name": "总资产" }
                    ],
                    "top": "0%",
                    "textStyle": {
                        "color": "rgba(255,255,255,0.9)",  //图例文字
                        "fontSize": 15 // 新设置的字体
                    }
                },

                "xAxis": [
                    {
                        "type": "category",

                        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                        axisLine: { lineStyle: { color: "rgba(255,255,255,.1)" } },
                        axisLabel: {
                            textStyle: { color: "rgba(255,255,255,.6)", fontSize: '14', },
                        },

                    },
                ],
                "yAxis": [
                    {
                        "type": "value",
                        "name": "金额",
                        "min": 0,
                        "max": 500,
                        "interval": 100,
                        "axisLabel": {
                            "show": true,

                        },
                        axisLine: { lineStyle: { color: 'rgba(255,255,255,.4)' } },//左线色

                    },
                    {
                        "type": "value",
                        "name": "总资产",
                        "show": true,
                        "axisLabel": {
                            "show": true,

                        },
                        axisLine: { lineStyle: { color: 'rgba(255,255,255,.4)' } },//右线色
                        splitLine: { show: false, lineStyle: { color: '#878787' } },//x轴线
                    },
                ],
                "grid": {
                    "top": "10%",
                    "right": "30",
                    "bottom": "30",
                    "left": "30",
                },
                "series": [
                    {
                        "name": "投资",

                        "type": "bar",
                        "data": investmentData,
                        "barWidth": "auto",
                        "itemStyle": {
                            "normal": {
                                "color": {
                                    "type": "linear",
                                    "x": 0,
                                    "y": 0,
                                    "x2": 0,
                                    "y2": 1,
                                    "colorStops": [
                                        {
                                            "offset": 0,
                                            "color": "#62c98d"     // 绿色：#62B197   青绿色：#62c98d
                                        },

                                        {
                                            "offset": 1,
                                            "color": "#62c98d"
                                        }
                                    ],
                                    "globalCoord": false
                                }
                            }
                        }
                    },
                    {
                        "name": "流动资金",
                        "type": "bar",
                        "data": liquidData,
                        "barWidth": "auto",

                        "itemStyle": {
                            "normal": {
                                "color": {
                                    "type": "linear",
                                    "x": 0,
                                    "y": 0,
                                    "x2": 0,
                                    "y2": 1,
                                    "colorStops": [
                                        {
                                            "offset": 0,
                                            "color": "#4cb9cf"     //粉色：#F89FA8    青蓝色：#4cb9cf   在原来配色基础上挑了更有区分度的两个色号
                                        },
                                        {
                                            "offset": 1,
                                            "color": "#4cb9cf"
                                        }
                                    ],
                                    "globalCoord": false
                                }
                            }
                        },
                        "barGap": "0"
                    },
                    {
                        "name": "总资产",
                        "type": "line",
                        "yAxisIndex": 1,
                        "data": totalData,
                        lineStyle: {
                            normal: {
                                width: 2
                            },
                        },
                        "itemStyle": {
                            "normal": {
                                "color": "#cdba00",

                            }
                        },
                        "smooth": true
                    }
                ]
            };
            myChart.setOption(option);
        }


        // 页面加载时立即执行初始渲染（显示默认数据）
        renderChart();

        // 接口请求部分的正确代码
        $.get('/api/liquid-total-monthly', function (res) {
            if (!res || !res.success || !res.data || res.data.length !== 12) {
                console.error('数据格式错误或接口失败：', res?.error || '未知错误');
                return;
            }

            // 1. 正确声明并初始化投资数据数组
            var newInvestment = []; // 用 var 声明，确保作用域正确
            for (var i = 0; i < res.data.length; i++) {
                var item = res.data[i];
                var val = item.investment || 0;
                newInvestment.push(Math.round(Number(val)));
            }

            // 2. 正确声明并初始化流动资金数据数组
            var newLiquid = [];
            for (var i = 0; i < res.data.length; i++) {
                var item = res.data[i];
                var val = item.liquid || 0;
                newLiquid.push(Math.round(Number(val)));
            }

            // 3. 正确声明并初始化总资产数据数组
            var newTotal = [];
            for (var i = 0; i < res.data.length; i++) {
                var item = res.data[i];
                var val = item.total || 0;
                newTotal.push(Math.round(Number(val)));
            }

            // 4. 赋值给全局变量（此时 newInvestment 已正确声明）
            investmentData = newInvestment;
            liquidData = newLiquid;
            totalData = newTotal;
            renderChart();
        });

        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    //总资产       
    function loadTotalAsset() {
        // 调用后端接口获取数据
        $.get('/api/asset-data', function (res) {
            if (res.success) {
                // 格式化总资产（保留整数，单位已在页面标注为“万元”）
                const total = Math.round(res.total);
                // 渲染到页面
                document.getElementById('totalAsset').textContent = total;
            } else {
                console.error('获取总资产失败：', res.error);
                document.getElementById('totalAsset').textContent = '数据加载失败';
            }
        }).fail(function () {
            document.getElementById('totalAsset').textContent = '网络错误';
        });
        setInterval(loadTotalAsset, 30000);
    }

    //股票投资扇形图
    function zb1() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('zb1'));

        // 从后端接口获取股票数据和总资产（与数据库联动）
        $.get('/api/asset-data', function (res) {
            if (!res.success) {
                console.error('获取股票数据失败：', res.error);
                return;
            }

            // 1. 从接口数据中提取股票金额和总资产（替换硬编码值）
            var targetValue = Math.round(res.stock); // 股票投资金额（取整）
            var totalInvest = Math.round(res.total); // 总资产（取整）
            var otherValue = totalInvest - targetValue; // 其他资产 = 总资产 - 股票

            // 2. 计算占比：股票金额 / 总资产 * 100%（取整数）
            var ratio = totalInvest === 0 ? 0 : Math.round(targetValue / totalInvest * 100);

            // 3. 图表配置（保持原有样式）
            var option = {
                series: [{
                    type: 'pie',
                    radius: ['70%', '90%'],
                    color: '#49bcf7', // 主色调保留
                    label: {
                        normal: {
                            position: 'center'
                        }
                    },
                    data: [{
                        // 股票数据（来自数据库）
                        value: targetValue,
                        name: '股票投资',
                        label: {
                            normal: {
                                formatter: targetValue + '', // 显示股票金额（整数）
                                textStyle: {
                                    fontSize: 24,
                                    color: '#fff',
                                }
                            }
                        }
                    }, {
                        // 其他资产（总资产 - 股票）
                        value: otherValue,
                        name: '其他投资',
                        label: {
                            normal: {
                                formatter: '占比' + ratio + '%', // 显示占比（整数）
                                textStyle: {
                                    color: '#aaa',
                                    fontSize: 14
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: 'rgba(255,255,255,.2)'
                            },
                            emphasis: {
                                color: '#fff'
                            }
                        },
                    }]
                }]
            };
            // 渲染图表
            myChart.setOption(option);
        });

        // 监听窗口缩放，自适应调整
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    // 基金投资扇形图（zb2 - 与数据库联动）
    function zb2() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('zb2'));

        // 从后端接口获取基金数据和总资产
        $.get('/api/asset-data', function (res) {
            if (!res.success) {
                console.error('获取基金数据失败：', res.error);
                return;
            }

            // 1. 从接口提取基金金额和总资产（取整处理）
            var fundValue = Math.round(res.fund); // 基金金额
            var totalInvest = Math.round(res.total); // 总资产
            var otherValue = totalInvest - fundValue; // 其他资产 = 总资产 - 基金

            // 2. 计算基金占总资产的比例（整数）
            var ratio = totalInvest === 0 ? 0 : Math.round(fundValue / totalInvest * 100);

            // 3. 图表配置（保持原有样式）
            var option = {
                series: [{
                    type: 'pie',
                    radius: ['70%', '90%'],
                    color: '#cdba00', // 基金专属颜色
                    label: {
                        normal: {
                            position: 'center'
                        }
                    },
                    data: [{
                        // 基金数据（来自数据库）
                        value: fundValue,
                        name: '基金投资',
                        label: {
                            normal: {
                                formatter: fundValue + '', // 显示基金金额
                                textStyle: {
                                    fontSize: 24,
                                    color: '#fff',
                                }
                            }
                        }
                    }, {
                        // 其他资产（总资产 - 基金）
                        value: otherValue,
                        name: '其他投资',
                        label: {
                            normal: {
                                formatter: '占比' + ratio + '%', // 显示占比
                                textStyle: {
                                    color: '#aaa',
                                    fontSize: 14
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: 'rgba(255,255,255,.2)'
                            },
                            emphasis: {
                                color: '#fff'
                            }
                        },
                    }]
                }]
            };

            myChart.setOption(option);
        });

        // 监听窗口缩放
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    // 其他投资扇形图（zb3 - 与数据库联动）
    function zb3() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('zb3'));

        // 从后端接口获取其他投资数据和总资产
        $.get('/api/asset-data', function (res) {
            if (!res.success) {
                console.error('获取其他投资数据失败：', res.error);
                return;
            }

            // 1. 从接口提取其他投资金额和总资产（取整处理）
            var otherValue = Math.round(res.other); // 其他投资金额（债券+黄金）
            var totalInvest = Math.round(res.total); // 总资产
            var remainingValue = totalInvest - otherValue; // 其他资产 = 总资产 - 其他投资

            // 2. 计算其他投资占总资产的比例（整数）
            var ratio = totalInvest === 0 ? 0 : Math.round(otherValue / totalInvest * 100);

            // 3. 图表配置（保持原有样式）
            var option = {
                series: [{
                    type: 'pie',
                    radius: ['70%', '90%'],
                    color: '#62c98d', // 其他投资专属颜色
                    label: {
                        normal: {
                            position: 'center'
                        }
                    },
                    data: [{
                        // 其他投资数据（来自数据库）
                        value: otherValue,
                        name: '其他投资',
                        label: {
                            normal: {
                                formatter: otherValue + '', // 显示其他投资金额
                                textStyle: {
                                    fontSize: 24,
                                    color: '#fff',
                                }
                            }
                        }
                    }, {
                        // 其他资产（总资产 - 其他投资）
                        value: remainingValue,
                        name: '其他资产',
                        label: {
                            normal: {
                                formatter: '占比' + ratio + '%', // 显示占比
                                textStyle: {
                                    color: '#aaa',
                                    fontSize: 14
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: 'rgba(255,255,255,.2)'
                            },
                            emphasis: {
                                color: '#fff'
                            }
                        },
                    }]
                }]
            };

            myChart.setOption(option);
        });

        // 监听窗口缩放
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    // 流动资金扇形图（zb4 - 与数据库联动）
    function zb4() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('zb4'));

        // 从后端接口获取流动资金数据和总资产
        $.get('/api/asset-data', function (res) {
            if (!res.success) {
                console.error('获取流动资金数据失败：', res.error);
                return;
            }

            // 1. 从接口提取流动资金金额和总资产（取整处理）
            var liquidValue = Math.round(res.liquid); // 流动资金金额
            var totalInvest = Math.round(res.total); // 总资产
            var otherValue = totalInvest - liquidValue; // 其他资产 = 总资产 - 流动资金

            // 2. 计算流动资金占总资产的比例（整数）
            var ratio = totalInvest === 0 ? 0 : Math.round(liquidValue / totalInvest * 100);

            // 3. 图表配置（保持原有样式）
            var option = {
                series: [{
                    type: 'pie',
                    radius: ['70%', '90%'],
                    color: '#c9626bff', // 流动资金专属颜色
                    label: {
                        normal: {
                            position: 'center'
                        }
                    },
                    data: [{
                        // 流动资金数据（来自数据库）
                        value: liquidValue,
                        name: '流动资金',
                        label: {
                            normal: {
                                formatter: liquidValue + '', // 显示流动资金金额
                                textStyle: {
                                    fontSize: 24,
                                    color: '#fff',
                                }
                            }
                        }
                    }, {
                        // 其他资产（总资产 - 流动资金）
                        value: otherValue,
                        name: '其他资产',
                        label: {
                            normal: {
                                formatter: '占比' + ratio + '%', // 显示占比
                                textStyle: {
                                    color: '#aaa',
                                    fontSize: 14
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: 'rgba(255,255,255,.2)'
                            },
                            emphasis: {
                                color: '#fff'
                            }
                        },
                    }]
                }]
            };

            myChart.setOption(option);
        });

        // 监听窗口缩放
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    // ========== 港股/A股 看板 动态渲染 ==========

    // 封装渲染函数：market = 'hk' 或 'sh'
    function loadStockBoards() {
      //   function render(market, selector) {
      //       $.get(`/api/${market}/top?limit=5`, function (res) {
      //           if (!res.success) {
      //               console.error(`获取 ${market} 板失败：`, res.error);
      //               return;
      //           }
      //           const rows = res.data.map((item, idx) => `
      //   <tr>
      //     <td><span>${idx + 1}</span></td>
      //     <td>${item.name}</td>
      //     <td>${(item.volume / 10000).toFixed(2)}万</td>
      //     <td>${item.growthRate}%</td>
      //   </tr>
      // `).join('');
      //           $(selector).html(rows);
      //       });
      //   }

// ------------------新增---------------
        function render(market, selector) {
            $.get(`/api/${market}/top?limit=5`, function (res) {
                if (!res.success) {
                    console.error(`获取 ${market} 板失败：`, res.error);
                    return;
                }
                const rows = res.data.map((item, idx) => `
            <tr>
                <td><span>${idx + 1}</span></td>
                <td>${item.name}</td>
                <td>${(item.volume / 10000).toFixed(2)}万</td>
                <td>${item.growthRate}%</td>
            </tr>
        `).join('');
                $(selector).html(rows);

                // 关键新增：渲染完成后设置颜色
                setGrowthColor(market, selector);
            });
        }

// 新增颜色设置函数（放在 render 函数后面）
//         function setGrowthColor(market, selector) {
//             // 遍历表格行（排除表头）
//             $(selector).find('tr').each(function() {
//                 const growthCell = $(this).find('td:last-child');
//                 if (growthCell.length === 0) return; // 跳过无数据行
//
//                 // 提取增长率数值
//                 const growthText = growthCell.text().replace('%', '');
//                 const growthValue = parseFloat(growthText);
//                 if (isNaN(growthValue)) return;
//
//                 // 根据市场设置颜色（港股/A股区分）
//                 if (market === 'hk') {
//                     // 港股：正增长绿色，负增长红色
//                     growthCell.css('color', growthValue > 0 ? '#62c98d' : '#e52f0fff');
//                 } else if (market === 'sh') {
//                     // A股：正增长红色，负增长绿色
//                     growthCell.css('color', growthValue > 0 ? '#e52f0fff' : '#62c98d');
//                 }
//             });
//         }
        function setGrowthColor(market, selector) {
            $(selector).find('tr').each(function() {
                const $row = $(this); // 获取当前行
                const growthCell = $row.find('td:last-child'); // 找到增长率单元格
                if (growthCell.length === 0) return; // 跳过无数据行

                // 提取增长率数值
                const growthText = growthCell.text().replace('%', '');
                const growthValue = parseFloat(growthText);
                if (isNaN(growthValue)) return;

                // 根据市场设置【整行】颜色（关键修改：将 growthCell 改为 $row）
                if (market === 'hk') {
                    // 港股：正增长绿色，负增长红色
                    $row.css('color', growthValue > 0 ? '#62c98d' : '#e52f0fff');
                } else if (market === 'sh') {
                    // A股：正增长红色，负增长绿色
                    $row.css('color', growthValue > 0 ? '#e52f0fff' : '#62c98d');
                }
            });
        }

        // ------------------新增---------------


        render('hk', '#hk-tbody');
        render('sh', '#sh-tbody');
    }

    // 首次渲染
    $(function () {
        loadStockBoards();
        // 每 5 分钟刷新一次
        setInterval(loadStockBoards, 5 * 60 * 1000);
    });
});





