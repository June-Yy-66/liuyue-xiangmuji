/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：在线客服页面交互逻辑
 * 功能说明：把用户咨询 POST 到后端 /api/customer_service/chat，由后端调用
 *           七牛在线客服大模型生成回复；支持常见问题快捷提问、多轮上下文；
 *           发送中显示“正在输入”动画；服务器返回的数据和错误信息均输出到控制台
 */

// 后端在线客服接口地址
const ly_api_url = '/api/customer_service/chat';

// 多轮对话上下文（角色 + 内容），随每次请求发给后端
const ly_history = [];

// DOM 引用
const ly_service_box = document.getElementById('ly_service_box');
const ly_input = document.getElementById('ly_input');
const ly_send_btn = document.getElementById('ly_send_btn');
const ly_status = document.getElementById('ly_status');
const ly_quick_bar = document.getElementById('ly_quick_bar');

// 功能：向会话区域追加一条气泡（ly_role 为 user / kefu），返回该节点
function ly_add_msg(ly_role, ly_text) {
  const ly_div = document.createElement('div');
  ly_div.className = 'ly_msg ' + (ly_role === 'user' ? 'ly_msg_user' : 'ly_msg_kefu');
  ly_div.textContent = ly_text;
  ly_service_box.appendChild(ly_div);
  ly_service_box.scrollTop = ly_service_box.scrollHeight;
  return ly_div;
}

// 功能：显示 / 隐藏错误提示条
function ly_show_error(ly_text) {
  if (!ly_text) {
    ly_status.classList.add('ly_hide');
    return;
  }
  ly_status.textContent = ly_text;
  ly_status.classList.remove('ly_hide');
}

// 功能：显示“正在输入”动画气泡（回复到达时移除）
function ly_show_typing() {
  const ly_div = document.createElement('div');
  ly_div.className = 'ly_msg ly_msg_typing';
  ly_div.innerHTML = '<span></span><span></span><span></span>';
  ly_service_box.appendChild(ly_div);
  ly_service_box.scrollTop = ly_service_box.scrollHeight;
  return ly_div;
}

// 功能：发送咨询主流程——请求后端接口、渲染客服回复、维护上下文
async function ly_send_message(ly_text) {
  ly_text = (ly_text || ly_input.value).trim();
  if (!ly_text) {
    return;
  }

  // 渲染用户气泡并清空输入框
  ly_add_msg('user', ly_text);
  ly_input.value = '';
  ly_show_error('');

  // 发送中：禁用按钮 + 快捷按钮 + 显示输入中动画
  ly_send_btn.disabled = true;
  const ly_typing = ly_show_typing();

  try {
    const ly_res = await fetch(ly_api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ly_message: ly_text, ly_history: ly_history })
    });
    const ly_data = await ly_res.json();
    console.log('服务器返回的数据：', ly_data);

    if (ly_data.code === 0 && ly_data.data && ly_data.data.ly_reply) {
      // 回复成功：渲染客服气泡，写入上下文
      ly_typing.remove();
      ly_add_msg('kefu', ly_data.data.ly_reply);
      ly_history.push({ ly_role: 'user', ly_content: ly_text });
      ly_history.push({ ly_role: 'assistant', ly_content: ly_data.data.ly_reply });
    } else {
      // 后端返回失败
      console.error('接口返回失败：', ly_data);
      ly_typing.remove();
      ly_add_msg('kefu', '（回复失败：' + ly_data.msg + '）');
      ly_show_error('❌ ' + ly_data.msg);
    }
  } catch (ly_err) {
    // 网络异常或服务未启动
    console.error('请求在线客服接口异常：', ly_err);
    ly_typing.remove();
    ly_add_msg('kefu', '（网络异常：' + ly_err.message + '，请确认后端服务是否已启动）');
    ly_show_error('❌ 请求异常：' + ly_err.message);
  } finally {
    ly_send_btn.disabled = false;
    ly_input.focus();
  }
}

// 交互绑定：发送按钮；Enter 发送、Shift+Enter 换行；常见问题快捷提问
ly_send_btn.addEventListener('click', function () { ly_send_message(); });
ly_input.addEventListener('keydown', function (ly_e) {
  if (ly_e.key === 'Enter' && !ly_e.shiftKey) {
    ly_e.preventDefault();
    ly_send_message();
  }
});
ly_quick_bar.addEventListener('click', function (ly_e) {
  const ly_btn = ly_e.target.closest('.ly_quick_btn');
  if (ly_btn && ly_btn.dataset.ly_q) {
    ly_send_message(ly_btn.dataset.ly_q);
  }
});
ly_input.focus();
