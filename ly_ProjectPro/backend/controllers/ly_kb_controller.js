/**
 * 姓名：刘悦 | 学号：24002120220
 * 时间：2026-11-25 | 大模型：GLM-5.3-Flash
 * 功能名称：知识库控制器
 * 功能说明：处理知识库文件上传解析、文件列表、文件删除与 RAG 问答四类请求，
 *           统一返回 JSON 格式 { code, msg, data }，code=0 成功，非 0 失败
 */
const path = require('path');
const fs = require('fs');
const {
  ly_extract_text, ly_split_chunks, ly_save_kb_file,
  ly_get_all_files, ly_delete_kb_file, ly_ask
} = require('../models/ly_kb_model');

// 上传文件存放目录与允许的扩展名
const LY_UPLOAD_DIR = path.join(__dirname, '..', 'knowledge', 'uploads');
const LY_ALLOW_EXT = ['.txt', '.md', '.pdf', '.doc', '.docx', '.pptx', '.ppt'];

// 功能：确保上传目录存在
function ly_ensure_upload_dir() {
  if (!fs.existsSync(LY_UPLOAD_DIR)) {
    fs.mkdirSync(LY_UPLOAD_DIR, { recursive: true });
  }
}

// 功能：修复 multer 对中文文件名的 latin1 误读（busboy 按 latin1 解码导致乱码，
//       表现为名中含 Ã¥ç¨ 之类高 Latin-1 字符；转回 UTF-8 即可还原中文）
function ly_fix_filename(ly_name) {
  try {
    if (/[\u0080-\u00ff]/.test(ly_name)) {
      const ly_fixed = Buffer.from(ly_name, 'latin1').toString('utf8');
      if (ly_fixed && !/[\ufffd]/.test(ly_fixed)) {
        return ly_fixed;
      }
    }
  } catch (ly_e) { /* 转换失败保持原名 */ }
  return ly_name;
}

// 功能：上传并解析知识库文件（POST /api/kb/upload，multipart 表单字段 file）
async function ly_upload_kb_file(req, res) {
  try {
    if (!req.file) {
      return res.json({ code: 1, msg: '请选择要上传的文件', data: null });
    }
    // 解析扩展名并校验格式（先修复中文文件名编码）
    const ly_original_name = ly_fix_filename(req.file.originalname);
    const ly_ext = path.extname(ly_original_name).toLowerCase();
    if (!LY_ALLOW_EXT.includes(ly_ext)) {
      fs.unlinkSync(req.file.path);
      return res.json({ code: 1, msg: '不支持的文件格式，请上传 ' + LY_ALLOW_EXT.join(' / ') + ' 文件', data: null });
    }

    // 解析文本并分块
    const ly_text = await ly_extract_text(req.file.path, ly_ext);
    if (!ly_text || !ly_text.trim()) {
      fs.unlinkSync(req.file.path);
      return res.json({ code: 1, msg: '文件解析后没有可用文本内容', data: null });
    }
    const ly_chunks = ly_split_chunks(ly_text);

    // 入库（file_path 存相对 backend 目录的路径）
    const ly_result = await ly_save_kb_file({
      ly_file_name: ly_original_name,
      ly_file_size: req.file.size,
      ly_file_type: ly_ext.replace('.', ''),
      ly_file_path: path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/'),
    }, ly_chunks);

    console.log('知识库文件上传成功：' + ly_original_name + '，解析为 ' + ly_result.ly_chunk_count + ' 个分块');
    res.json({
      code: 0,
      msg: '上传解析成功',
      data: { ly_file_id: ly_result.ly_file_id, ly_file_name: ly_original_name, ly_chunk_count: ly_result.ly_chunk_count }
    });
  } catch (ly_err) {
    console.error('知识库文件上传异常：', ly_err.message);
    // 解析失败时清理已落盘文件
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) { /* 忽略清理失败 */ }
    }
    res.json({ code: 1, msg: '上传解析失败：' + ly_err.message, data: null });
  }
}

// 功能：获取知识库文件列表（GET /api/kb/files）
async function ly_get_file_list(req, res) {
  try {
    const ly_files = await ly_get_all_files();
    res.json({ code: 0, msg: '查询成功', data: ly_files });
  } catch (ly_err) {
    console.error('知识库文件列表查询异常：', ly_err.message);
    res.json({ code: 1, msg: '查询文件列表失败：' + ly_err.message, data: null });
  }
}

// 功能：删除知识库文件（DELETE /api/kb/files/:id），同时删除数据库记录与磁盘文件
async function ly_delete_file(req, res) {
  try {
    const ly_file_path = await ly_delete_kb_file(req.params.id);
    if (ly_file_path === null) {
      return res.json({ code: 1, msg: '文件不存在或已删除', data: null });
    }
    // 删除磁盘上的物理文件（不存在则忽略）
    const ly_abs = path.join(__dirname, '..', ly_file_path);
    if (fs.existsSync(ly_abs)) {
      fs.unlinkSync(ly_abs);
    }
    res.json({ code: 0, msg: '删除成功', data: null });
  } catch (ly_err) {
    console.error('知识库文件删除异常：', ly_err.message);
    res.json({ code: 1, msg: '删除失败：' + ly_err.message, data: null });
  }
}

// 功能：知识库问答（POST /api/kb/ask，请求体 { ly_question }）
async function ly_post_ask(req, res) {
  const ly_question = (req.body && req.body.ly_question || '').trim();
  if (!ly_question) {
    return res.json({ code: 1, msg: '问题不能为空', data: null });
  }
  try {
    const ly_result = await ly_ask(ly_question);
    res.json({ code: 0, msg: '回答成功', data: ly_result });
  } catch (ly_err) {
    console.error('知识库问答异常：', ly_err.message);
    res.json({ code: 1, msg: '问答失败：' + ly_err.message, data: null });
  }
}

module.exports = { ly_upload_kb_file, ly_get_file_list, ly_delete_file, ly_post_ask, ly_ensure_upload_dir, LY_UPLOAD_DIR, LY_ALLOW_EXT };
