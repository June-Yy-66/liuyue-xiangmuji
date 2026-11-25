/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：图像识别数据模型
 * 功能说明：把上传图片转为 base64 编码，调用硅基流动视觉大模型
 *           （SILICONFLOW_VISION_MODEL，OpenAI 兼容接口）生成图片描述；
 *           发送给大模型与大模型返回的数据均输出到服务端控制台
 */
const ly_api_key = process.env.SILICONFLOW_API_KEY;
const ly_base_url = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '');
const ly_vision_model = process.env.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct';

// 功能：调用视觉大模型识别图片，返回图片描述文本
// 参数：ly_base64 图片 base64 字符串；ly_mime 图片 MIME 类型（image/jpeg 等）
async function ly_recognize_image(ly_base64, ly_mime) {
  // 校验 API Key 是否已配置
  if (!ly_api_key) {
    throw new Error('未配置 API Key（请检查 backend/.env 的 SILICONFLOW_API_KEY）');
  }

  // 组装视觉对话消息（OpenAI 兼容格式：content 为 text + image_url 数组）
  const ly_messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: '请用简体中文详细描述这张图片的内容，包括主体、场景、色彩与氛围，120 字以内。' },
        { type: 'image_url', image_url: { url: 'data:' + ly_mime + ';base64,' + ly_base64 } }
      ]
    }
  ];

  // 输出发送给大模型的数据（控制台）
  console.log('========== [图像识别] 发送给大模型的数据 ==========');
  console.log('接口地址：' + ly_base_url + '/chat/completions');
  console.log('模型：' + ly_vision_model);
  console.log('图片 MIME：' + ly_mime + '，base64 长度：' + ly_base64.length);
  console.log(JSON.stringify({ model: ly_vision_model, messages: [{ role: 'user', content: [ly_messages[0].content[0], { type: 'image_url', image_url: { url: '(base64 已省略，长度 ' + ly_base64.length + ')' } }] }] }, null, 2));

  // 调用硅基流动视觉模型
  const ly_res = await fetch(ly_base_url + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + ly_api_key
    },
    body: JSON.stringify({
      model: ly_vision_model,
      messages: ly_messages,
      temperature: 0.5,
      max_tokens: 512
    })
  });
  const ly_data = await ly_res.json();
  if (!ly_res.ok) {
    throw new Error(ly_data.message || ('视觉模型接口返回 HTTP ' + ly_res.status));
  }

  // 输出大模型返回的数据（控制台）
  console.log('========== [图像识别] 大模型返回的数据 ==========');
  console.log(JSON.stringify(ly_data, null, 2));

  const ly_reply = ly_data.choices && ly_data.choices[0] && ly_data.choices[0].message && ly_data.choices[0].message.content;
  if (!ly_reply) {
    throw new Error('视觉模型未返回识别结果');
  }
  return ly_reply;
}

module.exports = { ly_recognize_image };
