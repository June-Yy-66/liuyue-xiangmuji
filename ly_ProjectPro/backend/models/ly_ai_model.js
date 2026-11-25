/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：AI 聊天数据模型
 * 功能说明：封装硅基流动（SiliconFlow）大模型对话接口调用。
 *           API Key、接口地址、模型名均从 .env 读取，不出现在代码中
 */

// 从 .env 读取硅基流动配置
const ly_api_key = process.env.SILICONFLOW_API_KEY;
const ly_base_url = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '');
const ly_model = process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct';

// 功能：调用硅基流动对话接口，返回 AI 回复文本
// 参数：ly_message 本次用户消息；ly_history 历史对话数组 [{ ly_role, ly_content }]
async function ly_ai_chat(ly_message, ly_history) {
  // 校验 API Key 是否已配置
  if (!ly_api_key) {
    throw new Error('未配置 API Key（请检查 backend/.env 的 SILICONFLOW_API_KEY）');
  }

  // 组装对话历史：系统提示 + 上下文（最多保留 10 条历史）+ 本次消息
  const ly_messages = [
    { role: 'system', content: '你是刘悦的课程作业项目中的 AI 助手，回答使用简体中文，简洁友好。' }
  ].concat(
    ly_history.slice(-10).map((ly_item) => ({
      role: ly_item.ly_role === 'assistant' ? 'assistant' : 'user',
      content: String(ly_item.ly_content || '')
    }))
  ).concat([
    { role: 'user', content: ly_message }
  ]);

  // 调用硅基流动 chat/completions 接口（OpenAI 兼容格式）
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
    throw new Error(ly_data.message || ('硅基流动接口返回 HTTP ' + ly_res.status));
  }
  const ly_reply = ly_data.choices && ly_data.choices[0] && ly_data.choices[0].message && ly_data.choices[0].message.content;
  if (!ly_reply) {
    throw new Error('大模型未返回回复内容');
  }
  return ly_reply;
}

module.exports = { ly_ai_chat };
