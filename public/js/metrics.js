$(function () {
  // ——— 基础统计函数 ———
  const sum        = arr => arr.reduce((a, b) => a + b, 0);
  const mean       = arr => arr.length ? sum(arr) / arr.length : 0;
  const variance   = arr => {
    const m = mean(arr);
    return arr.length > 1
      ? arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1)
      : 0;
  };
  const stdDev     = arr => Math.sqrt(variance(arr));
  const percentile = (arr, p) => {
    if (!arr.length) return 0;
    const a   = [...arr].sort((x, y) => x - y);
    const idx = (a.length - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx);
    return a[lo] + (a[hi] - a[lo]) * (idx - lo);
  };

  // ——— 指标函数 ———
  const sharpe        = rets => mean(rets) / stdDev(rets);
  const sortino       = rets => mean(rets) / stdDev(rets.filter(r => r < 0));
  const rollingCalmar = (rets, w = 12) => {
    const out = [];
    for (let i = w - 1; i < rets.length; i++) {
      const slice = rets.slice(i - w + 1, i + 1);
      let navs = [1];
      slice.forEach(r => navs.push(navs.at(-1) * (1 + r)));
      let peak = 1, maxDd = 0;
      navs.slice(1).forEach(v => {
        peak = Math.max(peak, v);
        maxDd = Math.max(maxDd, (peak - v) / peak);
      });
      const cagr = Math.pow(navs.at(-1), 12 / w) - 1;
      out.push(cagr / maxDd);
    }
    return out;
  };
  const omegaRatio    = (rets, θ = 0) => {
    let up = 0, down = 0;
    rets.forEach(r => r > θ ? up += 1 + r : down += 1 + Math.abs(r));
    return down ? up / down : 0;
  };
  // ——— 改为 20% 分位 ———
  const var20  = rets => percentile(rets, 0.20);
  const cvar20 = rets => {
    const v    = percentile(rets, 0.20);
    const tail = rets.filter(r => r <= v);
    return mean(tail);
  };

  // ——— 渲染流程 ———
  function loadMetrics() {
    $.getJSON('/api/asset-monthly', rows => {
      if (rows.data) rows = rows.data;

      // 去重：只保留每个月第一条
      rows = rows.filter((r, i, self) =>
        self.findIndex(x => x.stat_month === r.stat_month) === i
      );

      // 计算总资产 & 收益率
      const total = rows.map(r =>
        parseFloat(r.stock) +
        parseFloat(r.bond) +
        parseFloat(r.fund) +
        parseFloat(r.gold) +
        parseFloat(r.liquid_funds)
      );
      const rets = total.length > 1
        ? total.slice(1).map((v, i) => v / total[i] - 1)
        : [];

      // 安全 KPI 计算
      let S = '—', So = '—', C = '—', O = '—';
      if (rets.length > 2 && stdDev(rets) > 0) {
        const calmarArr = rollingCalmar(rets, 12);
        const calmarVal = calmarArr.at(-1);
        S  = isFinite(sharpe(rets))     ? sharpe(rets).toFixed(2)     : '—';
        So = isFinite(sortino(rets))    ? sortino(rets).toFixed(2)    : '—';
        C  = (calmarVal > 0 && isFinite(calmarVal)) ? calmarVal.toFixed(2) : '—';
        O  = isFinite(omegaRatio(rets)) ? omegaRatio(rets).toFixed(2) : '—';
      }


// 渲染 KPI
      $('#kpi-summary').html(`
  <div style="display: flex; gap: 10px; width: 100%; box-sizing: border-box; padding: 0 10px;">
    ${[
        ['夏普比率',    S ],
        ['索提诺比率',  So],
        ['Calmar 比率', C ],
        ['Omega 比率',  O ]
      ].map(([n, v]) =>
          `<div class="kpi-card" style="flex: 1; min-width: 0;">
        <h6 style="color: white; font-size: 16px;">${n}</h6>
        <p style="color: white; font-size: 16px;">${v}</p>
      </div>`
      ).join('')}
  </div>
`);

      // 构造图表数据
      const dates = rows.map(r => r.stat_month);
      const navs  = total.map((v, i) => i === 0 ? 1 : total[i] / total[0]);
      const ddSeries = navs.map((v, i) => {
        const peak = Math.max(...navs.slice(0, i + 1));
        return (peak - v) / peak;
      });

      // —— 使用 20% 分位 & 12 期滚动窗口 VaR/CVaR ——
      const windowSize = 12;
      const varSeries = dates.map((_, i) => {
        if (i === 0) return null;
        const j = i - 1;
        const start = Math.max(0, j - windowSize + 1);
        const windowRets = rets.slice(start, j + 1);
        return windowRets.length ? var20(windowRets) : null;
      });
      const cvarSeries = dates.map((_, i) => {
        if (i === 0) return null;
        const j = i - 1;
        const start = Math.max(0, j - windowSize + 1);
        const windowRets = rets.slice(start, j + 1);
        return windowRets.length ? cvar20(windowRets) : null;
      });

      // 公用坐标轴样式
      const axis = {
        axisLabel: { color: '#fff' },
        axisLine:  { lineStyle: { color: '#fff' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
      };

      // 渲染 “最大回撤”
      (function(){
        const chart = echarts.init(document.getElementById('drawdown-chart'));
        const maxIdx = ddSeries.findIndex(v => v === Math.max(...ddSeries));
        chart.setOption({
          title:{ text:'最大回撤曲线', textStyle:{ color:'#fff' } },
          xAxis:{ type:'category', data:dates, ...axis, splitLine:{ show:false } },
          yAxis:{ ...axis, axisLabel:{ formatter:v=> (v*100).toFixed(1)+'%', color:'#fff' } },
          series:[{
            type:'line', smooth:true, data:ddSeries,
            lineStyle:{ color:'#4fd1f9' },
            areaStyle:{
              color:new echarts.graphic.LinearGradient(0,0,0,1, [
                { offset:0, color:'rgba(79,209,249,0.5)' },
                { offset:1, color:'rgba(79,209,249,0.1)' }
              ])
            },
            markPoint:{
              data:[{
                name:'最大回撤', value:(ddSeries[maxIdx]*100).toFixed(1)+'%',
                xAxis:maxIdx, yAxis:ddSeries[maxIdx]
              }],
              label:{ color:'#fff', formatter:'{b}\n{c}' },
              itemStyle:{ color:'#ff4757' }
            }
          }]
        });
      })();

      // 渲染 “风险—收益散点”
      (function(){
        echarts.init(document.getElementById('risk-return-chart')).setOption({
          title:{ text:'风险—收益分布', textStyle:{ color:'#fff' } },
          tooltip:{
            trigger:'item',
            formatter: p => 
              `波动率：${(p.data[0]*100).toFixed(2)}%<br/>收益率：${(p.data[1]*100).toFixed(2)}%`
          },
          xAxis:{ name:'波动率', ...axis, splitLine:{ show:false } },
          yAxis:{ name:'收益率', ...axis, splitLine:{ show:false } },
          series:[{
            type:'scatter',
            data: rets.length ? [[stdDev(rets), mean(rets)]] : [],
            symbolSize:16,
            itemStyle:{
              color:new echarts.graphic.RadialGradient(0.5,0.5,0.6, [
                { offset:0, color:'rgba(255,188,0,0.8)' },
                { offset:1, color:'rgba(255,188,0,0.2)' }
              ])
            },
            emphasis:{
              label:{
                show:true,
                formatter:p=>`波动率：${(p.data[0]*100).toFixed(2)}%` +
                               `\n收益率：${(p.data[1]*100).toFixed(2)}%`
              }
            }
          }]
        });
      })();

      // 渲染 “VaR / CVaR” 面积图
      function renderArea(id, title, series, color){
        echarts.init(document.getElementById(id)).setOption({
          title:{ text:title, textStyle:{ color:'#fff' } },
          tooltip:{
            trigger:'axis',
            formatter: items =>
              items[0].axisValue + '<br/>' +
              items.map(s=> `${s.marker}${s.seriesName}：${(s.data*100).toFixed(2)}%`).join('<br/>')
          },
          xAxis:{ type:'category', data:dates, ...axis, splitLine:{ show:false } },
          yAxis:{ 
            ...axis,
            axisLabel:{ formatter:v=> (v*100).toFixed(1)+'%', color:'#fff' }
          },
          series:[{
            name: title,
            type:'line',
            data: series,
            smooth:true,
            symbol:'circle',
            symbolSize:8,
            showSymbol:true,
            lineStyle:{ color },
            itemStyle:{ color },
            areaStyle:{
              color:new echarts.graphic.LinearGradient(0,0,0,1, [
                { offset:0, color: color.replace(/(\d+(\.\d+)?)(?=\))/, '0.6') },
                { offset:1, color: color.replace(/(\d+(\.\d+)?)(?=\))/, '0.1') }
              ])
            },
            emphasis:{ lineStyle:{ width:3 } },
            animationDuration:1000
          }]
        });
      }
      renderArea('var-chart',  'VaR (20%)',  varSeries,  'rgba(56,178,172,1)');
      renderArea('cvar-chart','CVaR (20%)', cvarSeries,'rgba(229,62,62,1)');
    });
  }

  $('#refresh-btn').on('click', loadMetrics);
  loadMetrics();
});