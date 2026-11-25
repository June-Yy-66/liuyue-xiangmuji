# 接口记录（追加写入，禁止覆盖）

## 接口：数据库连接测试

- 接口路径：/api/database/connect
- HTTP 方法：POST
- 请求参数（JSON Body）：
  - ly_username（string，必填）：MySQL 用户名，例：root
  - ly_password（string，必填）：MySQL 密码，例：liuyue051230
  - 请求示例：`POST /api/database/connect` Body：`{ "ly_username": "root", "ly_password": "liuyue051230" }`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "数据库连接成功", "data": { "ly_mysql_version": "8.0.36" } }`
  - 失败（密码错误/服务未启动等）：`{ "code": 1, "msg": "数据库连接失败：Access denied for user 'root'@'localhost'", "data": null }`
- 修改时间：2026-11-20

## 接口：科技新闻列表

- 接口路径：/api/news/list
- HTTP 方法：GET
- 请求参数：无
  - 请求示例：`GET /api/news/list`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "查询成功", "data": [ { "ly_id": 1, "ly_title": "国产大模型推理能力再突破，多模态交互进入实用阶段", "ly_source": "科技日报", "ly_category": "人工智能", "ly_summary": "国内研发团队发布新一代大模型……", "ly_publish_time": "2026-11-19T01:30:00.000Z" } ] }`
  - 失败（数据库异常等）：`{ "code": 1, "msg": "查询新闻列表失败：<错误原因>", "data": null }`
- 数据来源：MySQL 数据库 ly_project_db 的 ly_news 表（按发布时间倒序）
- 修改时间：2026-11-20

## 接口：科技新闻列表（修改：路径由 /api/news/list 调整为 /api/news）

- 接口路径：/api/news
- HTTP 方法：GET
- 请求参数：无
  - 请求示例：`GET /api/news`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "查询成功", "data": [ { "id": 1, "title": "国产大模型推理能力再突破，多模态交互进入实用阶段", "summary": "国内研发团队发布新一代大模型……", "content": "11月19日，国内研发团队正式发布新一代大模型……", "source": "科技日报", "publish_time": "2026-11-19T01:30:00.000Z", "cover_img": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=..." } ] }`
  - 失败（数据库异常等）：`{ "code": 1, "msg": "查询新闻列表失败：<错误原因>", "data": null }`
- 数据来源：MySQL 数据库 ly_project_db 的 ly_news 表（字段：id、title、summary、content、source、publish_time、cover_img，按发布时间倒序）
- 修改时间：2026-11-20

## 接口：图文列表

- 接口路径：/api/photos
- HTTP 方法：GET
- 请求参数：无
  - 请求示例：`GET /api/photos`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "查询成功", "data": [ { "id": 1, "title": "未来城市夜景", "description": "霓虹与流光交织的都市夜景……", "image_url": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=...", "publish_time": "2026-11-20T02:00:00.000Z" } ] }`
  - 失败（数据库异常等）：`{ "code": 1, "msg": "查询图文列表失败：<错误原因>", "data": null }`
- 数据来源：MySQL 数据库 ly_project_db 的 ly_photos 表（字段：id、title、description、image_url、publish_time，按发布时间倒序）
- 修改时间：2026-11-20

## 接口：图库图文列表

- 接口路径：/api/gallery
- HTTP 方法：GET
- 请求参数：无
  - 请求示例：`GET /api/gallery`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "查询成功", "data": [ { "id": 1, "title": "量子计算机房探秘", "description": "稀释制冷机层层环绕……", "img_url": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=...", "category": "科技", "create_time": "2026-11-20T01:00:00.000Z" } ] }`
  - 失败（数据库异常等）：`{ "code": 1, "msg": "查询图文数据失败：<错误原因>", "data": null }`
- 数据来源：MySQL 数据库 ly_project_db 的 ly_gallery 表（字段：id、title、description、img_url、category、create_time，按创建时间倒序）
- 修改时间：2026-11-20

## 接口：AI 聊天

- 接口路径：/api/ai/chat
- HTTP 方法：POST
- 请求参数（JSON 请求体）：
  - `ly_message`（string，必填）：本次用户消息
  - `ly_history`（array，选填）：历史对话上下文，元素 `{ "ly_role": "user" | "assistant", "ly_content": "..." }`，后端最多保留 10 条
  - 请求示例：`{ "ly_message": "你好，介绍一下你自己", "ly_history": [{ "ly_role": "user", "ly_content": "你好" }, { "ly_role": "assistant", "ly_content": "你好！我是 AI 助手。" }] }`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "回复成功", "data": { "ly_reply": "你好！我是刘悦课程作业项目中的 AI 助手……" } }`
  - 失败（参数缺失 / Key 无效 / 大模型异常等）：`{ "code": 1, "msg": "AI 回复失败：<错误原因>", "data": null }`
- 数据来源：硅基流动（SiliconFlow）大模型接口 `https://api.siliconflow.cn/v1/chat/completions`，模型 Qwen/Qwen2.5-7B-Instruct；API Key 存于 backend/.env（SILICONFLOW_API_KEY），不下发到浏览器
- 修改时间：2026-11-25

## 接口：在线客服对话

- 接口路径：/api/customer_service/chat
- HTTP 方法：POST
- 请求参数（JSON 请求体）：
  - `ly_message`（string，必填）：本次咨询内容
  - `ly_history`（array，选填）：历史对话上下文，元素 `{ "ly_role": "user" | "assistant", "ly_content": "..." }`，后端最多保留 10 条
  - 请求示例：`{ "ly_message": "这个网站有哪些页面？", "ly_history": [] }`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "回复成功", "data": { "ly_reply": "您好，本网站目前有首页、数据库连接、科技新闻、图文列表、图库、AI 聊天和在线客服页面……" } }`
  - 失败（参数缺失 / Key 无效 / 大模型异常等）：`{ "code": 1, "msg": "客服回复失败：<错误原因>", "data": null }`
- 数据来源：七牛在线客服大模型接口 `https://api.qnaigc.com/v1/chat/completions`（OpenAI 兼容格式），模型 qiniu/conatus-free；API Key 存于 backend/.env（QINIU_CUSTOMER_SERVICE_API_KEY），不下发到浏览器
- 修改时间：2026-11-25

## 接口：知识库文件上传解析

- 接口路径：/api/kb/upload
- HTTP 方法：POST（multipart/form-data）
- 请求参数：
  - `file`（file，必填）：文档文件，支持 .txt / .md / .pdf / .doc / .docx / .pptx / .ppt（.ppt 老格式不支持解析会提示另存为 .pptx），10MB 以内
  - 请求示例：表单字段 `file=@D:\docs\产品手册.docx`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "上传解析成功", "data": { "ly_file_id": 1, "ly_file_name": "产品手册.docx", "ly_chunk_count": 12 } }`
  - 失败（格式不支持 / 解析失败 / 超限）：`{ "code": 1, "msg": "上传解析失败：<原因>", "data": null }`
- 说明：文件保存到 backend/knowledge/uploads/，解析文本按段落分块（每块 ≤600 字）写入 ly_kb_files / ly_kb_chunks 表
- 修改时间：2026-11-25

## 接口：知识库文件列表

- 接口路径：/api/kb/files
- HTTP 方法：GET
- 请求参数：无
- 响应格式：`{ "code": 0, "msg": "查询成功", "data": [ { "id": 1, "file_name": "ly_网站使用说明.txt", "file_size": 2400, "file_type": "txt", "chunk_count": 8, "create_time": "..." } ] }`
- 修改时间：2026-11-25

## 接口：删除知识库文件

- 接口路径：/api/kb/files/:id
- HTTP 方法：DELETE
- 请求参数：URL 路径参数 id（文件 ID）
  - 请求示例：`DELETE /api/kb/files/1`
- 响应格式：成功 `{ "code": 0, "msg": "删除成功", "data": null }`；失败 `{ "code": 1, "msg": "文件不存在或已删除", "data": null }`
- 说明：同时删除 ly_kb_files / ly_kb_chunks 记录与磁盘文件
- 修改时间：2026-11-25

## 接口：知识库 RAG 问答

- 接口路径：/api/kb/ask
- HTTP 方法：POST
- 请求参数（JSON 请求体）：
  - `ly_question`（string，必填）：用户问题
  - 请求示例：`{ "ly_question": "这个网站有哪些功能页面？" }`
- 响应格式：
  - 成功：`{ "code": 0, "msg": "回答成功", "data": { "ly_reply": "根据知识库，本网站包含……", "ly_sources": [ { "ly_file_name": "ly_网站使用说明.txt", "ly_chunk_index": 2, "ly_content": "（命中的原文片段，最长 200 字）" } ] } }`
  - 失败：`{ "code": 1, "msg": "问答失败：<原因>", "data": null }`
- 说明：RAG 流程——关键词评分检索 ly_kb_chunks 取最相关 4 块拼入提示词，调用七牛大模型（qiniu/conatus-free）生成答案；发送给大模型与大模型返回的完整数据会输出到服务端控制台
- 修改时间：2026-11-25

## 接口：图像识别

- 接口路径：/api/vision/recognize
- HTTP 方法：POST（multipart/form-data）
- 请求参数：
  - `file`（file，必填）：图片文件，支持 jpg / png / webp / gif，5MB 以内
  - 请求示例：表单字段 `file=@D:\images\photo.jpg`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "识别成功", "data": { "ly_file_name": "photo.jpg", "ly_description": "这是一张……" } }`
  - 失败（格式不支持 / 超限 / 模型异常）：`{ "code": 1, "msg": "识别失败：<原因>", "data": null }`
- 数据来源：硅基流动视觉大模型接口 `https://api.siliconflow.cn/v1/chat/completions`（OpenAI 兼容格式，图片以 base64 data URL 内嵌），模型 Qwen/Qwen3-VL-8B-Instruct；API Key 存于 backend/.env（SILICONFLOW_API_KEY + SILICONFLOW_VISION_MODEL），不下发到浏览器；发送给大模型与大模型返回的数据输出到服务端控制台
- 修改时间：2026-11-25

## 接口：语音识别（ASR 语音转文字）

- 接口路径：/api/asr/recognize
- HTTP 方法：POST（multipart/form-data）
- 请求参数：
  - `file`（file，必填）：音频文件，支持 wav / mp3 / m4a / webm / ogg / flac，15MB 以内
  - 请求示例：表单字段 `file=@D:\audio\record.webm`
- 响应格式（统一 JSON）：
  - 成功：`{ "code": 0, "msg": "识别成功", "data": { "ly_file_name": "record.webm", "ly_text": "今天天气真好", "ly_language": "zh", "ly_duration_seconds": 4 } }`
  - 无语音内容：`{ "code": 0, "msg": "识别完成（音频中没有检测到可识别的语音）", "data": { "ly_text": "", ... } }`
  - 失败：`{ "code": 1, "msg": "识别失败：<原因>", "data": null }`
- 数据来源：硅基流动语音转文字接口 `https://api.siliconflow.cn/v1/audio/transcriptions`（OpenAI Whisper 兼容格式），模型 Qwen/Qwen3-ASR-1.7B；API Key 存于 backend/.env（SILICONFLOW_API_KEY + SILICONFLOW_ASR_MODEL）；发送与返回的数据输出到服务端控制台。
  说明：用户指定的七牛模型 Qwen-Audio-3.0-ASR-Flash 在七牛 key 可用模型列表（91 个）中不存在（直连返回 model_not_found），故改用硅基流动的 Qwen 官方 ASR 模型实现
- 修改时间：2026-11-25
