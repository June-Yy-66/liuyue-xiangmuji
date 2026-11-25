/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：数据库连接页面交互逻辑
 * 功能说明：点击连接按钮后，把用户名密码提交到后端 /api/database/connect，
 *           服务器返回的数据与错误信息均输出到浏览器控制台，并在页面展示成功/失败提示
 */

// 功能：在页面提示区显示结果（成功绿色 / 失败红色）
function ly_show_result(ly_is_ok, ly_text) {
  const ly_box = document.getElementById('ly_result');
  ly_box.classList.remove('ly_hide', 'ly_success', 'ly_error');
  ly_box.classList.add(ly_is_ok ? 'ly_success' : 'ly_error');
  ly_box.textContent = ly_text;
}

// 功能：发起数据库连接请求并处理响应（成功与失败均有提示）
async function ly_connect() {
  const ly_username = document.getElementById('ly_username').value.trim();
  const ly_password = document.getElementById('ly_password').value;
  const ly_btn = document.getElementById('ly_connect_btn');

  // 前端参数校验：用户名与密码必填
  if (!ly_username || !ly_password) {
    ly_show_result(false, '用户名和密码不能为空');
    return;
  }

  // 请求期间禁用按钮，防止重复提交
  ly_btn.disabled = true;
  ly_btn.textContent = '连接中...';
  console.log('提交的数据库连接信息：', { ly_username });

  try {
    // 调用后端连接测试接口
    const ly_res = await fetch('/api/database/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ly_username, ly_password })
    });

    const ly_data = await ly_res.json();
    console.log('服务器返回的数据：', ly_data);

    if (ly_data.code === 0) {
      // 连接成功提示（附带 MySQL 版本号）
      ly_show_result(true, `✅ ${ly_data.msg}（MySQL 版本：${ly_data.data.ly_mysql_version}）`);
    } else {
      // 连接失败提示（后端返回的具体原因）
      ly_show_result(false, `❌ ${ly_data.msg}`);
    }
  } catch (ly_err) {
    // 网络异常或服务未启动
    console.error('数据库连接请求异常：', ly_err);
    ly_show_result(false, '❌ 请求异常：' + ly_err.message + '（请确认后端服务是否已启动）');
  } finally {
    // 恢复按钮状态
    ly_btn.disabled = false;
    ly_btn.textContent = '连接数据库';
  }
}

// 绑定连接按钮点击事件
document.getElementById('ly_connect_btn').addEventListener('click', ly_connect);
