/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：图库图文数据模型
 * 功能说明：负责 ly_gallery 表的数据库访问（字段：id、title、description、
 *           img_url、category、create_time），供控制器调用
 */
const ly_pool = require('../config/ly_db');

// 功能：查询全部图文数据，按创建时间倒序返回
async function ly_get_all_gallery() {
  const ly_sql = 'SELECT id, title, description, img_url, category, create_time FROM ly_gallery ORDER BY create_time DESC';
  const [ly_rows] = await ly_pool.query(ly_sql);
  return ly_rows;
}

module.exports = { ly_get_all_gallery };
