/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：知识库数据模型（解析 / 分块 / 检索 / RAG 问答）
 * 功能说明：
 *   1. 支持解析 txt、md、doc、docx、pptx、pdf 格式文件为纯文本（.ppt 老二进制
 *      格式无纯 JS 解析方案，会提示另存为 .pptx）；
 *   2. 文本按段落分块写入 MySQL（ly_kb_files / ly_kb_chunks 两张表）；
 *   3. 提问时对全部分块做关键词评分检索（RAG），把最相关的片段拼入提示词
 *      交给七牛客服大模型生成答案；
 *   4. 发送给大模型与大模型返回的数据都会输出到服务端控制台（console.log）。
 */
const fs = require('fs');
const path = require('path');
const ly_pool = require('../config/ly_db');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const JSZip = require('jszip');

// 从 .env 读取七牛客服大模型配置（与在线客服共用同一服务）
const ly_api_key = process.env.QINIU_CUSTOMER_SERVICE_API_KEY;
const ly_base_url = (process.env.QINIU_CUSTOMER_SERVICE_BASE_URL || 'https://api.qnaigc.com/v1').replace(/\/$/, '');
const ly_model = process.env.QINIU_CUSTOMER_SERVICE_MODEL || 'qiniu/conatus-free';

// 分块与检索参数
const LY_CHUNK_MAX = 600;   // 每块最大字符数
const LY_TOP_K = 4;         // 检索返回的最相关块数

// 功能：按文件扩展名把文件解析为纯文本
async function ly_extract_text(ly_file_path, ly_ext) {
  switch (ly_ext) {
    case '.txt':
    case '.md':
      // 纯文本直接读取
      return fs.readFileSync(ly_file_path, 'utf8');
    case '.docx':
      // docx 用 mammoth 提取正文
      {
        const ly_result = await mammoth.extractRawText({ path: ly_file_path });
        return ly_result.value;
      }
    case '.doc':
      // 老版 doc 用 word-extractor 提取正文
      {
        const ly_extractor = new WordExtractor();
        const ly_doc = await ly_extractor.extract(ly_file_path);
        return ly_doc.getBody();
      }
    case '.pptx':
      // pptx 本质是 zip：解析每张幻灯片 XML 里的 <a:t> 文本节点
      {
        const ly_zip = await JSZip.loadAsync(fs.readFileSync(ly_file_path));
        const ly_slide_names = Object.keys(ly_zip.files)
          .filter((ly_name) => /^ppt\/slides\/slide\d+\.xml$/.test(ly_name))
          .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
        const ly_parts = [];
        for (const ly_name of ly_slide_names) {
          const ly_xml = await ly_zip.files[ly_name].async('string');
          const ly_matches = ly_xml.match(/<a:t>[\s\S]*?<\/a:t>/g) || [];
          const ly_text = ly_matches.map((m) => m.replace(/<\/?a:t>/g, '')).join(' ');
          if (ly_text.trim()) {
            ly_parts.push('【幻灯片 ' + (ly_parts.length + 1) + '】' + ly_text.trim());
          }
        }
        return ly_parts.join('\n\n');
      }
    case '.pdf':
      // pdf 用 pdf-parse 提取文本（直接引内部模块避免其测试代码副作用）
      {
        const ly_parse = require('pdf-parse/lib/pdf-parse.js');
        const ly_data = await ly_parse(fs.readFileSync(ly_file_path));
        return ly_data.text;
      }
    case '.ppt':
      // 老版二进制 ppt 无可靠纯 JS 解析方案
      throw new Error('暂不支持 .ppt 老格式解析，请在 PowerPoint/WPS 中另存为 .pptx 后重新上传');
    default:
      throw new Error('不支持的文件格式：' + ly_ext);
  }
}

// 功能：把长文本按段落合并分块（每块不超过 LY_CHUNK_MAX 字符），返回块数组
function ly_split_chunks(ly_text) {
  // 先按空行切成段落，再合并相邻段落成块
  const ly_paras = ly_text.split(/\n\s*\n/).map((s) => s.replace(/\s+\n/g, '\n').trim()).filter(Boolean);
  const ly_chunks = [];
  let ly_cur = '';
  for (const ly_para of ly_paras) {
    // 单段超长时按句号等标点硬切
    if (ly_para.length > LY_CHUNK_MAX) {
      if (ly_cur) { ly_chunks.push(ly_cur.trim()); ly_cur = ''; }
      let ly_buf = '';
      for (const ly_sent of ly_para.split(/(?<=[。！？；!?;])/)) {
        if ((ly_buf + ly_sent).length > LY_CHUNK_MAX) { ly_chunks.push(ly_buf.trim()); ly_buf = ly_sent; }
        else { ly_buf += ly_sent; }
      }
      if (ly_buf.trim()) { ly_cur = ly_buf.trim(); }
      continue;
    }
    if ((ly_cur + '\n' + ly_para).trim().length > LY_CHUNK_MAX) {
      ly_chunks.push(ly_cur.trim());
      ly_cur = ly_para;
    } else {
      ly_cur = ly_cur ? ly_cur + '\n' + ly_para : ly_para;
    }
  }
  if (ly_cur.trim()) { ly_chunks.push(ly_cur.trim()); }
  return ly_chunks;
}

// 功能：保存文件记录与全部分块到数据库，返回 { fileId, chunkCount }
async function ly_save_kb_file(ly_meta, ly_chunks) {
  const ly_conn = await ly_pool.getConnection();
  try {
    await ly_conn.beginTransaction();
    const [ly_file_result] = await ly_conn.query(
      'INSERT INTO ly_kb_files (file_name, file_size, file_type, file_path, chunk_count) VALUES (?, ?, ?, ?, ?)',
      [ly_meta.ly_file_name, ly_meta.ly_file_size, ly_meta.ly_file_type, ly_meta.ly_file_path, ly_chunks.length]
    );
    const ly_file_id = ly_file_result.insertId;
    for (let i = 0; i < ly_chunks.length; i++) {
      await ly_conn.query(
        'INSERT INTO ly_kb_chunks (file_id, chunk_index, content) VALUES (?, ?, ?)',
        [ly_file_id, i + 1, ly_chunks[i]]
      );
    }
    await ly_conn.commit();
    return { ly_file_id: ly_file_id, ly_chunk_count: ly_chunks.length };
  } catch (ly_err) {
    await ly_conn.rollback();
    throw ly_err;
  } finally {
    ly_conn.release();
  }
}

// 功能：查询全部知识库文件（按上传时间倒序）
async function ly_get_all_files() {
  const [ly_rows] = await ly_pool.query(
    'SELECT id, file_name, file_size, file_type, chunk_count, create_time FROM ly_kb_files ORDER BY id DESC'
  );
  return ly_rows;
}

// 功能：删除知识库文件及其全部分块，返回磁盘路径供调用方删除物理文件
async function ly_delete_kb_file(ly_file_id) {
  const ly_conn = await ly_pool.getConnection();
  try {
    await ly_conn.beginTransaction();
    const [ly_files] = await ly_conn.query('SELECT file_path FROM ly_kb_files WHERE id = ? FOR UPDATE', [ly_file_id]);
    if (ly_files.length === 0) {
      await ly_conn.rollback();
      return null;
    }
    await ly_conn.query('DELETE FROM ly_kb_chunks WHERE file_id = ?', [ly_file_id]);
    await ly_conn.query('DELETE FROM ly_kb_files WHERE id = ?', [ly_file_id]);
    await ly_conn.commit();
    return ly_files[0].file_path;
  } catch (ly_err) {
    await ly_conn.rollback();
    throw ly_err;
  } finally {
    ly_conn.release();
  }
}

// 功能：简单中英文分词（中文长词再切 2-gram，英文取连续字母数字）
function ly_tokenize(ly_text) {
  const ly_raw = ly_text.toLowerCase().match(/[\u4e00-\u9fa5]+|[a-z0-9]+/g) || [];
  const ly_tokens = [];
  for (const ly_seg of ly_raw) {
    if (/^[\u4e00-\u9fa5]+$/.test(ly_seg)) {
      if (ly_seg.length <= 2) {
        ly_tokens.push(ly_seg);
      } else {
        // 中文按 2 字滑窗切词
        for (let i = 0; i + 2 <= ly_seg.length; i++) {
          ly_tokens.push(ly_seg.slice(i, i + 2));
        }
      }
    } else {
      ly_tokens.push(ly_seg);
    }
  }
  return ly_tokens;
}

// 功能：关键词评分检索知识库分块，返回最相关的 LY_TOP_K 块（含文件名）
async function ly_search_chunks(ly_question) {
  const ly_query_tokens = ly_tokenize(ly_question);
  if (ly_query_tokens.length === 0) { return []; }
  const [ly_rows] = await ly_pool.query(
    'SELECT c.id, c.content, c.chunk_index, f.file_name FROM ly_kb_chunks c JOIN ly_kb_files f ON c.file_id = f.id'
  );
  // 对每个分块统计查询词命中：命中不同词数 * 3 + 命中总次数
  const ly_scored = [];
  for (const ly_row of ly_rows) {
    const ly_content_lower = ly_row.content.toLowerCase();
    const ly_hit_tokens = new Set();
    let ly_hit_total = 0;
    for (const ly_token of ly_query_tokens) {
      let ly_idx = ly_content_lower.indexOf(ly_token);
      let ly_count = 0;
      while (ly_idx !== -1) {
        ly_count++;
        ly_idx = ly_content_lower.indexOf(ly_token, ly_idx + ly_token.length);
      }
      if (ly_count > 0) {
        ly_hit_tokens.add(ly_token);
        ly_hit_total += ly_count;
      }
    }
    const ly_score = ly_hit_tokens.size * 3 + ly_hit_total;
    if (ly_score > 0) {
      ly_scored.push({ ly_content: ly_row.content, ly_chunk_index: ly_row.chunk_index, ly_file_name: ly_row.file_name, ly_score: ly_score });
    }
  }
  ly_scored.sort((a, b) => b.ly_score - a.ly_score);
  return ly_scored.slice(0, LY_TOP_K);
}

// 功能：RAG 问答主流程——检索相关分块 → 拼提示词 → 调用大模型 → 返回答案与引用来源
async function ly_ask(ly_question) {
  if (!ly_api_key) {
    throw new Error('未配置 API Key（请检查 backend/.env 的 QINIU_CUSTOMER_SERVICE_API_KEY）');
  }

  // 第 1 步：检索知识库
  const ly_related = await ly_search_chunks(ly_question);

  // 第 2 步：组装提示词（检索到内容时限定模型依据知识库回答）
  const ly_messages = [
    { role: 'system', content: '你是“刘悦的项目集”网站的知识库问答助手。请仅依据用户提供的知识库片段回答问题，使用简体中文；若知识库片段不足以回答，请明确说明“知识库中没有相关内容”。' }
  ];
  if (ly_related.length > 0) {
    const ly_context = ly_related
      .map((ly_item, i) => '[片段' + (i + 1) + '｜来源：' + ly_item.ly_file_name + '｜块' + ly_item.ly_chunk_index + ']\n' + ly_item.ly_content)
      .join('\n\n');
    ly_messages.push({ role: 'user', content: '知识库片段：\n' + ly_context + '\n\n用户问题：' + ly_question });
  } else {
    ly_messages.push({ role: 'user', content: '知识库中未检索到与问题相关的内容，请直接告知用户知识库中没有相关内容。\n\n用户问题：' + ly_question });
  }

  // 第 3 步：输出将要发送给大模型的完整数据（控制台）
  console.log('========== [RAG] 发送给大模型的数据 ==========');
  console.log('接口地址：' + ly_base_url + '/chat/completions');
  console.log('模型：' + ly_model);
  console.log('命中的知识库块数：' + ly_related.length);
  console.log(JSON.stringify({ model: ly_model, messages: ly_messages }, null, 2));

  // 第 4 步：调用大模型（OpenAI 兼容格式）
  const ly_res = await fetch(ly_base_url + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + ly_api_key
    },
    body: JSON.stringify({ model: ly_model, messages: ly_messages, temperature: 0.5, max_tokens: 1024 })
  });
  const ly_data = await ly_res.json();
  if (!ly_res.ok) {
    throw new Error(ly_data.message || ('大模型接口返回 HTTP ' + ly_res.status));
  }

  // 第 5 步：输出大模型返回的完整数据（控制台）
  console.log('========== [RAG] 大模型返回的数据 ==========');
  console.log(JSON.stringify(ly_data, null, 2));

  const ly_reply = ly_data.choices && ly_data.choices[0] && ly_data.choices[0].message && ly_data.choices[0].message.content;
  if (!ly_reply) {
    throw new Error('大模型未返回回复内容');
  }
  return {
    ly_reply: ly_reply,
    ly_sources: ly_related.map((ly_item) => ({
      ly_file_name: ly_item.ly_file_name,
      ly_chunk_index: ly_item.ly_chunk_index,
      ly_content: ly_item.ly_content.length > 200 ? ly_item.ly_content.slice(0, 200) + '……' : ly_item.ly_content
    }))
  };
}

module.exports = { ly_extract_text, ly_split_chunks, ly_save_kb_file, ly_get_all_files, ly_delete_kb_file, ly_ask };
