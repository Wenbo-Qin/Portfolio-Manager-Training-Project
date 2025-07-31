const mysql = require('mysql2/promise');

// 创建数据库连接池（推荐使用连接池而非单次连接）
const pool = mysql.createPool({
  host: 'localhost',         // 数据库地址（默认 localhost）
  user: 'root',              // 数据库用户名（根据你的 MySQL 配置修改）
  password: '123456',  // 数据库密码（必填）
  database: 'sales_data',  // 数据库名（需要先在 MySQL 中创建）
  port: 3306,                // 数据库端口（默认 3306）
  connectionLimit: 10,        // 最大连接数
  timezone: '+08:00',       // 设置正确的时区
  dateStrings: ['DATE']
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功！');
    connection.release(); // 释放连接
  } catch (err) {
    console.error('数据库连接失败：', err.message);
  }
}

// 执行测试
testConnection();

// 导出连接池供其他文件使用
module.exports = pool;