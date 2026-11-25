/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：在线客服路由
 * 功能说明：挂载在线客服相关接口，实际处理逻辑在 controllers/ 中
 */
const express = require('express');
const { ly_post_customer_service } = require('../controllers/ly_customer_service_controller');

const ly_router = express.Router();

// 在线客服对话接口：POST /api/customer_service/chat（请求体 { ly_message, ly_history }）
ly_router.post('/chat', ly_post_customer_service);

module.exports = ly_router;
