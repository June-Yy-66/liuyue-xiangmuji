/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：在线客服控制器
 * 功能说明：接收前端客服会话消息，调用七牛在线客服模型生成回复。
 *           统一返回 JSON 格式 { code, msg, data }，code=0 成功，非 0 失败
 */
const { ly_kefu_chat } = require('../models/ly_customer_service_model');

// 功能：处理在线客服对话请求（POST /api/customer_service/chat）
async function ly_post_customer_service(req, res) {
  const ly_message = (req.body && req.body.ly_message || '').trim();
  const ly_history = Array.isArray(req.body && req.body.ly_history) ? req.body.ly_history : [];

  // 参数校验：消息不能为空
  if (!ly_message) {
    return res.json({ code: 1, msg: '咨询内容不能为空', data: null });
  }

  try {
    const ly_reply = await ly_kefu_chat(ly_message, ly_history);
    res.json({ code: 0, msg: '回复成功', data: { ly_reply: ly_reply } });
  } catch (ly_err) {
    // 客服模型调用失败：把错误原因返回给前端
    console.error('在线客服接口异常：', ly_err.message);
    res.json({ code: 1, msg: '客服回复失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_post_customer_service };
