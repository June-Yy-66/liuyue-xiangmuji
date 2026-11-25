/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：后端服务入口
 * 功能说明：创建 Express 应用，使用 cors 开放全部跨域（仅用于课程作业），
 *           使用 express.static 托管 frontend/ 静态资源，统一挂载 /api/ 前缀路由，
 *           服务端口固定为 8220
 */
const path = require('path');
const express = require('express');
const cors = require('cors');

// 加载 backend/.env 中的环境变量（数据库凭据等）
require('dotenv').config();

const app = express();

// 开放全部跨域访问（本配置仅用于课程作业）
app.use(cors());

// 解析 JSON 与表单请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 托管 frontend/ 静态资源目录
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 统一挂载 /api/ 前缀路由（MVC 风格，后续接口在 routes/ 中追加）
const ly_apiRouter = require('./routes/ly_index');
app.use('/api', ly_apiRouter);

// 服务端口固定为 8220
const ly_port = 8220;
app.listen(ly_port, () => {
  console.log(`服务已启动：http://localhost:${ly_port}`);
});
