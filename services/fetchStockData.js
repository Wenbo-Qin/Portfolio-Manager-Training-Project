// services/fetchStockData.js
const axios = require('axios');
const iconv = require('iconv-lite');
const pool  = require('../db/mysql');

// 把 0700.HK → hk0700；600519.SZ → sz600519
function formatCode(symbol) {
  const [code, suf] = symbol.split('.');
  if (suf === 'HK') return 'hk' + code.padStart(5, '0');
  if (suf === 'SS') return 'sh' + code;
  if (suf === 'SZ') return 'sz' + code;
  throw new Error('Unsupported symbol suffix: ' + suf);
}

/**
 * symbols: [{ orig:'0700.HK', code:'hk0700', market:'HK' }, …]
 */
async function fetchTencent(symbolObjs) {
  if (!symbolObjs.length) return [];
  const codes = symbolObjs.map(o => o.code).join(',');
  const resp  = await axios.get(`http://qt.gtimg.cn/q=${codes}`, {
    responseType: 'arraybuffer', timeout: 5000
  });
  const body = iconv.decode(resp.data, 'gbk');

  return body.trim().split('\n').map(line => {
    // line 示例： v_hk00700="…~腾讯控股~00700~…~vol(手)~…~pct~…";
    const [ , raw ] = line.split('=');
    const f = raw.replace(/"/g,'').split('~');

    // 提取 formatCode() 里生成的 code 部分
    const m = line.match(/^v_([a-z0-9]+)/);
    const code = m && m[1];

    // 找到对应的原始 symbol 对象
    const mapping = symbolObjs.find(o => o.code === code) || {};
    const origSymbol = mapping.orig || '';    // e.g. "0700.HK"
    const market     = mapping.market || '';  // "HK" 或 "SH"

    // 字段下标说明：f[1]=name, f[2]=symbol(不含后缀), f[6]=成交量(手), f[32]=涨跌%
    const nameRaw    = f[1] || '';
    const volHand    = parseInt(f[6], 10);
    const volume     = Number.isFinite(volHand) ? volHand * 100 : 0;
    const rateRaw    = parseFloat(f[32]);
    const growthRate = Number.isFinite(rateRaw) ? rateRaw : 0;

    return { symbol: origSymbol, name: nameRaw, market, volume, growthRate };
  });
}

async function syncMarketData() {
  try {
    // 1. 读监控列表
    const [monitored] = await pool.query(
      `SELECT symbol, market FROM monitored_stocks`
    );
    if (!monitored.length) {
      console.log('📋 监控列表为空，跳过同步');
      return;
    }

    // 2. 构造带 formatCode 的对象数组
    const objs = monitored.map(r => ({
      orig:   r.symbol,
      market: r.market,
      code:   formatCode(r.symbol)
    }));

    // 3. 分市场并拉数据
    const hkObjs = objs.filter(o => o.market === 'HK');
    const shObjs = objs.filter(o => o.market === 'SH');
    const [hkData, shData] = await Promise.all([
      fetchTencent(hkObjs),
      fetchTencent(shObjs)
    ]);

    // 4. 写入 stocks 表
    const sql = `
      INSERT INTO stocks
        (symbol,name,market,volume,growthRate,updateTime)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name=VALUES(name),
        volume=VALUES(volume),
        growthRate=VALUES(growthRate),
        updateTime=NOW()
    `;
    for (const item of [...hkData, ...shData]) {
      await pool.query(sql, [
        item.symbol,
        item.name,
        item.market,
        item.volume,
        item.growthRate
      ]);
    }

    console.log('✅ 行情同步完成（已正确映射原始 Symbol）');
  } catch (err) {
    console.error('❌ 同步失败：', err.message);
  }
}

module.exports = { syncMarketData };