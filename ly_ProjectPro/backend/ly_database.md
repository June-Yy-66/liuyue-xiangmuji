# 数据库操作记录（追加写入，禁止覆盖）
# 仅凭本文件即可在新机器上完整重建数据库

## 2026-11-20：新建科技新闻表 ly_news 并插入 10 条测试数据

```sql
CREATE DATABASE IF NOT EXISTS ly_project_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE ly_project_db;

DROP TABLE IF EXISTS ly_news;

CREATE TABLE ly_news (
  ly_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '新闻ID',
  ly_title VARCHAR(200) NOT NULL COMMENT '新闻标题',
  ly_source VARCHAR(100) NOT NULL COMMENT '新闻来源',
  ly_category VARCHAR(50) NOT NULL DEFAULT '科技' COMMENT '新闻分类',
  ly_summary VARCHAR(500) NOT NULL COMMENT '新闻摘要',
  ly_publish_time DATETIME NOT NULL COMMENT '发布时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';

INSERT INTO ly_news (ly_title, ly_source, ly_category, ly_summary, ly_publish_time) VALUES
('国产大模型推理能力再突破，多模态交互进入实用阶段', '科技日报', '人工智能', '国内研发团队发布新一代大模型，复杂推理评测成绩提升明显，多模态交互能力开始在教育、办公等场景规模化落地。', '2026-11-19 09:30:00'),
('全球首条1.6T光子互联芯片产线投产', '电子工程世界', '芯片', '该产线采用光子互联技术替代传统铜互连，芯片间通信带宽提升至1.6Tbps，功耗下降约30%，将优先用于数据中心。', '2026-11-18 14:20:00'),
('新一代国产操作系统发布，支持全栈自主可控', '人民网', '操作系统', '新系统覆盖桌面、服务器与嵌入式三大场景，软件生态兼容适配清单超过10万款，关键行业完成迁移验证。', '2026-11-17 10:05:00'),
('可回收火箭完成第十次复用飞行，商业发射成本再降', '新华社', '商业航天', '国内商业航天公司的一子级火箭第十次成功回收，单次发射成本较首次下降超过60%，今年已执行32次商业任务。', '2026-11-16 16:40:00'),
('量子计算原型机实现千比特级纠缠操控', '中国科学院', '量子计算', '科研团队在超导路线上实现千比特规模纠缠态制备与读取，为容错量子计算迈出关键一步，成果发表于国际期刊。', '2026-11-15 11:15:00'),
('固态电池量产车型正式交付，续航突破1500公里', '第一财经', '新能源', '首批搭载全固态电池的量产车型交付用户，能量密度达每公斤500瓦时，快充10分钟可补能800公里续航。', '2026-11-14 09:00:00'),
('6G试验卫星完成组网，天地一体通信时延降至毫秒级', '央视新闻', '通信技术', '12颗低轨试验卫星组网成功，与地面移动网络深度融合，实测端到端时延低于10毫秒，覆盖远海与偏远山区。', '2026-11-13 18:25:00'),
('AI辅助研发新药获批上市，临床周期缩短40%', '健康界', '生物医药', '由人工智能平台参与筛选的新药获得上市批准，从靶点发现到获批仅用时4年，研发成本大幅降低。', '2026-11-12 15:50:00'),
('人形机器人批量进入工厂，实现柔性产线协同作业', '澎湃新闻', '机器人', '多家制造企业引入人形机器人承担搬运与质检工作，与人类工人同线协作，单线人力成本下降约35%。', '2026-11-11 13:35:00'),
('脑机接口临床试验取得进展，瘫痪患者重获行动能力', '科技日报', '脑机接口', '新型侵入式脑机接口完成多例临床试验，受试者可通过意念精准控制外骨骼行走，信号解码准确率达94%。', '2026-11-10 08:45:00');
```

## 2026-11-20：按新需求重建 ly_news 表（字段调整为 id、title、summary、content、source、publish_time、cover_img），插入 10 条测试数据

```sql
USE ly_project_db;

DROP TABLE IF EXISTS ly_news;

CREATE TABLE ly_news (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '新闻ID',
  title VARCHAR(200) NOT NULL COMMENT '新闻标题',
  summary VARCHAR(500) NOT NULL COMMENT '新闻摘要',
  content TEXT NOT NULL COMMENT '新闻正文',
  source VARCHAR(100) NOT NULL COMMENT '新闻来源',
  publish_time DATETIME NOT NULL COMMENT '发布时间',
  cover_img VARCHAR(500) DEFAULT NULL COMMENT '封面图片地址'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';

INSERT INTO ly_news (title, summary, content, source, publish_time, cover_img) VALUES
('国产大模型推理能力再突破，多模态交互进入实用阶段', '国内研发团队发布新一代大模型，复杂推理评测成绩提升明显，多模态交互能力开始在教育、办公等场景规模化落地。', '11月19日，国内研发团队正式发布新一代大模型。在多项权威复杂推理评测中，该模型成绩较上一代提升约28%，数学与代码能力进入国际第一梯队。更重要的是，模型原生支持图像、语音与文档的联合理解，多模态交互能力开始在教育、办公、客服等场景规模化落地。据发布会披露，已有超过300家企业接入测试，预计明年上半年全面开放商用API。', '科技日报', '2026-11-19 09:30:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artificial%20intelligence%20neural%20network%20concept%2C%20glowing%20digital%20brain%2C%20futuristic%20blue%20technology%20background&image_size=landscape_16_9'),
('全球首条1.6T光子互联芯片产线投产', '该产线采用光子互联技术替代传统铜互连，芯片间通信带宽提升至1.6Tbps，功耗下降约30%，将优先用于数据中心。', '全球首条1.6T光子互联芯片产线于11月18日正式投产。该产线以硅光技术为核心，用光子互联替代传统铜互连，芯片间通信带宽提升至1.6Tbps，同时整体功耗下降约30%。业内分析认为，随着AI算力集群规模扩大，光子互联将成为数据中心网络升级的关键路径，首批产品将优先供应头部云厂商。', '电子工程世界', '2026-11-18 14:20:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=close%20up%20of%20advanced%20semiconductor%20chip%20on%20circuit%20board%2C%20photonics%20optical%20interconnect%2C%20blue%20tech%20lighting&image_size=landscape_16_9'),
('新一代国产操作系统发布，支持全栈自主可控', '新系统覆盖桌面、服务器与嵌入式三大场景，软件生态兼容适配清单超过10万款，关键行业完成迁移验证。', '11月17日，新一代国产操作系统正式发布，覆盖桌面、服务器与嵌入式三大场景。系统内核与核心组件实现全栈自主可控，软件生态兼容适配清单超过10万款。金融、能源、交通等关键行业已完成迁移验证，官方同时宣布开源社区计划，首批源代码将于年内开放。', '人民网', '2026-11-17 10:05:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20computer%20desktop%20interface%20with%20holographic%20ui%2C%20operating%20system%20concept%2C%20dark%20blue%20futuristic%20style&image_size=landscape_16_9'),
('可回收火箭完成第十次复用飞行，商业发射成本再降', '国内商业航天公司的一子级火箭第十次成功回收，单次发射成本较首次下降超过60%，今年已执行32次商业任务。', '11月16日，国内商业航天公司的可回收运载火箭完成第十次复用飞行并成功回收一子级。数据显示，单次发射成本较首次飞行下降超过60%，今年累计执行32次商业发射任务，在轨交付卫星数量居国内首位。公司表示，下一型更大运载能力的可回收火箭已完成详细设计，预计2027年首飞。', '新华社', '2026-11-16 16:40:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=reusable%20rocket%20landing%20vertically%20with%20flames%2C%20dusk%20sky%2C%20commercial%20space%20launch%20photography&image_size=landscape_16_9'),
('量子计算原型机实现千比特级纠缠操控', '科研团队在超导路线上实现千比特规模纠缠态制备与读取，为容错量子计算迈出关键一步，成果发表于国际期刊。', '中国科学院团队11月15日宣布，其超导量子计算原型机实现千比特规模的纠缠态制备与读取，保真度达到容错阈值要求。这是全球范围内首次在千比特规模上完成可控纠缠验证，相关成果发表于国际权威期刊。研究团队表示，下一步将攻关量子纠错编码的工程化实现。', '中国科学院', '2026-11-15 11:15:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20computer%20chandelier%20cryostat%2C%20golden%20coils%20in%20laboratory%2C%20science%20photography&image_size=landscape_16_9'),
('固态电池量产车型正式交付，续航突破1500公里', '首批搭载全固态电池的量产车型交付用户，能量密度达每公斤500瓦时，快充10分钟可补能800公里续航。', '11月14日，首批搭载全固态电池的量产车型正式交付用户。该电池能量密度达到每公斤500瓦时，CLTC续航突破1500公里，10分钟快充可补能800公里。行业专家指出，固态电池量产装车标志着动力电池技术路线进入新阶段，预计2027年成本将降至与液态电池相当水平。', '第一财经', '2026-11-14 09:00:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=electric%20vehicle%20charging%20at%20modern%20station%2C%20sleek%20ev%20car%2C%20green%20energy%20concept%2C%20night%20city%20lights&image_size=landscape_16_9'),
('6G试验卫星完成组网，天地一体通信时延降至毫秒级', '12颗低轨试验卫星组网成功，与地面移动网络深度融合，实测端到端时延低于10毫秒，覆盖远海与偏远山区。', '11月13日，12颗低轨6G试验卫星完成组网验收，与地面移动网络实现深度融合切换。实测端到端通信时延降至10毫秒以内，已在远海航运、偏远山区等场景开展业务试点。专家表示，天地一体化网络将支撑自动驾驶、远程手术等时延敏感型应用，商用计划预计2028年启动。', '央视新闻', '2026-11-13 18:25:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=low%20earth%20orbit%20satellite%20network%20over%20earth%2C%20communication%20satellite%20with%20solar%20panels%2C%20space%20view&image_size=landscape_16_9'),
('AI辅助研发新药获批上市，临床周期缩短40%', '由人工智能平台参与筛选的新药获得上市批准，从靶点发现到获批仅用时4年，研发成本大幅降低。', '11月12日，由人工智能平台深度参与研发的小分子新药正式获批上市。该药从靶点发现到获批上市仅用时4年，较传统研发周期缩短约40%，研发成本降低近一半。这是国内第二款AI深度参与并成功获批的创新药，标志着AI制药从概念验证进入产业化收获期。', '健康界', '2026-11-12 15:50:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laboratory%20with%20AI%20drug%20discovery%2C%20molecular%20structure%20hologram%2C%20scientist%20working%2C%20blue%20science%20tone&image_size=landscape_16_9'),
('人形机器人批量进入工厂，实现柔性产线协同作业', '多家制造企业引入人形机器人承担搬运与质检工作，与人类工人同线协作，单线人力成本下降约35%。', '11月11日，多家制造企业披露人形机器人应用进展：批量交付的人形机器人已承担物料搬运、视觉质检等工序，与人类工人同线协同作业。试点产线数据显示，单线人力成本下降约35%，作业良品率保持稳定。行业预测，2027年国内人形机器人出货量将突破5万台。', '澎湃新闻', '2026-11-11 13:35:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=humanoid%20robot%20working%20on%20smart%20factory%20assembly%20line%2C%20automation%2C%20industrial%20photography&image_size=landscape_16_9'),
('脑机接口临床试验取得进展，瘫痪患者重获行动能力', '新型侵入式脑机接口完成多例临床试验，受试者可通过意念精准控制外骨骼行走，信号解码准确率达94%。', '11月10日，新型侵入式脑机接口系统公布多例临床试验结果：脊髓损伤导致的瘫痪受试者通过意念控制外骨骼完成行走，信号解码准确率达94%。研究团队表示，无线化小型化的新一代植入体已完成动物实验，预计明年开展更大规模的注册临床研究。', '科技日报', '2026-11-10 08:45:00', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brain%20computer%20interface%20concept%2C%20glowing%20neural%20implant%2C%20medical%20technology%2C%20futuristic%20medical%20scene&image_size=landscape_16_9');
```

## 2026-11-20：新建图文列表表 ly_photos，插入 8 条测试数据（图片为网络生成图片地址）

```sql
USE ly_project_db;

DROP TABLE IF EXISTS ly_photos;

CREATE TABLE ly_photos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '图文ID',
  title VARCHAR(200) NOT NULL COMMENT '图文标题',
  description VARCHAR(500) NOT NULL COMMENT '图文描述',
  image_url VARCHAR(500) NOT NULL COMMENT '图片地址',
  publish_time DATETIME NOT NULL COMMENT '发布时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图文列表表';

INSERT INTO ly_photos (title, description, image_url, publish_time) VALUES
('未来城市夜景', '霓虹与流光交织的都市夜景，飞行器穿梭于摩天楼群之间，赛博朋克风格的未来图景正在成为现实想象。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20city%20skyline%20at%20night%2C%20neon%20lights%2C%20flying%20vehicles%2C%20cyberpunk%20style&image_size=landscape_16_9', '2026-11-20 10:00:00'),
('银河下的山湖', '长曝光镜头下的银河横跨山间湖泊，星轨与倒影相映成趣，这是远离城市光污染才能看到的震撼夜空。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=milky%20way%20galaxy%20over%20mountain%20lake%2C%20long%20exposure%20night%20photography%2C%20starry%20sky&image_size=landscape_16_9', '2026-11-19 15:30:00'),
('居家服务机器人', '新一代家用服务机器人拥有圆润友好的外形，能够完成清洁、陪伴与安防巡逻，正走进越来越多普通家庭。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20robot%20sitting%20in%20sunlit%20modern%20living%20room%2C%20soft%20lighting%2C%20product%20photography&image_size=landscape_16_9', '2026-11-18 09:20:00'),
('悬崖海浪与日落', '金色夕阳沉入海平面的瞬间，浪花拍打悬崖峭壁，天空被染成橘红与紫罗兰的渐变色，摄影人的黄金时刻。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20sunset%20over%20ocean%20cliff%2C%20waves%20crashing%2C%20dramatic%20sky%2C%20landscape%20photography&image_size=landscape_16_9', '2026-11-17 18:45:00'),
('晨雾中的松林', '日出时分薄雾弥漫的松林，阳光穿透树梢形成丁达尔光束，清晨的森林安静而富有层次。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=misty%20pine%20forest%20at%20sunrise%2C%20sun%20rays%20through%20trees%2C%20atmospheric%20landscape&image_size=landscape_16_9', '2026-11-16 07:10:00'),
('沙漠驼队远行', '驼队缓缓行进在金色沙丘之间，夕阳把沙脊勾出明暗分明的曲线，古老的丝路意象在今天依然动人。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camel%20caravan%20crossing%20golden%20sand%20dunes%2C%20sunset%2C%20desert%20expedition%2C%20travel%20photography&image_size=landscape_16_9', '2026-11-15 16:25:00'),
('极简主义建筑', '纯白曲面建筑在蓝天下形成简洁的几何构图，光影在墙体上流动，现代建筑的秩序之美一目了然。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20white%20architecture%20curves%20against%20blue%20sky%2C%20minimal%20geometric%20building%2C%20architecture%20photography&image_size=landscape_16_9', '2026-11-14 12:00:00'),
('樱花庭院春景', '庭院两侧樱花盛放，粉色花瓣随风飘落，春天的气息扑面而来，是每年最值得记录的时节。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossom%20trees%20beside%20traditional%20courtyard%2C%20pink%20petals%20falling%2C%20spring%20scene&image_size=landscape_16_9', '2026-11-13 11:40:00');
```

## 2026-11-20：新建图库图文表 ly_gallery，插入 8 条测试数据（图片为网络生成图片地址）

```sql
USE ly_project_db;

DROP TABLE IF EXISTS ly_gallery;

CREATE TABLE ly_gallery (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '图文ID',
  title VARCHAR(200) NOT NULL COMMENT '标题',
  description VARCHAR(500) NOT NULL COMMENT '描述',
  img_url VARCHAR(500) NOT NULL COMMENT '图片地址',
  category VARCHAR(50) NOT NULL DEFAULT '综合' COMMENT '分类',
  create_time DATETIME NOT NULL COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图库图文表';

INSERT INTO ly_gallery (title, description, img_url, category, create_time) VALUES
('量子计算机房探秘', '稀释制冷机层层环绕，将量子芯片冷却至接近绝对零度，这里是全球最冷的角落之一。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20computer%20laboratory%20with%20golden%20cryostat%2C%20blue%20dim%20lighting%2C%20high%20tech%20scene&image_size=landscape_4_3', '科技', '2026-11-20 09:00:00'),
('深海探测器下潜', '深海载人探测器缓缓下潜，探照灯刺破幽蓝海水，揭开万米深渊的神秘面纱。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deep%20sea%20submersible%20underwater%20with%20bright%20searchlight%2C%20deep%20blue%20ocean%2C%20mysterious%20atmosphere&image_size=landscape_4_3', '科技', '2026-11-19 14:30:00'),
('北国极光夜', '绿紫色极光在雪原上空舞动，如帷幔般铺满整个天际，是大自然最华丽的灯光秀。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=northern%20lights%20aurora%20over%20snowy%20plain%2C%20green%20purple%20sky%2C%20night%20landscape&image_size=landscape_4_3', '自然', '2026-11-18 20:15:00'),
('古镇夜色阑珊', '红灯笼沿河次第亮起，乌篷船摇碎满河灯影，古镇的夜晚温柔而绵长。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20ancient%20water%20town%20at%20night%2C%20red%20lanterns%20along%20river%2C%20traditional%20architecture%20reflection&image_size=landscape_4_3', '人文', '2026-11-17 19:05:00'),
('百米冲刺瞬间', '起跑器蹬地的刹那，肌肉爆发与速度美学在赛道上凝固，定格竞技体育最纯粹的力量。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sprinter%20explosive%20start%20on%20athletics%20track%2C%20dynamic%20motion%2C%20stadium%20lighting&image_size=landscape_4_3', '运动', '2026-11-16 16:40:00'),
('云海日出', '登顶者在云海之上迎接日出，金色晨光染红天际线，脚下云涛翻涌如临仙境。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sea%20of%20clouds%20at%20mountain%20sunrise%2C%20golden%20light%20over%20cloud%20waves%2C%20hiker%20silhouette%20on%20peak&image_size=landscape_4_3', '自然', '2026-11-15 06:50:00'),
('都市晚高峰车流', '华灯初上，立体交通网上的车流汇成光河，都市脉搏在夜幕下清晰可见。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=city%20traffic%20light%20trails%20on%20highway%20interchange%20at%20dusk%2C%20aerial%20view%2C%20blue%20hour%20urban%20scene&image_size=landscape_4_3', '城市', '2026-11-14 18:20:00'),
('匠心手作时光', '老匠人俯身工作台，刻刀与木纹对话，一件传统手工艺品在指尖缓缓成形。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20craftsman%20carving%20wood%20at%20workbench%2C%20warm%20light%2C%20traditional%20handicraft%20workshop&image_size=landscape_4_3', '人文', '2026-11-13 10:30:00');
```

## 2026-11-25：图片本地化（显示不出图片问题的修复）

将 ly_gallery / ly_photos 两张表中的网络图片地址替换为本地路径（图片文件已下载到 frontend/images/，由后端 express.static 托管）：

```sql
USE ly_project_db;

UPDATE ly_gallery SET img_url = CONCAT('/images/ly_gallery_', id, '.jpg');
UPDATE ly_photos SET image_url = CONCAT('/images/ly_photos_', id, '.jpg');
```

（执行后 ly_gallery.img_url 为 /images/ly_gallery_1.jpg ~ /images/ly_gallery_8.jpg，ly_photos.image_url 为 /images/ly_photos_1.jpg ~ /images/ly_photos_8.jpg，与 frontend/images 目录下的文件一一对应）

## 2026-11-25：新建知识库表 ly_kb_files、ly_kb_chunks（RAG 问答功能）

```sql
USE ly_project_db;

DROP TABLE IF EXISTS ly_kb_chunks;
DROP TABLE IF EXISTS ly_kb_files;

CREATE TABLE ly_kb_files (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '知识库文件ID',
  file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  file_size INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
  file_type VARCHAR(30) NOT NULL DEFAULT '' COMMENT '文件扩展名',
  chunk_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '解析后的分块数量',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文件表';

CREATE TABLE ly_kb_chunks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分块ID',
  file_id INT UNSIGNED NOT NULL COMMENT '所属文件ID',
  chunk_index INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '块序号(从1开始)',
  content TEXT NOT NULL COMMENT '分块文本内容',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_ly_kb_chunks_file_id (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库分块表';

-- 补充字段：记录磁盘存储相对路径（删除文件时用于清理物理文件）
ALTER TABLE ly_kb_files ADD COLUMN file_path VARCHAR(300) NOT NULL DEFAULT '' COMMENT '磁盘存储相对路径' AFTER file_type;
```

测试数据说明：本功能的测试数据不使用手工 INSERT，而是通过"上传解析"业务流程自动生成——项目预置了 2 个知识库文件（backend/knowledge/presets/ly_网站使用说明.txt、backend/ly_课程项目简介.txt 所在目录下），启动服务后通过 POST /api/kb/upload 接口上传，即自动写入 ly_kb_files 2 条文件记录和 ly_kb_chunks 若干分块记录（超过 8 条），数据与真实文件一一对应，更具业务意义。手工重建数据库时，只需建表后通过页面上传任意文档即可生成测试数据。
