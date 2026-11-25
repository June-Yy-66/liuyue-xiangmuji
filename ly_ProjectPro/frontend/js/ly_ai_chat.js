/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：AI 聊天页面交互逻辑
 * 功能说明：把用户消息 POST 到后端 /api/ai/chat，由后端调用硅基流动大模型
 *           生成回复；保留最近多轮上下文实现多轮对话；发送中显示“正在输入”
 *           动画；服务器返回的数据和错误信息均输出到浏览器控制台
 */

// 后端 AI 聊天接口地址（同时展示在页面头部）
const ly_api_url = '/api/ai/chat';

// 多轮对话上下文（角色 + 内容），随每次请求发给后端
const ly_history = [];

// DOM 引用
const ly_chat_box = document.getElementById('ly_chat_box');
const ly_input = document.getElementById('ly_input');
const ly_send_btn = document.getElementById('ly_send_btn');
const ly_status = document.getElementById('ly_status');

// 功能：把文本中的 HTML 特殊字符转义，防止 XSS
function ly_escape_html(ly_text) {
  return ly_text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 功能：向聊天区域追加一条气泡（ly_role 为 user / ai），返回该节点
function ly_add_msg(ly_role, ly_text) {
  const ly_div = document.createElement('div');
  ly_div.className = 'ly_msg ' + (ly_role === 'user' ? 'ly_msg_user' : 'ly_msg_ai');
  ly_div.textContent = ly_text;
  ly_chat_box.appendChild(ly_div);
  ly_chat_box.scrollTop = ly_chat_box.scrollHeight;
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

// 功能：显示“正在输入”动画气泡，返回该节点（回复到达时移除）
function ly_show_typing() {
  const ly_div = document.createElement('div');
  ly_div.className = 'ly_msg ly_msg_typing';
  ly_div.innerHTML = '<span></span><span></span><span></span>';
  ly_chat_box.appendChild(ly_div);
  ly_chat_box.scrollTop = ly_chat_box.scrollHeight;
  return ly_div;
}

// 功能：发送消息主流程——请求后端接口、渲染 AI 回复、维护上下文
async function ly_send_message() {
  const ly_text = ly_input.value.trim();
  if (!ly_text) {
    return;
  }

  // 渲染用户气泡并清空输入框
  ly_add_msg('user', ly_text);
  ly_input.value = '';
  ly_show_error('');

  // 发送中：禁用按钮 + 显示输入中动画
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
      // 回复成功：渲染 AI 气泡，写入上下文
      ly_typing.remove();
      ly_add_msg('ai', ly_data.data.ly_reply);
      ly_history.push({ ly_role: 'user', ly_content: ly_text });
      ly_history.push({ ly_role: 'assistant', ly_content: ly_data.data.ly_reply });
    } else {
      // 后端返回失败
      console.error('接口返回失败：', ly_data);
      ly_typing.remove();
      ly_add_msg('ai', '（回复失败：' + ly_data.msg + '）');
      ly_show_error('❌ ' + ly_data.msg);
    }
  } catch (ly_err) {
    // 网络异常或服务未启动
    console.error('请求 AI 聊天接口异常：', ly_err);
    ly_typing.remove();
    ly_add_msg('ai', '（网络异常：' + ly_err.message + '，请确认后端服务是否已启动）');
    ly_show_error('❌ 请求异常：' + ly_err.message);
  } finally {
    ly_send_btn.disabled = false;
    ly_input.focus();
  }
}

// 交互绑定：点击发送按钮；Enter 发送、Shift+Enter 换行
ly_send_btn.addEventListener('click', ly_send_message);
ly_input.addEventListener('keydown', function (ly_e) {
  if (ly_e.key === 'Enter' && !ly_e.shiftKey) {
    ly_e.preventDefault();
    ly_send_message();
  }
});
ly_input.focus();
