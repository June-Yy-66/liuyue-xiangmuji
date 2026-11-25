/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：图像识别控制器
 * 功能说明：接收前端上传的图片（multipart 字段 file，5MB 内），校验格式后
 *           调用视觉大模型生成描述。统一返回 JSON 格式 { code, msg, data }
 */
const { ly_recognize_image } = require('../models/ly_vision_model');

// 允许的图片 MIME 类型
const LY_ALLOW_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// 功能：图片识别（POST /api/vision/recognize，multipart 字段 file）
async function ly_post_recognize(req, res) {
  try {
    if (!req.file) {
      return res.json({ code: 1, msg: '请选择要识别的图片', data: null });
    }
    if (!LY_ALLOW_MIME.includes(req.file.mimetype)) {
      return res.json({ code: 1, msg: '仅支持 jpg / png / webp / gif 格式图片', data: null });
    }

    // 图片转 base64 并调用视觉模型
    const ly_base64 = req.file.buffer.toString('base64');
    const ly_desc = await ly_recognize_image(ly_base64, req.file.mimetype);
    res.json({
      code: 0,
      msg: '识别成功',
      data: {
        ly_file_name: req.file.originalname,
        ly_description: ly_desc
      }
    });
  } catch (ly_err) {
    console.error('图像识别接口异常：', ly_err.message);
    res.json({ code: 1, msg: '识别失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_post_recognize, LY_ALLOW_MIME };
