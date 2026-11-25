/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：在线客服数据模型
 * 功能说明：封装七牛（Qiniu）在线客服大模型接口调用（OpenAI 兼容格式）。
 *           API Key、接口地址、模型名均从 .env 读取（QINIU_CUSTOMER_SERVICE_ 前缀），
 *           不出现在代码中
 */

// 从 .env 读取七牛在线客服配置
const ly_api_key = process.env.QINIU_CUSTOMER_SERVICE_API_KEY;
const ly_base_url = (process.env.QINIU_CUSTOMER_SERVICE_BASE_URL || 'https://api.qnaigc.com/v1').replace(/\/$/, '');
const ly_model = process.env.QINIU_CUSTOMER_SERVICE_MODEL || 'qiniu/conatus-free';

// 功能：调用七牛客服模型接口，返回客服回复文本
// 参数：ly_message 本次用户消息；ly_history 历史对话数组 [{ ly_role, ly_content }]
async function ly_kefu_chat(ly_message, ly_history) {
  // 校验 API Key 是否已配置
  if (!ly_api_key) {
    throw new Error('未配置 API Key（请检查 backend/.env 的 QINIU_CUSTOMER_SERVICE_API_KEY）');
  }

  // 组装对话：客服人设系统提示 + 上下文（最多 10 条）+ 本次消息
  const ly_messages = [
    { role: 'system', content: '你是“刘悦的项目集”网站的在线客服小悦，负责解答本网站各功能页面的使用问题（首页导航、数据库连接、科技新闻、图文列表、图库、AI 聊天等）。回答使用简体中文，热情、简洁、专业；超出网站范围的问题礼貌引导回网站功能。' }
  ].concat(
    ly_history.slice(-10).map((ly_item) => ({
      role: ly_item.ly_role === 'assistant' ? 'assistant' : 'user',
      content: String(ly_item.ly_content || '')
    }))
  ).concat([
    { role: 'user', content: ly_message }
  ]);

  // 调用七牛 OpenAI 兼容接口
  const ly_res = await fetch(ly_base_url + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + ly_api_key
    },
    body: JSON.stringify({
      model: ly_model,
      messages: ly_messages,
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  // 接口异常时解析错误信息并抛出
  const ly_data = await ly_res.json();
  if (!ly_res.ok) {
    throw new Error(ly_data.message || ('七牛客服接口返回 HTTP ' + ly_res.status));
  }
  const ly_reply = ly_data.choices && ly_data.choices[0] && ly_data.choices[0].message && ly_data.choices[0].message.content;
  if (!ly_reply) {
    throw new Error('客服模型未返回回复内容');
  }
  return ly_reply;
}

module.exports = { ly_kefu_chat };
