/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：图像识别页面交互逻辑
 * 功能说明：选择/拖拽图片后立即本地预览，并 POST 到后端 /api/vision/recognize
 *           （multipart 格式），由后端调用硅基流动视觉大模型返回图片描述；
 *           识别中显示加载提示；服务器返回的数据和错误信息均输出到浏览器控制台
 */

// 后端图像识别接口地址
const ly_api_url = '/api/vision/recognize';

// DOM 引用
const ly_upload_area = document.getElementById('ly_upload_area');
const ly_file_input = document.getElementById('ly_file_input');
const ly_upload_btn = document.getElementById('ly_upload_btn');
const ly_upload_text = document.getElementById('ly_upload_text');
const ly_preview_img = document.getElementById('ly_preview_img');
const ly_preview_tip = document.getElementById('ly_preview_tip');
const ly_status = document.getElementById('ly_status');
const ly_result = document.getElementById('ly_result');
const ly_result_text = document.getElementById('ly_result_text');

// 功能：显示/隐藏状态条
function ly_show_status(ly_text, ly_is_fail) {
  if (!ly_text) {
    ly_status.classList.add('ly_hide');
    return;
  }
  ly_status.textContent = ly_text;
  ly_status.classList.remove('ly_hide', 'ly_info', 'ly_fail');
  ly_status.classList.add(ly_is_fail ? 'ly_fail' : 'ly_info');
}

// 功能：识别主流程——本地预览 + 上传到后端 + 展示识别结果
async function ly_recognize(ly_file) {
  // 校验文件类型与大小（前端先拦一道，与后端校验一致）
  if (!/^image\/(jpeg|png|webp|gif)$/.test(ly_file.type)) {
    ly_show_status('❌ 仅支持 jpg / png / webp / gif 格式图片', true);
    return;
  }
  if (ly_file.size > 5 * 1024 * 1024) {
    ly_show_status('❌ 图片大小不能超过 5MB', true);
    return;
  }

  // 本地预览（URL.createObjectURL 生成临时地址）
  ly_preview_img.src = URL.createObjectURL(ly_file);
  ly_preview_img.classList.remove('ly_hide');
  ly_preview_tip.classList.add('ly_hide');

  // 识别中：禁用按钮 + 显示加载提示
  ly_upload_btn.disabled = true;
  ly_show_status('🖼️ 正在上传并识别图片「' + ly_file.name + '」，请稍候...', false);
  ly_result.classList.add('ly_hide');

  try {
    const ly_form = new FormData();
    ly_form.append('file', ly_file);
    const ly_res = await fetch(ly_api_url, { method: 'POST', body: ly_form });
    const ly_data = await ly_res.json();
    console.log('服务器返回的数据：', ly_data);

    if (ly_data.code === 0 && ly_data.data) {
      // 识别成功：展示描述
      ly_show_status('', false);
      ly_result_text.textContent = ly_data.data.ly_description;
      ly_result.classList.remove('ly_hide');
    } else {
      console.error('接口返回失败：', ly_data);
      ly_show_status('❌ ' + ly_data.msg, true);
    }
  } catch (ly_err) {
    console.error('请求图像识别接口异常：', ly_err);
    ly_show_status('❌ 请求异常：' + ly_err.message + '（请确认后端服务是否已启动）', true);
  } finally {
    ly_upload_btn.disabled = false;
    ly_upload_text.textContent = '点击选择或拖拽图片到此处';
    ly_file_input.value = '';
  }
}

// 交互绑定：点击选择、拖拽上传
ly_upload_btn.addEventListener('click', function () { ly_file_input.click(); });
ly_upload_area.addEventListener('click', function (ly_e) {
  if (ly_e.target === ly_upload_area || ly_e.target.classList.contains('ly_upload_icon') || ly_e.target.classList.contains('ly_upload_text')) {
    ly_file_input.click();
  }
});
ly_file_input.addEventListener('change', function () {
  if (ly_file_input.files.length > 0) {
    ly_recognize(ly_file_input.files[0]);
  }
});
ly_upload_area.addEventListener('dragover', function (ly_e) { ly_e.preventDefault(); ly_upload_area.classList.add('ly_drag_over'); });
ly_upload_area.addEventListener('dragleave', function () { ly_upload_area.classList.remove('ly_drag_over'); });
ly_upload_area.addEventListener('drop', function (ly_e) {
  ly_e.preventDefault();
  ly_upload_area.classList.remove('ly_drag_over');
  if (ly_e.dataTransfer.files.length > 0) {
    ly_recognize(ly_e.dataTransfer.files[0]);
  }
});
