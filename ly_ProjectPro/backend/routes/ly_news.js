/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：科技新闻路由
 * 功能说明：挂载新闻相关接口，实际处理逻辑在 controllers/ 中
 */
const express = require('express');
const { ly_get_news_list } = require('../controllers/ly_news_controller');

const ly_router = express.Router();

// 新闻列表接口：GET /api/news（返回全部新闻，按发布时间倒序）
ly_router.get('/', ly_get_news_list);

module.exports = ly_router;
