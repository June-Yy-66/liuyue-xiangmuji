/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：AI 聊天控制器
 * 功能说明：接收前端聊天消息，调用硅基流动（SiliconFlow）大模型接口生成回复。
 *           API Key 从 .env 读取（SILICONFLOW_API_KEY），不写入任何代码。
 *           统一返回 JSON 格式 { code, msg, data }，code=0 成功，非 0 失败
 */
const { ly_ai_chat } = require('../models/ly_ai_model');

// 功能：处理聊天请求（POST /api/ai/chat）
async function ly_post_chat(req, res) {
  const ly_message = (req.body && req.body.ly_message || '').trim();
  const ly_history = Array.isArray(req.body && req.body.ly_history) ? req.body.ly_history : [];

  // 参数校验：消息不能为空
  if (!ly_message) {
    return res.json({ code: 1, msg: '聊天内容不能为空', data: null });
  }

  try {
    const ly_reply = await ly_ai_chat(ly_message, ly_history);
    res.json({ code: 0, msg: '回复成功', data: { ly_reply: ly_reply } });
  } catch (ly_err) {
    // 大模型调用失败：把错误原因返回给前端
    console.error('AI 聊天接口异常：', ly_err.message);
    res.json({ code: 1, msg: 'AI 回复失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_post_chat };
