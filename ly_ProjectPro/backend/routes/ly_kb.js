/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：知识库路由（RAG）
 * 功能说明：挂载知识库上传 / 文件列表 / 删除 / 问答接口，实际处理逻辑在 controllers/ 中
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  ly_upload_kb_file, ly_get_file_list, ly_delete_file, ly_post_ask,
  ly_ensure_upload_dir, LY_UPLOAD_DIR, LY_ALLOW_EXT
} = require('../controllers/ly_kb_controller');

// 确保上传目录存在
ly_ensure_upload_dir();

// multer 配置：10MB 限制，磁盘文件名用时间戳+随机数避免中文/重名问题
const ly_storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, LY_UPLOAD_DIR); },
  filename: function (req, file, cb) {
    const ly_ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ly_ext);
  }
});
const ly_upload = multer({
  storage: ly_storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const ly_ext = path.extname(file.originalname).toLowerCase();
    if (LY_ALLOW_EXT.includes(ly_ext)) { cb(null, true); }
    else { cb(new Error('不支持的文件格式：' + ly_ext)); }
  }
});

const ly_router = express.Router();

// 上传接口单独包装 multer 错误（格式不支持/超过大小限制时也返回统一 JSON）
function ly_upload_with_error_handler(req, res, next) {
  ly_upload.single('file')(req, res, function (ly_err) {
    if (ly_err) {
      return res.json({ code: 1, msg: '上传失败：' + ly_err.message, data: null });
    }
    next();
  });
}

// 知识库接口（前缀 /api/kb）：
ly_router.post('/upload', ly_upload_with_error_handler, ly_upload_kb_file);   // 上传并解析文件
ly_router.get('/files', ly_get_file_list);                                     // 文件列表
ly_router.delete('/files/:id', ly_delete_file);                                // 删除文件
ly_router.post('/ask', ly_post_ask);                                           // RAG 知识库问答

module.exports = ly_router;
