/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：图库图文路由
 * 功能说明：挂载图文相关接口，实际处理逻辑在 controllers/ 中
 */
const express = require('express');
const { ly_get_gallery_list } = require('../controllers/ly_gallery_controller');

const ly_router = express.Router();

// 图文列表接口：GET /api/gallery（返回全部图文，按创建时间倒序）
ly_router.get('/', ly_get_gallery_list);

module.exports = ly_router;
