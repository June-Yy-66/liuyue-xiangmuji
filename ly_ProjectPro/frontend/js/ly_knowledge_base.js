/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：知识库问答页面交互逻辑（RAG）
 * 功能说明：① 点击/拖拽上传文件到 /api/kb/upload，由后端解析分块入库；
 *           ② 加载 /api/kb/files 渲染文件列表，支持删除；
 *           ③ 提问发送到 /api/kb/ask，渲染大模型回答与引用来源。
 *           服务器返回的数据和错误信息均输出到浏览器控制台
 */

// 后端接口地址
const ly_api_upload = '/api/kb/upload';
const ly_api_files = '/api/kb/files';
const ly_api_ask = '/api/kb/ask';

// DOM 引用
const ly_upload_area = document.getElementById('ly_upload_area');
const ly_file_input = document.getElementById('ly_file_input');
const ly_upload_btn = document.getElementById('ly_upload_btn');
const ly_upload_text = document.getElementById('ly_upload_text');
const ly_upload_status = document.getElementById('ly_upload_status');
const ly_file_list = document.getElementById('ly_file_list');
const ly_list_status = document.getElementById('ly_list_status');
const ly_chat_box = document.getElementById('ly_chat_box');
const ly_ask_status = document.getElementById('ly_ask_status');
const ly_input = document.getElementById('ly_input');
const ly_send_btn = document.getElementById('ly_send_btn');

// 工具：显示/隐藏状态条（ly_box 指定显示位置）
function ly_show_status(ly_box, ly_text, ly_is_fail) {
  if (!ly_text) {
    ly_box.classList.add('ly_hide');
    return;
  }
  ly_box.textContent = ly_text;
  ly_box.classList.remove('ly_hide', 'ly_info', 'ly_fail');
  ly_box.classList.add(ly_is_fail ? 'ly_fail' : 'ly_info');
}

// 工具：格式化文件大小
function ly_format_size(ly_bytes) {
  if (ly_bytes < 1024) { return ly_bytes + ' B'; }
  if (ly_bytes < 1024 * 1024) { return (ly_bytes / 1024).toFixed(1) + ' KB'; }
  return (ly_bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// 功能：上传文件（FormData 包装后 POST 到后端解析入库）
async function ly_upload_file(ly_file) {
  ly_upload_btn.disabled = true;
  ly_upload_text.textContent = '正在上传解析：' + ly_file.name;
  ly_show_status(ly_upload_status, '正在上传并解析文件，请稍候...', false);
  try {
    const ly_form = new FormData();
    ly_form.append('file', ly_file);
    const ly_res = await fetch(ly_api_upload, { method: 'POST', body: ly_form });
    const ly_data = await ly_res.json();
    console.log('上传接口返回的数据：', ly_data);

    if (ly_data.code === 0) {
      ly_show_status(ly_upload_status, '✅ ' + ly_data.msg + '：' + ly_data.data.ly_file_name + '（解析为 ' + ly_data.data.ly_chunk_count + ' 个知识块）', false);
      ly_load_files();
    } else {
      console.error('上传接口返回失败：', ly_data);
      ly_show_status(ly_upload_status, '❌ ' + ly_data.msg, true);
    }
  } catch (ly_err) {
    console.error('上传文件异常：', ly_err);
    ly_show_status(ly_upload_status, '❌ 上传异常：' + ly_err.message + '（请确认后端服务是否已启动）', true);
  } finally {
    ly_upload_btn.disabled = false;
    ly_upload_text.textContent = '点击选择或拖拽文件到此处上传';
    ly_file_input.value = '';
  }
}

// 功能：加载知识库文件列表并渲染（含删除按钮）
async function ly_load_files() {
  ly_show_status(ly_list_status, '正在加载文件列表...', false);
  try {
    const ly_res = await fetch(ly_api_files);
    const ly_data = await ly_res.json();
    console.log('文件列表接口返回的数据：', ly_data);

    if (ly_data.code === 0 && Array.isArray(ly_data.data)) {
      ly_show_status(ly_list_status, '', false);
      if (ly_data.data.length === 0) {
        ly_file_list.innerHTML = '<li class="ly_file_item"><span class="ly_file_meta">知识库还没有文件，先上传一个吧</span></li>';
        return;
      }
      ly_file_list.innerHTML = ly_data.data.map((ly_f) => `
        <li class="ly_file_item">
          <span class="ly_file_icon">📄</span>
          <div class="ly_file_info">
            <div class="ly_file_name">${ly_f.file_name}</div>
            <div class="ly_file_meta">${ly_f.file_type.toUpperCase()} · ${ly_format_size(ly_f.file_size)} · ${ly_f.chunk_count} 个知识块 · 上传于 ${ly_f.create_time.replace('T', ' ').slice(0, 19)}</div>
          </div>
          <button class="ly_file_delete" data-ly_id="${ly_f.id}" data-ly_name="${ly_f.file_name}" type="button">删除</button>
        </li>
      `).join('');
    } else {
      console.error('文件列表接口返回失败：', ly_data);
      ly_show_status(ly_list_status, '❌ ' + ly_data.msg, true);
    }
  } catch (ly_err) {
    console.error('加载文件列表异常：', ly_err);
    ly_show_status(ly_list_status, '❌ 加载列表异常：' + ly_err.message, true);
  }
}

// 功能：删除知识库文件（DELETE /api/kb/files/:id）
async function ly_delete_file(ly_id, ly_name) {
  if (!confirm('确定删除知识库文件「' + ly_name + '」吗？其所有知识块将一并删除。')) {
    return;
  }
  try {
    const ly_res = await fetch(ly_api_files + '/' + ly_id, { method: 'DELETE' });
    const ly_data = await ly_res.json();
    console.log('删除接口返回的数据：', ly_data);
    if (ly_data.code === 0) {
      ly_load_files();
    } else {
      console.error('删除接口返回失败：', ly_data);
      ly_show_status(ly_list_status, '❌ ' + ly_data.msg, true);
    }
  } catch (ly_err) {
    console.error('删除文件异常：', ly_err);
    ly_show_status(ly_list_status, '❌ 删除异常：' + ly_err.message, true);
  }
}

// 功能：知识库提问（POST /api/kb/ask），渲染回答与引用来源
async function ly_ask_question() {
  const ly_question = ly_input.value.trim();
  if (!ly_question) { return; }
  ly_add_msg('user', ly_question);
  ly_input.value = '';
  ly_show_status(ly_ask_status, '', false);
  ly_send_btn.disabled = true;

  // 显示“正在检索并思考”动画
  const ly_typing = document.createElement('div');
  ly_typing.className = 'ly_msg ly_msg_typing';
  ly_typing.innerHTML = '<span></span><span></span><span></span>';
  ly_chat_box.appendChild(ly_typing);
  ly_chat_box.scrollTop = ly_chat_box.scrollHeight;

  try {
    const ly_res = await fetch(ly_api_ask, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ly_question: ly_question })
    });
    const ly_data = await ly_res.json();
    console.log('问答接口返回的数据：', ly_data);

    ly_typing.remove();
    if (ly_data.code === 0 && ly_data.data) {
      ly_add_msg('ai', ly_data.data.ly_reply);
      // 渲染引用来源
      if (ly_data.data.ly_sources && ly_data.data.ly_sources.length > 0) {
        ly_add_sources(ly_data.data.ly_sources);
      }
    } else {
      console.error('问答接口返回失败：', ly_data);
      ly_add_msg('ai', '（回答失败：' + ly_data.msg + '）');
      ly_show_status(ly_ask_status, '❌ ' + ly_data.msg, true);
    }
  } catch (ly_err) {
    console.error('知识库问答异常：', ly_err);
    ly_typing.remove();
    ly_add_msg('ai', '（网络异常：' + ly_err.message + '，请确认后端服务是否已启动）');
    ly_show_status(ly_ask_status, '❌ 请求异常：' + ly_err.message, true);
  } finally {
    ly_send_btn.disabled = false;
    ly_input.focus();
  }
}

// 功能：追加一条问答气泡
function ly_add_msg(ly_role, ly_text) {
  const ly_div = document.createElement('div');
  ly_div.className = 'ly_msg ' + (ly_role === 'user' ? 'ly_msg_user' : 'ly_msg_ai');
  ly_div.textContent = ly_text;
  ly_chat_box.appendChild(ly_div);
  ly_chat_box.scrollTop = ly_chat_box.scrollHeight;
}

// 功能：追加引用来源小卡（文件名 + 块号 + 摘要）
function ly_add_sources(ly_sources) {
  const ly_div = document.createElement('div');
  ly_div.className = 'ly_sources';
  ly_div.textContent = '📎 引用来源：' + ly_sources
    .map((s) => s.ly_file_name + '（块' + s.ly_chunk_index + '）')
    .join('、');
  ly_chat_box.appendChild(ly_div);
  ly_chat_box.scrollTop = ly_chat_box.scrollHeight;
}

// 交互绑定：上传按钮/拖拽、列表删除、提问输入
ly_upload_btn.addEventListener('click', function () { ly_file_input.click(); });
ly_upload_area.addEventListener('click', function (ly_e) {
  if (ly_e.target === ly_upload_area || ly_e.target.classList.contains('ly_upload_icon') || ly_e.target.classList.contains('ly_upload_text')) {
    ly_file_input.click();
  }
});
ly_file_input.addEventListener('change', function () {
  if (ly_file_input.files.length > 0) {
    ly_upload_file(ly_file_input.files[0]);
  }
});
// 拖拽上传
ly_upload_area.addEventListener('dragover', function (ly_e) { ly_e.preventDefault(); ly_upload_area.classList.add('ly_drag_over'); });
ly_upload_area.addEventListener('dragleave', function () { ly_upload_area.classList.remove('ly_drag_over'); });
ly_upload_area.addEventListener('drop', function (ly_e) {
  ly_e.preventDefault();
  ly_upload_area.classList.remove('ly_drag_over');
  if (ly_e.dataTransfer.files.length > 0) {
    ly_upload_file(ly_e.dataTransfer.files[0]);
  }
});
// 文件删除（事件委托）
ly_file_list.addEventListener('click', function (ly_e) {
  const ly_btn = ly_e.target.closest('.ly_file_delete');
  if (ly_btn) {
    ly_delete_file(ly_btn.dataset.ly_id, ly_btn.dataset.ly_name);
  }
});
// 提问
ly_send_btn.addEventListener('click', ly_ask_question);
ly_input.addEventListener('keydown', function (ly_e) {
  if (ly_e.key === 'Enter') { ly_e.preventDefault(); ly_ask_question(); }
});

// 页面初始化：加载文件列表
ly_load_files();
