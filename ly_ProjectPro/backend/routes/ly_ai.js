/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：AI 聊天路由
 * 功能说明：挂载 AI 聊天相关接口，实际处理逻辑在 controllers/ 中
 */
const express = require('express');
const { ly_post_chat } = require('../controllers/ly_ai_controller');

const ly_router = express.Router();

// AI 聊天接口：POST /api/ai/chat（请求体 { ly_message, ly_history }）
ly_router.post('/chat', ly_post_chat);

module.exports = ly_router;
