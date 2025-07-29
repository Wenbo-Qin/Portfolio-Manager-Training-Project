const express = require('express');
const path = require('path');
const pool = require('./db/mysql');
const cors = require('cors'); // 如果你用了 cors

// 2. 初始化 app（这一步必须在使用 app 之前）
const app = express();

// 3. 再使用 app 进行配置
app.use(cors()); // 启用跨域
app.use(express.static(path.join(__dirname, 'public'))); // 配置静态资源
app.use(express.json()); // 解析 JSON 请求体

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

// 资产详情分页查询接
app.get('/api/asset-details', async (req, res) => {
  try {
    // 1. 严格解析和验证分页参数（确保是整数）
    const page = Math.max(1, parseInt(req.query.page, 10) || 1); // 确保page至少为1
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize, 10) || 10)); // 限制pageSize范围1-100
    const offset = Math.max(0, (page - 1) * pageSize); // 确保offset非负

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
      FROM asset_monthly
      ORDER BY stat_month ASC
      LIMIT ?, ?;
    `;
    
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
      debug: {
        page: req.query.page,
        pageSize: req.query.pageSize
      }
    });
  }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动，访问地址：http://localhost:${PORT}`);
});