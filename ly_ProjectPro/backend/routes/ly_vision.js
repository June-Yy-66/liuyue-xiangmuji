/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：图像识别路由
 * 功能说明：挂载图片识别接口，multer 用内存存储（图片转 base64 后即用即弃），
 *           multer 错误统一返回 JSON 格式
 */
const express = require('express');
const multer = require('multer');
const { ly_post_recognize, LY_ALLOW_MIME } = require('../controllers/ly_vision_controller');

// 内存存储：图片不落盘，直接转 base64
const ly_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (LY_ALLOW_MIME.includes(file.mimetype)) { cb(null, true); }
    else { cb(new Error('仅支持 jpg / png / webp / gif 格式图片')); }
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

// 图像识别接口：POST /api/vision/recognize（multipart 字段 file）
ly_router.post('/recognize', ly_upload_with_error_handler, ly_post_recognize);

module.exports = ly_router;
