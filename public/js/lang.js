// 语言包定义
const i18n = {
    zh: {
        // 通用文本
        "portfolio management system": "投资项目管理系统",
        "function-area": "功能区",
        "project-management": "投资项目管理",
        "income-status": "投资收益情况",
        "stock-monitor": "股票监控列表",
        "portfolio-evaluation": "投资组合评估",
        "hk-board": "港股看板",
        "a-share-board": "A股看板",
        "asset-distribution": "资产分布",
        "total-asset-data": "总资产数据",
        "total-asset-chart": "总资产情况图",
        "investment-project-chart": "投资项目情况图",
        "stock": "股票",
        "fund": "基金",
        "gold": "黄金",
        "bond": "债券",
        "liquid-funds": "流动资金",
        "total-assets": "总资产",
        "stock-investment": "股票投资",
        "fund-investment": "基金投资",
        "other-investments": "其他投资",
        "ranking": "排名",
        "company": "公司",
        "market cap": "市值",
        "growth-rate": "增长率",
        "fund-market": "基金实时行情",
        "fund-name": "基金名称",
        "fund-code": "基金代码",
        "net-value": "净值",
        "increase-decrease": "涨跌幅",

        // add_stock.html
        "stock-monitor-list": "股票监控列表",
        "current-monitor": "当前监控",
        "code": "代码",
        "market": "市场",
        "search-add": "按名称搜索并添加监控",
        "search-placeholder": "输入中文/英文或代码",
        "search-btn": "搜索",
        "add-to-monitor": "添加到监控",
        "market-explanation": "市场说明",
        "market-code-explanation": "市场代码说明:",
        "hk-explanation": "代表该股票在香港联合交易所上市（港股）",
        "sh-explanation": "代表该股票在上海证券交易所上市（A股）",

        // page2.html
        "investment-income": "投资收益情况",
        "month": "月份",
        "stock": "股票(%)",
        "bond": "债券(%)",
        "fund": "基金(%)",
        "gold": "黄金(%)",
        "currency": "货币(%)",
        "portfolio-monthly": "组合当月(%)",
        "portfolio-cumulative": "组合累计(%)",

        // page4.html
        "portfolio-evaluation-title": "投资组合优劣性评估",
        "refresh-indicators": "刷新指标"
    },
    en: {
        // 通用文本
        "portfolio management system": "Portfolio Management System",
        "function-area": "Function Area",
        "project-management": "Investment Project Management",
        "income-status": "Investment Income",
        "stock-monitor": "Stock Monitoring List",
        "portfolio-evaluation": "Portfolio Evaluation",
        "hk-board": "Hong Kong Stock Board",
        "a-share-board": "A-share Board",
        "asset-distribution": "Asset Distribution",
        "ranking": "Ranking",
        "company": "Company",
        "market cap": "Market Cap",
        "growth-rate": "Growth Rate",
        "fund-market": "Fund Real-time Quotes",
        "fund-name": "Fund Name",
        "fund-code": "Fund Code",
        "net-value": "Net Value",
        "increase-decrease": "Change(%)",
        
        // 缺失的字段补充
        "total-asset-data": "Total Assets Data",
        "total-asset-chart": "Total Assets Chart",
        "investment-project-chart": "Investment Projects Chart",
        "stock": "Stock",
        "fund": "Fund",
        "gold": "Gold",
        "bond": "Bond",
        "liquid-funds": "Liquid Funds",
        "total-assets": "Total Assets",
        "stock-investment": "Stock Investment",
        "fund-investment": "Fund Investment",
        "other-investments": "Other Investments",

        // add_stock.html
        "stock-monitor-list": "Stock Monitoring List",
        "current-monitor": "Current Monitoring",
        "code": "Code",
        "market": "Market",
        "search-add": "Search and Add to Monitoring",
        "search-placeholder": "Enter Chinese/English or code",
        "search-btn": "Search",
        "add-to-monitor": "Add to Monitoring",
        "market-explanation": "Market Explanation",
        "market-code-explanation": "Market Code Explanation:",
        "hk-explanation": "Listed on the Hong Kong Stock Exchange",
        "sh-explanation": "Listed on the Shanghai Stock Exchange",

        // page2.html
        "investment-income": "Investment Income",
        "month": "Month",
        "stock": "Stock(%)",
        "bond": "Bond(%)",
        "fund": "Fund(%)",
        "gold": "Gold(%)",
        "currency": "Currency(%)",
        "portfolio-monthly": "Portfolio Monthly(%)",
        "portfolio-cumulative": "Portfolio Cumulative(%)",

        // page4.html
        "portfolio-evaluation-title": "Portfolio Evaluation",
        "refresh-indicators": "Refresh Indicators"
    }
};

// 初始化语言
function initLang() {
    const savedLang = localStorage.getItem('preferredLang') || 'zh';
    setLang(savedLang);
}

// 设置语言
function setLang(lang) {
    // 更新按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // 更新页面文本
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];

            // 处理占位符
            if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
                el.setAttribute('placeholder', i18n[lang][key]);
            }
        }
    });

    // 保存偏好
    localStorage.setItem('preferredLang', lang);
}

// 绑定事件
document.addEventListener('DOMContentLoaded', () => {
    initLang();

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLang(btn.dataset.lang);
        });
    });
});