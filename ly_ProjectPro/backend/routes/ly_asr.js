/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：语音识别路由
 * 功能说明：挂载语音识别接口，multer 内存存储（音频转文字后即用即弃），
 *           multer 错误统一返回 JSON 格式
 */
const express = require('express');
const multer = require('multer');
const { ly_post_recognize, LY_ALLOW_MIME } = require('../controllers/ly_asr_controller');

// 内存存储：音频不落盘
const ly_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    // MIME 主类型（去掉 codecs 后缀）在白名单内即放行
    const ly_main_mime = (file.mimetype || '').split(';')[0].trim();
    if (LY_ALLOW_MIME.includes(ly_main_mime)) { cb(null, true); }
    else { cb(new Error('不支持的音频格式：' + ly_main_mime)); }
  }
});

const ly_router = express.Router();

// 包装 multer 错误（超限 / 格式不支持时返回统一 JSON）
function ly_upload_with_error_handler(req, res, next) {
  ly_upload.single('file')(req, res, function (ly_err) {
    if (ly_err) {
      return res.json({ code: 1, msg: '上传失败：' + ly_err.message, data: null });
    }
    next();
  });
}

// 语音识别接口：POST /api/asr/recognize（multipart 字段 file）
ly_router.post('/recognize', ly_upload_with_error_handler, ly_post_recognize);

module.exports = ly_router;
