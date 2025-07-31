;(function(window, $){
  // ——— 渲染函数：负责把 data 数组渲染成 5 列，与标题对齐 ———
  function renderFundList(data) {
    const $list = $('#fund-list');
    let html = '';
    data.forEach(fund => {
      const g = parseFloat(fund.currentGrowth);
      const cls = g>0 ? 'up' : (g<0 ? 'down' : '');
      const sym = g>0 ? '+' : '';
      html += `
        <li>
          <p>
            <span>${fund.rank}</span>
            <span title="${fund.name}">${fund.name}</span>
            <span>${fund.code}</span>
            <span>${fund.unitValue}</span>
            <span class="${cls}">${sym}${fund.currentGrowth}%</span>
          </p>
        </li>`;
    });
    $list.html(html);
  }

  // ——— 拉数据并交给渲染函数 ———
function loadFundData() {
  fetch('/api/fund/rankings?type=all&sort=day&limit=20')
    .then(response => response.json())
    .then(json => {
      // 渲染列表
      renderFundList(json.data);
      
      // —— 数据渲染完成后再启动滚动插件 —— 
      $('.fund-wrap').liMarquee({
        direction: 'up',
        runshort: false,
        scrollamount: 20
      });
    })
    .catch(err => console.error('基金加载失败：', err));
}


  // ——— 初始化：页面加载、定时、双击刷新 ———
  function initFundModule() {
    loadFundData();
<<<<<<< HEAD
    setInterval(loadFundData, 60*1000);
=======
    setInterval(loadFundData, 60*60*1000);
>>>>>>> 49866d0 (Added language switching function)
    $('.fund-header').on('dblclick', loadFundData);
  }

  window.addEventListener('load', initFundModule);
})(window, jQuery);