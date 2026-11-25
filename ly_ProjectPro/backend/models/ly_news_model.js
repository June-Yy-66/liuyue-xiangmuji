/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：科技新闻数据模型
 * 功能说明：负责 ly_news 表的数据库访问（字段：id、title、summary、content、
 *           source、publish_time、cover_img），供控制器调用
 */
const ly_pool = require('../config/ly_db');

// 功能：查询全部科技新闻，按发布时间倒序返回
async function ly_get_all_news() {
  const ly_sql = 'SELECT id, title, summary, content, source, publish_time, cover_img FROM ly_news ORDER BY publish_time DESC';
  const [ly_rows] = await ly_pool.query(ly_sql);
  return ly_rows;
}

module.exports = { ly_get_all_news };
