/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：MySQL 连接池配置
 * 功能说明：创建 mysql2 连接池，数据库凭据统一从 backend/.env 读取
 *           （变量名：DB_USER、DB_PASSWORD、DB_HOST、DB_NAME），不写入代码
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

// 创建 MySQL 连接池，供各数据模型（models/）复用
const ly_pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ly_project_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = ly_pool;
