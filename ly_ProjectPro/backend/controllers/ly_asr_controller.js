/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：语音识别控制器
 * 功能说明：接收前端上传的音频（multipart 字段 file，15MB 内），校验格式后
 *           调用语音转文字模型返回文本。统一返回 JSON 格式 { code, msg, data }
 */
const { ly_transcribe_audio } = require('../models/ly_asr_model');

// 允许的音频 MIME 类型
const LY_ALLOW_MIME = [
  'audio/wav', 'audio/x-wav', 'audio/wave',
  'audio/mpeg', 'audio/mp3',
  'audio/webm', 'audio/ogg', 'audio/opus',
  'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/flac'
];

// 功能：语音识别（POST /api/asr/recognize，multipart 字段 file）
async function ly_post_recognize(req, res) {
  try {
    if (!req.file) {
      return res.json({ code: 1, msg: '请上传或录制一段语音', data: null });
    }
    // 浏览器录音 MIME 可能带 codecs 后缀（如 audio/webm;codecs=opus），先取主类型
    const ly_main_mime = (req.file.mimetype || '').split(';')[0].trim();
    if (!LY_ALLOW_MIME.includes(ly_main_mime)) {
      return res.json({ code: 1, msg: '不支持的音频格式，请使用 wav / mp3 / m4a / webm / ogg / flac', data: null });
    }

    const ly_result = await ly_transcribe_audio(req.file.buffer, req.file.originalname, ly_main_mime);
    res.json({
      code: 0,
      msg: ly_result.ly_text ? '识别成功' : '识别完成（音频中没有检测到可识别的语音）',
      data: {
        ly_file_name: req.file.originalname,
        ly_text: ly_result.ly_text,
        ly_language: ly_result.ly_language,
        ly_duration_seconds: ly_result.ly_duration_seconds
      }
    });
  } catch (ly_err) {
    console.error('语音识别接口异常：', ly_err.message);
    res.json({ code: 1, msg: '识别失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_post_recognize, LY_ALLOW_MIME };
