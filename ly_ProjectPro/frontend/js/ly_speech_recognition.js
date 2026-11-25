/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：语音识别页面交互逻辑（ASR）
 * 功能说明：① 麦克风录音模式：MediaRecorder 采集音频，录音结束生成 Blob，
 *              可预览播放后发送识别；
 *           ② 文件上传模式：选择/拖拽音频文件直接识别；
 *           音频统一 POST 到后端 /api/asr/recognize（multipart），由后端调用
 *           硅基流动 Qwen3-ASR 模型返回文字；服务器返回的数据和错误信息均
 *           输出到浏览器控制台
 */

// 后端语音识别接口地址
const ly_api_url = '/api/asr/recognize';

// DOM 引用
const ly_tab_record = document.getElementById('ly_tab_record');
const ly_tab_upload = document.getElementById('ly_tab_upload');
const ly_panel_record = document.getElementById('ly_panel_record');
const ly_panel_upload = document.getElementById('ly_panel_upload');
const ly_record_btn = document.getElementById('ly_record_btn');
const ly_record_box = ly_record_btn.parentElement;
const ly_record_label = document.getElementById('ly_record_label');
const ly_record_time = document.getElementById('ly_record_time');
const ly_record_player = document.getElementById('ly_record_player');
const ly_record_recognize_btn = document.getElementById('ly_record_recognize_btn');
const ly_upload_area = document.getElementById('ly_upload_area');
const ly_file_input = document.getElementById('ly_file_input');
const ly_upload_btn = document.getElementById('ly_upload_btn');
const ly_upload_text = document.getElementById('ly_upload_text');
const ly_status = document.getElementById('ly_status');
const ly_result = document.getElementById('ly_result');
const ly_result_text = document.getElementById('ly_result_text');
const ly_result_meta = document.getElementById('ly_result_meta');

// 录音状态
let ly_media_recorder = null;
let ly_recorded_blob = null;
let ly_record_chunks = [];
let ly_record_timer = null;
let ly_record_seconds = 0;

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

// 功能：展示识别结果（文字 + 元信息）
function ly_show_result(ly_data) {
  ly_result_text.textContent = ly_data.ly_text || '（未识别到语音内容）';
  const ly_meta_parts = [];
  if (ly_data.ly_language) { ly_meta_parts.push('语言：' + ly_data.ly_language); }
  if (ly_data.ly_duration_seconds) { ly_meta_parts.push('音频时长：' + ly_data.ly_duration_seconds + ' 秒'); }
  if (ly_data.ly_file_name) { ly_meta_parts.push('文件：' + ly_data.ly_file_name); }
  ly_result_meta.textContent = ly_meta_parts.join(' · ');
  ly_result_meta.classList.toggle('ly_hide', ly_meta_parts.length === 0);
  ly_result.classList.remove('ly_hide');
}

// 功能：把音频 Blob 发送到后端识别（录音与上传共用）
async function ly_recognize_audio(ly_blob, ly_file_name) {
  ly_show_status('🎙️ 正在识别语音「' + ly_file_name + '」，请稍候...', false);
  ly_result.classList.add('ly_hide');
  ly_record_recognize_btn.disabled = true;
  ly_upload_btn.disabled = true;
  try {
    const ly_form = new FormData();
    ly_form.append('file', ly_blob, ly_file_name);
    const ly_res = await fetch(ly_api_url, { method: 'POST', body: ly_form });
    const ly_data = await ly_res.json();
    console.log('服务器返回的数据：', ly_data);

    if (ly_data.code === 0 && ly_data.data) {
      ly_show_status('', false);
      ly_show_result(ly_data.data);
    } else {
      console.error('接口返回失败：', ly_data);
      ly_show_status('❌ ' + ly_data.msg, true);
    }
  } catch (ly_err) {
    console.error('请求语音识别接口异常：', ly_err);
    ly_show_status('❌ 请求异常：' + ly_err.message + '（请确认后端服务是否已启动）', true);
  } finally {
    ly_record_recognize_btn.disabled = false;
    ly_upload_btn.disabled = false;
  }
}

// 功能：开始录音（请求麦克风权限，MediaRecorder 采集）
async function ly_start_record() {
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    ly_show_status('❌ 当前浏览器不支持录音功能，请使用上传音频文件方式', true);
    return;
  }
  try {
    const ly_stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // 优先选择浏览器支持的编码格式
    const ly_mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
    ly_media_recorder = ly_mime ? new MediaRecorder(ly_stream, { mimeType: ly_mime }) : new MediaRecorder(ly_stream);
    ly_record_chunks = [];
    ly_recorded_blob = null;

    // 收集录音数据块
    ly_media_recorder.ondataavailable = function (ly_e) {
      if (ly_e.data.size > 0) { ly_record_chunks.push(ly_e.data); }
    };
    // 录音结束：合成 Blob 并生成预览
    ly_media_recorder.onstop = function () {
      ly_recorded_blob = new Blob(ly_record_chunks, { type: ly_media_recorder.mimeType || 'audio/webm' });
      ly_record_player.src = URL.createObjectURL(ly_recorded_blob);
      ly_record_player.classList.remove('ly_hide');
      ly_record_recognize_btn.classList.remove('ly_hide');
      ly_record_label.textContent = '点击开始录音';
      ly_record_box.classList.remove('ly_recording');
      ly_show_status('✅ 录音完成（' + ly_record_seconds + ' 秒），可直接播放试听或点击"开始识别"', false);
      // 关闭麦克风
      ly_stream.getTracks().forEach(function (ly_track) { ly_track.stop(); });
    };

    ly_media_recorder.start();
    ly_record_box.classList.add('ly_recording');
    ly_record_label.textContent = '点击停止录音';
    ly_record_seconds = 0;
    ly_record_time.textContent = '00:00';
    ly_record_time.classList.remove('ly_hide');
    // 计时器：每秒刷新录音时长
    ly_record_timer = setInterval(function () {
      ly_record_seconds++;
      const ly_m = String(Math.floor(ly_record_seconds / 60)).padStart(2, '0');
      const ly_s = String(ly_record_seconds % 60).padStart(2, '0');
      ly_record_time.textContent = ly_m + ':' + ly_s;
    }, 1000);
    ly_show_status('', false);
  } catch (ly_err) {
    console.error('获取麦克风权限异常：', ly_err);
    ly_show_status('❌ 无法使用麦克风：' + ly_err.message + '（请检查浏览器权限设置）', true);
  }
}

// 录音按钮：开始/停止切换
ly_record_btn.addEventListener('click', function () {
  if (ly_media_recorder && ly_media_recorder.state === 'recording') {
    // 停止录音
    clearInterval(ly_record_timer);
    ly_record_time.classList.add('ly_hide');
    ly_media_recorder.stop();
  } else {
    ly_start_record();
  }
});

// 录音识别按钮
ly_record_recognize_btn.addEventListener('click', function () {
  if (ly_recorded_blob) {
    ly_recognize_audio(ly_recorded_blob, 'ly_record.webm');
  }
});

// 模式切换：录音 / 上传
ly_tab_record.addEventListener('click', function () {
  ly_tab_record.classList.add('ly_tab_active');
  ly_tab_upload.classList.remove('ly_tab_active');
  ly_panel_record.classList.remove('ly_hide');
  ly_panel_upload.classList.add('ly_hide');
});
ly_tab_upload.addEventListener('click', function () {
  ly_tab_upload.classList.add('ly_tab_active');
  ly_tab_record.classList.remove('ly_tab_active');
  ly_panel_upload.classList.remove('ly_hide');
  ly_panel_record.classList.add('ly_hide');
});

// 上传模式交互：点击选择、拖拽
ly_upload_btn.addEventListener('click', function () { ly_file_input.click(); });
ly_upload_area.addEventListener('click', function (ly_e) {
  if (ly_e.target === ly_upload_area || ly_e.target.classList.contains('ly_upload_icon') || ly_e.target.classList.contains('ly_upload_text')) {
    ly_file_input.click();
  }
});
ly_file_input.addEventListener('change', function () {
  if (ly_file_input.files.length > 0) {
    ly_recognize_audio(ly_file_input.files[0], ly_file_input.files[0].name);
    ly_file_input.value = '';
  }
});
ly_upload_area.addEventListener('dragover', function (ly_e) { ly_e.preventDefault(); ly_upload_area.classList.add('ly_drag_over'); });
ly_upload_area.addEventListener('dragleave', function () { ly_upload_area.classList.remove('ly_drag_over'); });
ly_upload_area.addEventListener('drop', function (ly_e) {
  ly_e.preventDefault();
  ly_upload_area.classList.remove('ly_drag_over');
  if (ly_e.dataTransfer.files.length > 0) {
    ly_recognize_audio(ly_e.dataTransfer.files[0], ly_e.dataTransfer.files[0].name);
  }
});
