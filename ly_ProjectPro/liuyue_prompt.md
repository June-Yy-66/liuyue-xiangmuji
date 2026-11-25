# 开发指令记录（追加写入，禁止覆盖）

2026-11-20 | 提示词全文：在当前项目根目录创建 AGENTS.md，写入以下规则。

## 项目结构与技术栈
- 前端：frontend/ 目录
  - 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
  - 目录结构：frontend/ 下建 css/、js/、fonts/、images/ 子目录；
    fonts/ 存放 iconfont 图标文件（如果有）
- 后端：backend/ 目录，Node.js + Express，RESTful+MVC 风格，
  所有接口以 /api/ 为前缀，端口固定为 8220
- 使用 express.static 托管 frontend/ 静态资源目录。
- 后端通过 cors 中间件开放全部跨域访问，本配置仅用于课程作业。
- 后端依赖安装：预先将 npm 源切换为国内镜像：
  npm config set registry `https://registry.npmmirror.com`
- 后端依赖安装： npm i 包名
- 数据库：MySQL（用户名 root、密码：liuyue051230）
- 数据库凭据写入 backend/.env（变量名：DB_USER、DB_PASSWORD、DB_HOST、DB_NAME），
  不得出现在代码或 AGENTS.md 中；.env 同时加入 .gitignore
- 根据后端的要求自行建立和修改数据库表，每张表建立后，插入至少 8 条有真实业务意义的测试数据

## 命名与注释
- CSS 类名、JS 变量名、JS 函数名、数据库表名（及字段相关命名）
  一律以 ly_ 开头
- 每个文件头部包含注释块：
  姓名：刘悦 | 学号：24002120220 |
  时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}

## 记录文件（一律追加写入，禁止覆盖已有内容）
- liuyue_prompt.md（项目根目录）：每次向 AI 发出开发指令后，
  追加记录：时间 | 提示词全文 | 大模型名称
- backend/ly_interface.md：每次创建或修改接口后，追加：
  接口路径 | HTTP 方法 | 请求参数（含示例）|
  响应格式（含 JSON 示例）| 修改时间
- backend/ly_database.md：每次建表、改表或插入数据后，
  按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），
  要求仅凭此文件即可在新机器上完整重建数据库
- 统一 JSON 响应格式：{ "code": 0, "msg": "提示信息", "data": {...} }，
  code=0 表示成功，非 0 表示失败

## 前端约定
- 服务器返回的数据和错误信息输出到浏览器控制台（console.log / console.error）；
- 新建 HTML 页面后，在 frontend/index.html 中追加超链接入口；
  文件名包含 detail 的页面除外 | 大模型名称：GLM-5.3-Flash

2026-11-20 | 提示词全文：请初始化本项目：
1、git init + .gitignore（排除 node_modules、.env）+ 首次提交
2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
3、创建前端首页 index.html，包括姓名刘悦、学号24002120220、项目名称、项目类别（自选、模仿），所有完成的 html 页面的超链接。有 canvas 背景动画。主体是页面链接导航。页面美观。
4、创建 readme.md，在根目录下，包括姓名刘悦、学号24002120220。 | 大模型名称：GLM-5.3-Flash

2026-11-20 | 提示词全文：创建运行后台的 bat 文件，放在项目根目录：
1、自动切换到 backend 目录再启动（用 %~dp0，双击时不受当前路径影响）；
2、使用 chcp 65001 避免中文日志乱码；
3、启动命令与 package.json 中的脚本保持一致；
4、结尾加 pause，出错时窗口不关闭。 | 大模型名称：GLM-5.3-Flash

2026-11-20 | 提示词全文：创建 database.html 页面，输入用户名，密码，链接数据库，数据库使用 mysql，成功和错误都有提示，默认用户名 root，密码liuyue051230。 | 大模型名称：GLM-5.3-Flash

2026-11-20 | 提示词全文：完成科技新闻列表页面，新闻的数据存在数据库表里。网页显示后端接口链接和数据内容。 | 大模型名称：GLM-5.3-Flash

2026-11-20 | 提示词全文：完成科技新闻列表页面：
1、在 MySQL 中建表 ly_news，字段包含：id、title、summary、content、source、publish_time、cover_img；
2、插入至少 8 条真实的科技新闻测试数据；
3、后端提供 GET /api/news 接口，返回全部新闻（按发布时间倒序），统一 JSON 格式 { code, msg, data }；
4、新建 frontend/news.html，页面顶部显示当前调用的接口地址，下方以列表展示新闻标题、摘要、来源、时间；
5、数据用 fetch 获取，控制台输出返回数据；
6、把建表与插入数据的 SQL 追加写入 backend/ly_database.md，接口信息追加写入 backend/ly_interface.md，本次提示词追加写入 liuyue_prompt.md；
7、在 frontend/index.html 增加入口链接。
（用户补充确认：字段命名按提示词原文，不加 ly_ 前缀） | 大模型名称：GLM-5.3-Flash

2026-11-20 | 提示词全文：完成图文列表，图片可以使用网络图片或创建图片，创建一个新的表，网页显示后端接口链接和数据内容。
（延续上次确认：新表字段不加 ly_ 前缀，与 ly_news 表风格一致） | 大模型名称：GLM-5.3-Flash

2026-11-20 | 提示词全文：完成图文列表页面：
1、在 MySQL 中新建表 ly_gallery，字段：id、title、description、img_url、category、create_time，插入至少 8 条测试数据；
2、后端提供 GET /api/gallery 接口，返回全部图文数据；
3、新建 frontend/gallery.html，页面顶部显示接口地址，下方用网格布局展示"上图下文"卡片：图片、标题、描述；
4、图片加载失败时显示占位色块，不要出现破图图标；
5、页面适配手机宽度；
6、记录写入 backend/ly_database.md、backend/ly_interface.md 和 liuyue_prompt.md，并在首页加入口。 | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：使用硅基流动API key创建基本AI应用:AI聊天
Api-key：sk-djqsgiuyrgrnqtpcptiuzzloxuaofhmynsmvaexhamehrzhf | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：使用七牛的 api key 完成在线客服页面：
Model ID：qiniu/conatus-free
Api-key：sk-yCJB2klxdHDs2dD1UZnkpofjMWBzjyPZdDRzHki3
OpenAI BaseURL：https://api.qnaigc.com/v1 | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：sk-c9af5798994e84c62793ec15c0c17ddf82f07880ee35c5e8fe1001fa98683083这个可以吗
（更换七牛在线客服 API Key，实测验证有效并更新至 backend/.env） | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理（RAG）：基于本地文件（如 PDF/TXT）上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受自大模型的数据。 | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：完成图像识别功能，上传图片，返回该图片的描述，使用已有的api-key和模型。 | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：实现一个语音识别的功能，使用七牛的Qwen-Audio-3.0-ASR-Flash模型，输入语音，输出文字。
（实测七牛 key 可用模型列表中无任何 ASR 模型，Qwen-Audio-3.0-ASR-Flash 返回 model_not_found，改用硅基流动 Qwen/Qwen3-ASR-1.7B 实现） | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：帮我新建一个模块在index.html中，内容分别是我刚刚让你生成的三个页面的测试截图，将这几个放在一个页面里面，顺序分别为硅基流动大模型测试截图，七牛大模型测试截图，知识库测试截图 | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：这两个页面也添加进去，分别是图像识别功能测试截图和语音识别功能测试截图 | 大模型名称：GLM-5.3-Flash

2026-11-25 | 提示词全文：这几个功能测试截图要像之前的一样，放在一个html网页中，单独做一个板块来放这个截图 | 大模型名称：GLM-5.3-Flash
