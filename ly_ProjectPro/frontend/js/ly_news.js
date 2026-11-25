/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 功能名称：科技新闻列表页面交互逻辑
 * 功能说明：页面加载时请求后端接口 /api/news，从 MySQL ly_news 表
 *           获取新闻数据并渲染列表；服务器返回的数据与错误信息均输出到控制台
 */

// 后端接口地址（同时展示在页面接口栏中）
const ly_api_url = '/api/news';

// 功能：在状态区显示提示（加载中 / 失败信息）
function ly_show_status(ly_text, ly_is_fail) {
  const ly_box = document.getElementById('ly_status');
  ly_box.classList.remove('ly_hide', 'ly_loading', 'ly_fail');
  if (ly_text === '') {
    ly_box.classList.add('ly_hide');
    return;
  }
  ly_box.classList.add(ly_is_fail ? 'ly_fail' : 'ly_loading');
  ly_box.textContent = ly_text;
}

// 功能：格式化发布时间为本地可读格式
function ly_format_time(ly_time_str) {
  const ly_date = new Date(ly_time_str);
  const ly_pad = (n) => String(n).padStart(2, '0');
  return `${ly_date.getFullYear()}-${ly_pad(ly_date.getMonth() + 1)}-${ly_pad(ly_date.getDate())} ${ly_pad(ly_date.getHours())}:${ly_pad(ly_date.getMinutes())}`;
}

// 功能：把新闻数组渲染成列表（单条新闻包含标题、摘要、来源、发布时间）
function ly_render_list(ly_news_arr) {
  const ly_list = document.getElementById('ly_news_list');
  ly_list.innerHTML = ly_news_arr.map((ly_item) => `
    <li class="ly_news_item">
      <div class="ly_news_head">
        <h2 class="ly_news_title">${ly_item.title}</h2>
      </div>
      <p class="ly_news_summary">${ly_item.summary}</p>
      <div class="ly_news_meta">
        <span>来源：${ly_item.source}</span>
        <span>发布时间：${ly_format_time(ly_item.publish_time)}</span>
      </div>
    </li>
  `).join('');
}

// 功能：请求后端新闻列表接口并渲染数据（成功与失败均有提示）
async function ly_load_news() {
  ly_show_status('正在加载新闻数据...', false);
  try {
    const ly_res = await fetch(ly_api_url);
    const ly_data = await ly_res.json();
    console.log('服务器返回的数据：', ly_data);

    if (ly_data.code === 0 && Array.isArray(ly_data.data)) {
      // 查询成功：渲染新闻列表
      ly_show_status('', false);
      if (ly_data.data.length === 0) {
        ly_show_status('数据库中暂无新闻数据', false);
        return;
      }
      ly_render_list(ly_data.data);
    } else {
      // 后端返回失败
      console.error('接口返回失败：', ly_data);
      ly_show_status('❌ ' + ly_data.msg, true);
    }
  } catch (ly_err) {
    // 网络异常或服务未启动
    console.error('请求新闻列表异常：', ly_err);
    ly_show_status('❌ 请求异常：' + ly_err.message + '（请确认后端服务是否已启动）', true);
  }
}

// 页面初始化：设置接口链接并加载新闻
document.getElementById('ly_api_link').href = ly_api_url;
document.getElementById('ly_refresh_btn').addEventListener('click', ly_load_news);
ly_load_news();
