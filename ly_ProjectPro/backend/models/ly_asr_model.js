/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：语音识别数据模型（ASR）
 * 功能说明：把前端上传的音频转发到硅基流动语音转文字接口
 *           POST /v1/audio/transcriptions（模型 SILICONFLOW_ASR_MODEL，
 *           即 Qwen/Qwen3-ASR-1.7B），返回识别出的文字；
 *           发送与接收的数据均输出到服务端控制台。
 *           说明：七牛 key 可用模型列表中没有任何 ASR 模型
 *           （Qwen-Audio-3.0-ASR-Flash 返回 model_not_found），
 *           故改用硅基流动的 Qwen 官方 ASR 模型实现相同功能
 */
const ly_api_key = process.env.SILICONFLOW_API_KEY;
const ly_base_url = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '');
const ly_asr_model = process.env.SILICONFLOW_ASR_MODEL || 'Qwen/Qwen3-ASR-1.7B';

// 功能：调用语音转文字接口，返回识别文本
// 参数：ly_buffer 音频二进制；ly_file_name 文件名；ly_mime 音频 MIME 类型
async function ly_transcribe_audio(ly_buffer, ly_file_name, ly_mime) {
  if (!ly_api_key) {
    throw new Error('未配置 API Key（请检查 backend/.env 的 SILICONFLOW_API_KEY）');
  }

  // 输出发送给 ASR 接口的数据（控制台）
  console.log('========== [语音识别] 发送给大模型的数据 ==========');
  console.log('接口地址：' + ly_base_url + '/audio/transcriptions');
  console.log('模型：' + ly_asr_model);
  console.log('音频：' + ly_file_name + '（' + ly_mime + '，' + ly_buffer.length + ' 字节）');

  // 组装 multipart 表单（与 OpenAI Whisper 接口格式一致）
  const ly_form = new FormData();
  ly_form.append('model', ly_asr_model);
  ly_form.append('file', new Blob([ly_buffer], { type: ly_mime }), ly_file_name);

  const ly_res = await fetch(ly_base_url + '/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + ly_api_key },
    body: ly_form
  });
  const ly_data = await ly_res.json();
  if (!ly_res.ok) {
    throw new Error(ly_data.message || ('语音识别接口返回 HTTP ' + ly_res.status));
  }

  // 输出大模型返回的数据（控制台）
  console.log('========== [语音识别] 大模型返回的数据 ==========');
  console.log(JSON.stringify(ly_data, null, 2));

  return {
    ly_text: ly_data.text || '',
    ly_language: ly_data.language || null,
    ly_duration_seconds: ly_data.usage && ly_data.usage.seconds || null
  };
}

module.exports = { ly_transcribe_audio };
