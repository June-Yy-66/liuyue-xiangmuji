/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：科技新闻控制器
 * 功能说明：处理新闻列表请求，统一返回 JSON 格式
 *           { code: 0, msg: "提示信息", data: [...] }，code=0 成功，非 0 失败
 */
const { ly_get_all_news } = require('../models/ly_news_model');

// 功能：获取科技新闻列表（GET /api/news/list）
async function ly_get_news_list(req, res) {
  try {
    const ly_news_list = await ly_get_all_news();
    res.json({ code: 0, msg: '查询成功', data: ly_news_list });
  } catch (ly_err) {
    // 数据库查询失败时返回统一错误格式
    res.json({ code: 1, msg: '查询新闻列表失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_get_news_list };
