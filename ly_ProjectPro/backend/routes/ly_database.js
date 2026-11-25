/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：数据库相关路由
 * 功能说明：挂载数据库连接测试等接口，实际处理逻辑在 controllers/ 中
 */
const express = require('express');
const { ly_test_connect } = require('../controllers/ly_database_controller');

const ly_router = express.Router();

// 连接测试接口：POST /api/database/connect
ly_router.post('/connect', ly_test_connect);

module.exports = ly_router;
