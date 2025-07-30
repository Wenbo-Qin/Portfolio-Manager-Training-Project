const express = require('express');
const path = require('path');
const pool = require('./db/mysql');
const cors = require('cors'); // 如果你用了 cors
<<<<<<< HEAD
const { syncMarketData } = require('./services/fetchStockData');
const cron   = require('node-cron');
const yahooFinance = require('yahoo-finance2').default;
const iconv     = require('iconv-lite');
// 2. 初始化 app（这一步必须在使用 app 之前）
const app = express();
const axios = require('axios');
=======

// 2. 初始化 app（这一步必须在使用 app 之前）
const app = express();
>>>>>>> master

// 3. 再使用 app 进行配置
app.use(cors()); // 启用跨域
app.use(express.static(path.join(__dirname, 'public'))); // 配置静态资源
app.use(express.json()); // 解析 JSON 请求体

<<<<<<< HEAD
// === 启动时 & 定时任务 定义 ===
syncMarketData();  // 启动时先跑一次
cron.schedule('*/5 * * * *', () => {
  console.log('🔄 定时同步行情：', new Date());
  syncMarketData();
});

// === 路由定义 ===
=======
>>>>>>> master
//获取总资产和资产分布
app.get('/api/asset-data', async (req, res) => {
  try {
    // 1. 查询各部分数据（股票、基金、其他、流动资金）
    const [assetRows] = await pool.execute(`
      SELECT 
        SUM(stock) AS stock, 
        SUM(fund) AS fund, 
        SUM(bond + gold) AS other, 
        SUM(liquid_funds) AS liquid 
      FROM asset_monthly
    `);

    // 2. 查询总资产（各部分总和）
    const [totalRows] = await pool.execute(`
      SELECT 
        SUM(stock + fund + bond + gold + liquid_funds) AS total
      FROM asset_monthly
    `);

    // 3. 整理数据返回给前端
    res.json({
      success: true,
      stock: assetRows[0].stock || 0,
      fund: assetRows[0].fund || 0,
      other: assetRows[0].other || 0,
      liquid: assetRows[0].liquid || 0,
      total: totalRows[0].total || 0
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//查询每月流动资金和总资产
app.get('/api/liquid-total-monthly', async (req, res) => {
  try {
    // 从数据库查询每月数据（按月份分组）
    const [rows] = await pool.execute(`
      SELECT 
        stat_month AS month, 
        SUM(liquid_funds) AS liquid,
        SUM(stock + fund + bond + gold + liquid_funds) AS total
      FROM asset_monthly
      GROUP BY stat_month
      ORDER BY stat_month
    `);

    // 处理数据：固定返回12条，不足补0，超出取前12条
    const monthlyData = [];
    for (let i = 0; i < Math.min(rows.length, 12); i++) {
      const liquid = Number(rows[i].liquid) || 0;
      const total = Number(rows[i].total) || 0;
      monthlyData.push({
        liquid: liquid,
        total: total,
        investment: total - liquid
      });
    }
    while (monthlyData.length < 12) {
      monthlyData.push({ liquid: 0, total: 0, investment: 0 });
    }

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//查询每月股票、基金、黄金、债券数据
app.get('/api/asset-monthly-details', async (req, res) => {
  try {
    // 查询每月各资产数据
    const [rows] = await pool.execute(`
      SELECT 
        stat_month AS month, 
        SUM(stock) AS stock,
        SUM(fund) AS fund,
        SUM(gold) AS gold,
        SUM(bond) AS bond
      FROM asset_monthly
      GROUP BY stat_month
      ORDER BY stat_month
    `);

    // 处理数据：确保返回12条记录，不足补0
    const monthlyData = [];
    for (let i = 0; i < Math.min(rows.length, 12); i++) {
      monthlyData.push({
        month: rows[i].month,
        stock: Number(rows[i].stock) || 0,
        fund: Number(rows[i].fund) || 0,
        gold: Number(rows[i].gold) || 0,
        bond: Number(rows[i].bond) || 0
      });
    }
    while (monthlyData.length < 12) {
      monthlyData.push({ month: `2023-${(monthlyData.length + 1).toString().padStart(2, '0')}`, stock: 0, fund: 0, gold: 0, bond: 0 });
    }

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

//包含流动资金的年度资产总和查询
app.get('/api/annual-asset-sum', async (req, res) => {
  try {
    // SQL计算每种资产及流动资金的全年总和
    const [rows] = await pool.execute(`
      SELECT 
        SUM(stock) AS total_stock,         -- 12个月股票资产总和（累加所有记录）
        SUM(fund) AS total_fund,           -- 12个月债券资产总和
        SUM(gold) AS total_gold,           -- 12个月基金资产总和
        SUM(bond) AS total_bond,           -- 12个月黄金资产总和
        SUM(liquid_funds) AS total_liquid  -- 12个月流动资金总和
      FROM asset_monthly
    `);

    // 处理结果（默认值为0）
    const sumData = {
      total_stock: Number(rows[0].total_stock) || 0,
      total_fund: Number(rows[0].total_fund) || 0,
      total_gold: Number(rows[0].total_gold) || 0,
      total_bond: Number(rows[0].total_bond) || 0,
      total_liquid: Number(rows[0].total_liquid) || 0  // 新增流动资金总和
    };

    res.json({
      success: true,
      data: sumData
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

<<<<<<< HEAD

// 资产详情分页查询接口（仅分页展示所有数据）
=======
// 资产详情分页查询接
>>>>>>> master
app.get('/api/asset-details', async (req, res) => {
  try {
    // 1. 严格解析和验证分页参数（确保是整数）
    const page = Math.max(1, parseInt(req.query.page, 10) || 1); // 确保page至少为1
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize, 10) || 10)); // 限制pageSize范围1-100
    const offset = Math.max(0, (page - 1) * pageSize); // 确保offset非负

<<<<<<< HEAD
    // 2. 查询总条数
    const [totalResult] = await pool.execute('SELECT COUNT(*) AS total FROM asset_monthly');
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    // 3. 查询当前页数据，包含id字段
    const sql = `
      SELECT id, stat_month, stock, fund, gold, bond, liquid_funds
=======
    // 打印参数日志，检查是否为有效数字
    console.log('分页参数验证:', {
      page: { value: page, type: typeof page, isInteger: Number.isInteger(page) },
      pageSize: { value: pageSize, type: typeof pageSize, isInteger: Number.isInteger(pageSize) },
      offset: { value: offset, type: typeof offset, isInteger: Number.isInteger(offset) }
    });

    // 2. 查询总条数
    const [totalResult] = await pool.execute('SELECT COUNT(*) AS total FROM asset_monthly');
    const total = totalResult[0].total;

    // 3. 查询当前页数据（确保参数格式正确）
    const sql = `
      SELECT stat_month, stock, fund, gold, bond, liquid_funds
>>>>>>> master
      FROM asset_monthly
      ORDER BY stat_month ASC
      LIMIT ?, ?;
    `;
<<<<<<< HEAD

    // 使用数值类型参数（MySQL的LIMIT需要数值类型）
    const [data] = await pool.execute(sql, [offset + '', pageSize + '']);

    // 4. 返回标准化分页数据
    res.json({
      success: true,
      data: {
        list: data,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalRecords: Number(total), // 明确转为数字
          totalPages: totalPages
        }
      }
    });
  } catch (err) {
    console.error('接口错误详情:', err);
    res.status(500).json({
      success: false,
      error: '查询失败: ' + err.message,
=======
    
    // 关键修复：将参数转换为整数，并显式构造数组
    const params = [offset.toString(), pageSize.toString()];
    console.log('传递给MySQL的参数:', params, '参数类型:', params.map(p => typeof p));

    // 执行查询时显式指定参数
    const [data] = await pool.execute({sql,values: params});

    // 4. 返回数据
    res.json({
      success: true,
      data: { list: data, total, page, pageSize }
    });
  } catch (err) {
    console.error('接口错误详情:', err); 
    res.status(500).json({
      success: false,
      error: '查询失败: ' + err.message,
      // 开发环境下返回参数信息帮助调试
>>>>>>> master
      debug: {
        page: req.query.page,
        pageSize: req.query.pageSize
      }
    });
  }
});

<<<<<<< HEAD
// 删除资产接口，使用id作为删除条件
app.delete('/api/asset-details', async (req, res) => {
  try {
    const { id } = req.body;

    // 验证参数
    if (!id) {
      return res.status(400).json({
        success: false,
        error: '缺少必要的参数: id'
      });
    }

    // 执行删除操作
    const [result] = await pool.execute(
      'DELETE FROM asset_monthly WHERE id = ?',
      [id]
    );

    // 检查是否删除成功
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到指定的记录'
      });
    }

    // 返回成功响应
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (err) {
    console.error('删除接口错误详情:', err);
    res.status(500).json({
      success: false,
      error: '删除失败: ' + err.message
    });
  }
});

// 添加资产详情数据
app.post('/api/asset-details', async (req, res) => {
    try {
        const { stat_month, stock, fund, gold, bond, liquid_funds } = req.body;
        
        // 验证必填字段
        if (!stat_month) {
            return res.json({ success: false, error: '时间字段是必需的' });
        }
        
        // 插入数据到数据库
        const query = `
            INSERT INTO asset_monthly (stat_month, stock, fund, gold, bond, liquid_funds) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [stat_month, stock || 0, fund || 0, gold || 0, bond || 0, liquid_funds || 0];
        
        // 执行数据库查询
        const result = await pool.execute(query, values);
        
        res.json({ 
            success: true,
            message: '数据添加成功',
            id: result.insertId
        });
    } catch (error) {
        console.error('添加数据错误:', error);
        res.json({ success: false, error: '服务器内部错误' });
    }
});

// 获取热门基金排行榜（修正版）
app.get('/api/fund/rankings', async (req, res) => {
  try {
    // 获取请求参数
    const type = req.query.type || 'all';
    const sort = req.query.sort || 'day';
    const limit = parseInt(req.query.limit) || 10;

    console.log('正在获取基金数据...', { type, sort, limit });


    // 构建请求URL
    const url = `http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=${type}&rs=&gs=0&sc=${sort}&st=desc&pi=1&pn=${limit}&dx=1`;
    console.log('请求URL:', url);

    // 请求数据
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://fund.eastmoney.com/data/fundranking.html'
      },
      timeout: 10000 // 10秒超时
    });

    // 处理返回的数据
    const dataStr = response.data;
    console.log('原始响应长度:', dataStr.length);

    // 尝试提取数据
    let funds = [];

    // 方法1：尝试匹配 rankData
    const rankDataMatch = dataStr.match(/var\s+rankData\s*=\s*(\{[\s\S]*?\});/);
    if (rankDataMatch && rankDataMatch[1]) {
      try {
        const rankData = JSON.parse(rankDataMatch[1]);
        funds = rankData.datas || [];
        console.log('方法1成功，获取到基金数:', funds.length);
      } catch (e) {
        console.log('方法1解析失败:', e.message);
      }
    }

    // 方法2：如果方法1失败，尝试直接匹配 datas
    if (funds.length === 0) {
      const datasMatch = dataStr.match(/datas\s*:\s*(\[[\s\S]*?\])[,}]/);
      if (datasMatch && datasMatch[1]) {
        try {
          funds = JSON.parse(datasMatch[1]);
          console.log('方法2成功，获取到基金数:', funds.length);
        } catch (e) {
          console.log('方法2解析失败:', e.message);
        }
      }
    }

    // 方法3：如果还是失败，尝试提取所有数组格式的数据
    if (funds.length === 0) {
      const arrayMatch = dataStr.match(/\[\[[\s\S]*?\]\]/);
      if (arrayMatch) {
        try {
          funds = JSON.parse(arrayMatch[0]);
          console.log('方法3成功，获取到基金数:', funds.length);
        } catch (e) {
          console.log('方法3解析失败:', e.message);
        }
      }
    }

    if (funds.length === 0) {
      // 如果都失败了，返回模拟数据
      console.log('无法解析真实数据，返回模拟数据');
      funds = [
        "000001,华夏成长混合,HXCZHH,2025-01-10,1.234,1.234,0.5,1.2,2.3,5.6,8.9,15.2,20.1,30.2,40.5,18.9,150.2",
        "110011,易方达中小盘混合,YFDZSPHH,2025-01-10,5.678,5.678,-0.3,0.8,1.5,4.2,7.3,12.8,18.5,25.6,35.2,16.3,120.5",
        "519736,交银新成长混合,JYXCZHH,2025-01-10,3.456,3.456,1.2,2.1,3.4,6.7,10.2,18.3,25.6,35.8,45.2,22.1,180.3"
      ];
    }

    // 格式化数据
    const formattedData = funds.slice(0, limit).map((fund, index) => {
      let parts;
      if (typeof fund === 'string') {
        parts = fund.split(',');
      } else if (Array.isArray(fund)) {
        parts = fund;
      } else {
        return null;
      }

      if (!parts || parts.length < 10) return null;

      const growthIndex = 6;  // 直接取第7个字段作为当前涨跌幅

      return {
        rank: index + 1,
        code: parts[0],
        name: parts[1],
        nameAbbr: parts[1].length > 8 ? parts[1].substring(0, 8) + '...' : parts[1],
        date: parts[3] || '2025-01-10',
        unitValue: parts[4] || '0.00',
        accumulatedValue: parts[5] || '0.00',
        currentGrowth: parts[growthIndex] || '0.00',
        dayGrowth: parts[6] || '0.00',
        weekGrowth: parts[7] || '0.00',
        monthGrowth: parts[8] || '0.00'
      };
    }).filter(item => item !== null);

    console.log('最终返回基金数:', formattedData.length);

    res.json({
      success: true,
      data: formattedData,
      updateTime: new Date().toLocaleString('zh-CN')
    });

  } catch (err) {
    console.error('获取基金排行数据失败：', err.message);

    // 返回模拟数据，确保前端能正常显示
    const mockData = [
      { rank: 1, code: "000001", name: "华夏成长混合", nameAbbr: "华夏成长混合", unitValue: "1.234", currentGrowth: "2.35", date: "01-10" },
      { rank: 2, code: "110011", name: "易方达中小盘混合", nameAbbr: "易方达中小盘", unitValue: "5.678", currentGrowth: "-0.58", date: "01-10" },
      { rank: 3, code: "519736", name: "交银新成长混合", nameAbbr: "交银新成长", unitValue: "3.456", currentGrowth: "1.23", date: "01-10" },
      { rank: 4, code: "000011", name: "华夏大盘精选混合", nameAbbr: "华夏大盘精选", unitValue: "15.234", currentGrowth: "0.86", date: "01-10" },
      { rank: 5, code: "163402", name: "兴全趋势投资混合", nameAbbr: "兴全趋势投资", unitValue: "0.789", currentGrowth: "-1.25", date: "01-10" }
    ];

    res.json({
      success: true,
      data: mockData,
      updateTime: new Date().toLocaleString('zh-CN'),
      notice: "使用模拟数据"
    });
  }
});


// GET /api/search?q=关键词
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ success: false, error: '请输入搜索关键词' });
  }

  // 用通配符拼 three patterns：中文、英文、代码
  const like = `%${q}%`;
  const sql = `
    SELECT symbol, name_zh AS nameZh, name_en AS nameEn, market
      FROM stock_list
     WHERE name_zh LIKE ?
        OR name_en LIKE ?
        OR symbol LIKE ?
     LIMIT 20
  `;
  try {
    const [rows] = await pool.query(sql, [like, like, like]);
    // 格式化前端需要的格式
    const data = rows.map(r => ({
      symbol: r.symbol + (r.market === 'HK' ? '.HK' : r.symbol.startsWith('6') ? '.SS' : '.SZ'),
      nameZh: r.nameZh,
      nameEn: r.nameEn,
      market: r.market
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error('搜索 stock_list 失败：', err);
    res.status(500).json({ success: false, error: '搜索服务异常' });
  }
});


// 1) 获取监控列表
app.get('/api/monitored', async (_, res) => {
  try {
    const [rows] = await pool.query(`SELECT symbol,market FROM monitored_stocks ORDER BY market,symbol`);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 2) 添加/更新监控
// POST /api/monitored
app.post('/api/monitored', async (req, res) => {
  const { symbol, market, nameZh, nameEn } = req.body;
  if (!symbol || !market) {
    return res.status(400).json({ success: false, error: '参数不全' });
  }
  try {
    await pool.query(
      'INSERT INTO monitored_stocks (symbol,market,name_zh,name_en) VALUES (?,?,?,?)',
      [symbol, market, nameZh, nameEn]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: '写入失败' });
  }
});

// 3) 获取前 N 名看板数据
app.get('/api/:market/top', async (req, res) => {
  const m = req.params.market.toLowerCase(),
    market = m === 'hk' ? 'HK' : m === 'sh' ? 'SH' : null,
    limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
  if (!market) return res.status(400).json({ success: false, error: 'market 参数错误' });
  try {
    const [rows] = await pool.query(
      `SELECT symbol,name,volume,growthRate
         FROM stocks WHERE market=? ORDER BY volume DESC LIMIT ?`,
      [market, limit]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// app.js 中：获取“港股看板”
app.get('/api/hk/top', async (req, res) => {
  try {
    const rows = await pool.query(
      'SELECT symbol FROM monitored_stocks WHERE market="HK" ORDER BY id DESC LIMIT ?',
      [parseInt(req.query.limit, 10) || 10]
    );
    const symbols = rows.map(r => r.symbol);
    if (!symbols.length) return res.json({ success: true, data: [] });

    // 批量请求行情
    const quotes = await yahooFinance.quote(symbols);
    // quotes 可能是单个或数组，规范成数组
    const list = Array.isArray(quotes) ? quotes : [quotes];

    // 只取你前端需要的几个字段
    const data = list.map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChangePercent,
      name: q.longName || q.shortName
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// app.js 中：获取“A股看板”
app.get('/api/SH/top', async (req, res) => {
  try {
    const rows = await pool.query(
      'SELECT symbol FROM monitored_stocks WHERE market="SH" ORDER BY id DESC LIMIT ?',
      [parseInt(req.query.limit, 10) || 10]
    );
    const symbols = rows.map(r => r.symbol);
    if (!symbols.length) return res.json({ success: true, data: [] });

    // 批量请求行情
    const quotes = await yahooFinance.quote(symbols);
    // quotes 可能是单个或数组，规范成数组
    const list = Array.isArray(quotes) ? quotes : [quotes];

    // 只取你前端需要的几个字段
    const data = list.map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChangePercent,
      name: q.longName || q.shortName
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

=======
// 启动服务器
>>>>>>> master
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动，访问地址：http://localhost:${PORT}`);
});