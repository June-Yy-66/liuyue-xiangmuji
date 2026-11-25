/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：图文列表控制器
 * 功能说明：处理图文列表请求，统一返回 JSON 格式
 *           { code: 0, msg: "提示信息", data: [...] }，code=0 成功，非 0 失败
 */
const { ly_get_all_photos } = require('../models/ly_photo_model');

// 功能：获取图文列表（GET /api/photos）
async function ly_get_photo_list(req, res) {
  try {
    const ly_photo_list = await ly_get_all_photos();
    res.json({ code: 0, msg: '查询成功', data: ly_photo_list });
  } catch (ly_err) {
    // 数据库查询失败时返回统一错误格式
    res.json({ code: 1, msg: '查询图文列表失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_get_photo_list };
