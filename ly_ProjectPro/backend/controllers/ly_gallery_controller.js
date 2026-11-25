/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：图库图文控制器
 * 功能说明：处理图文列表请求，统一返回 JSON 格式
 *           { code: 0, msg: "提示信息", data: [...] }，code=0 成功，非 0 失败
 */
const { ly_get_all_gallery } = require('../models/ly_gallery_model');

// 功能：获取全部图文数据（GET /api/gallery）
async function ly_get_gallery_list(req, res) {
  try {
    const ly_gallery_list = await ly_get_all_gallery();
    res.json({ code: 0, msg: '查询成功', data: ly_gallery_list });
  } catch (ly_err) {
    // 数据库查询失败时返回统一错误格式
    res.json({ code: 1, msg: '查询图文数据失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_get_gallery_list };
