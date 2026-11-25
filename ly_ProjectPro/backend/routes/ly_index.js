/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：/api/ 路由聚合器
 * 功能说明：所有 /api/ 前缀接口统一在本路由下挂载，
 *           响应统一使用 JSON 格式 { code: 0, msg: "提示信息", data: {...} }，
 *           code=0 表示成功，非 0 表示失败
 */
const express = require('express');

// 挂载数据库相关路由（/api/database/...）
const ly_databaseRouter = require('./ly_database');

// 挂载科技新闻相关路由（/api/news/...）
const ly_newsRouter = require('./ly_news');

// 挂载图文列表相关路由（/api/photos/...）
const ly_photoRouter = require('./ly_photo');

// 挂载图库图文相关路由（/api/gallery/...）
const ly_galleryRouter = require('./ly_gallery');

// 挂载 AI 聊天相关路由（/api/ai/...）
const ly_aiRouter = require('./ly_ai');

// 挂载在线客服相关路由（/api/customer_service/...）
const ly_customer_serviceRouter = require('./ly_customer_service');

// 挂载知识库相关路由（/api/kb/...）
const ly_kbRouter = require('./ly_kb');

// 挂载图像识别相关路由（/api/vision/...）
const ly_visionRouter = require('./ly_vision');

// 挂载语音识别相关路由（/api/asr/...）
const ly_asrRouter = require('./ly_asr');

const ly_router = express.Router();
ly_router.use('/database', ly_databaseRouter);
ly_router.use('/news', ly_newsRouter);
ly_router.use('/photos', ly_photoRouter);
ly_router.use('/gallery', ly_galleryRouter);
ly_router.use('/ai', ly_aiRouter);
ly_router.use('/customer_service', ly_customer_serviceRouter);
ly_router.use('/kb', ly_kbRouter);
ly_router.use('/vision', ly_visionRouter);
ly_router.use('/asr', ly_asrRouter);

// 健康检查接口：验证服务与跨域是否正常
ly_router.get('/health', (req, res) => {
  res.json({ code: 0, msg: '服务正常', data: { time: new Date().toISOString() } });
});

module.exports = ly_router;
