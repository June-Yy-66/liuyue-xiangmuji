/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：数据库连接控制器
 * 功能说明：接收前端提交的用户名与密码，尝试连接本机 MySQL，
 *           统一返回 JSON 格式 { code: 0, msg: "提示信息", data: {...} }，
 *           code=0 表示成功，非 0 表示失败
 */
const mysql = require('mysql2/promise');

// 功能：测试 MySQL 连接，成功返回服务器版本号，失败返回具体错误信息
async function ly_test_connect(req, res) {
  // 获取前端提交的用户名与密码
  const ly_username = req.body.ly_username;
  const ly_password = req.body.ly_password;

  // 参数校验：用户名与密码必填
  if (!ly_username || !ly_password) {
    return res.json({ code: 1, msg: '用户名和密码不能为空', data: null });
  }

  try {
    // 不指定具体数据库，仅验证账号密码是否正确、MySQL 服务是否可达
    const ly_conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: 3306,
      user: ly_username,
      password: ly_password
    });

    // 查询 MySQL 版本号作为连接成功的返回数据
    const [ly_rows] = await ly_conn.query('SELECT VERSION() AS ly_version');
    await ly_conn.end();

    res.json({
      code: 0,
      msg: '数据库连接成功',
      data: { ly_mysql_version: ly_rows[0].ly_version }
    });
  } catch (ly_err) {
    // 连接失败：返回具体错误原因（如密码错误、服务未启动等）
    res.json({ code: 1, msg: '数据库连接失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_test_connect };
