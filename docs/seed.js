// ============================================
// 闪问(FlashAsk) 种子数据脚本
// 包含：测试用户、测试管理员、5大学科、25关卡、150道题目
// ============================================

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'flash_ask.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ 数据库文件不存在，请先运行 node database/init.js');
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const now = new Date().toISOString();

// ========== 1. 测试用户 ==========
console.log('📝 创建测试用户...');

const testUserPwd = bcrypt.hashSync('123456', 10);
const testUserId = crypto.randomUUID();
db.prepare(`
  INSERT OR IGNORE INTO users (id, nickname, phone, password_hash, total_score, total_correct, total_wrong, last_login_at, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(testUserId, '测试用户', '13800000000', testUserPwd, 0, 0, 0, now, now);

// ========== 2. 测试管理员 ==========
console.log('📝 创建测试管理员...');

const testAdminId = crypto.randomUUID();
const testAdminHash = bcrypt.hashSync('test123', 10);
db.prepare(`
  INSERT OR IGNORE INTO admin_users (id, username, password_hash, nickname, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(testAdminId, 'testadmin', testAdminHash, '测试管理员', 'active', now);

// ========== 3. 学科分类 ==========
console.log('📝 创建学科分类...');

const categories = [
  { id: crypto.randomUUID(), name: '科学', icon: '🔬', sort_order: 1, description: '自然科学、物理、化学、生物等基础知识' },
  { id: crypto.randomUUID(), name: '社会', icon: '🌍', sort_order: 2, description: '社会学、经济学、政治学等人文社科知识' },
  { id: crypto.randomUUID(), name: '逻辑', icon: '🧠', sort_order: 3, description: '逻辑推理、数学思维、编程基础等' },
  { id: crypto.randomUUID(), name: '生活', icon: '🏠', sort_order: 4, description: '生活常识、健康、饮食、旅行等实用知识' },
  { id: crypto.randomUUID(), name: '人文', icon: '📚', sort_order: 5, description: '文学、历史、哲学、艺术等人文素养' },
];

const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, icon, sort_order, description)
  VALUES (?, ?, ?, ?, ?)
`);

for (const cat of categories) {
  insertCategory.run(cat.id, cat.name, cat.icon, cat.sort_order, cat.description);
}

// ========== 4. 关卡 ==========
console.log('📝 创建关卡...');

const levels = [];

const levelNames = {
  science: ['物理入门', '化学探秘', '生物世界', '天文宇宙', '科学前沿'],
  society: ['经济基础', '社会结构', '法律常识', '国际关系', '当代议题'],
  logic: ['数学思维', '逻辑推理', '编程基础', '概率统计', '算法初步'],
  life: ['健康养生', '美食烹饪', '居家生活', '旅行地理', '安全急救'],
  humanities: ['古代文学', '世界历史', '哲学思想', '艺术鉴赏', '文化比较'],
};

const levelData = [
  { catIndex: 0, names: levelNames.science, desc: '自然科学' },
  { catIndex: 1, names: levelNames.society, desc: '社会学科' },
  { catIndex: 2, names: levelNames.logic, desc: '逻辑学科' },
  { catIndex: 3, names: levelNames.life, desc: '生活学科' },
  { catIndex: 4, names: levelNames.humanities, desc: '人文学科' },
];

const insertLevel = db.prepare(`
  INSERT INTO levels (id, category_id, name, level_number, pass_threshold, description)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const ld of levelData) {
  for (let i = 0; i < ld.names.length; i++) {
    const levelId = crypto.randomUUID();
    levels.push({
      id: levelId,
      category_id: categories[ld.catIndex].id,
      name: ld.names[i],
      level_number: i + 1,
      pass_threshold: 4,
      description: `${ld.desc}第${i + 1}关`
    });
    insertLevel.run(levelId, categories[ld.catIndex].id, ld.names[i], i + 1, 4, `${ld.desc}第${i + 1}关`);
  }
}

// ========== 5. 题目 ==========
console.log('📝 创建题目...');

// Helper to get level by category index and level number
function getLevel(catIndex, levelNum) {
  return levels.find(l => l.category_id === categories[catIndex].id && l.level_number === levelNum);
}

const insertQuestion = db.prepare(`
  INSERT INTO questions (id, level_id, question, options, correct_index, explanation, tags, difficulty, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Science questions (catIndex: 0)
const scienceQuestions = [
  // 物理入门 (level 1)
  {
    level: getLevel(0, 1),
    questions: [
      { q: '光在真空中的传播速度约为多少？', opts: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], correct: 1, exp: '光在真空中的速度是 3×10⁸ m/s（约 30 万公里/秒）。' },
      { q: '牛顿第一定律也被称为？', opts: ['惯性定律', '加速度定律', '作用与反作用定律', '万有引力定律'], correct: 0, exp: '牛顿第一定律即惯性定律，描述物体保持其运动状态不变的特性。' },
      { q: '水的沸点在标准大气压下是多少摄氏度？', opts: ['90°C', '100°C', '110°C', '120°C'], correct: 1, exp: '在标准大气压（101.325 kPa）下，水的沸点是 100°C。' },
      { q: '以下哪种是导体？', opts: ['橡胶', '玻璃', '铜', '塑料'], correct: 2, exp: '铜是金属，具有良好的导电性，是常见的导体材料。' },
      { q: '声音不能在以下哪种介质中传播？', opts: ['空气', '水', '铁', '真空'], correct: 3, exp: '声音需要介质传播，真空中没有物质粒子，声音无法传播。' },
      { q: '力的单位是什么？', opts: ['牛顿', '焦耳', '瓦特', '帕斯卡'], correct: 0, exp: '力的国际单位是牛顿（N），以物理学家牛顿命名。' },
    ]
  },
  // 化学探秘 (level 2)
  {
    level: getLevel(0, 2),
    questions: [
      { q: '水的化学式是什么？', opts: ['H₂O', 'CO₂', 'NaCl', 'CH₄'], correct: 0, exp: '水由两个氢原子和一个氧原子组成，化学式为 H₂O。' },
      { q: '元素周期表中，原子序数为 6 的元素是？', opts: ['氧', '氮', '碳', '硼'], correct: 2, exp: '原子序数 6 是碳（C），是有机物的基本元素。' },
      { q: '以下哪种是混合物？', opts: ['蒸馏水', '氧气', '空气', '纯金'], correct: 2, exp: '空气含有氮气、氧气等多种气体，是混合物。' },
      { q: '酸雨的 pH 值通常低于多少？', opts: ['7.0', '5.6', '4.0', '3.0'], correct: 1, exp: '正常雨水 pH 值约 5.6，pH 值低于 5.6 的雨水被称为酸雨。' },
      { q: '铁生锈是哪种变化？', opts: ['物理变化', '化学变化', '核变化', '生物变化'], correct: 1, exp: '铁与氧气和水反应生成氧化铁（铁锈），是化学变化。' },
      { q: '以下哪种气体可引起温室效应？', opts: ['氮气', '氧气', '二氧化碳', '氢气'], correct: 2, exp: '二氧化碳是主要的温室气体之一，能吸收和发射红外辐射。' },
    ]
  },
  // 生物世界 (level 3)
  {
    level: getLevel(0, 3),
    questions: [
      { q: '人体最大的器官是什么？', opts: ['心脏', '肝脏', '皮肤', '大脑'], correct: 2, exp: '皮肤是人体最大的器官，成年人皮肤面积约 1.5-2 平方米。' },
      { q: '植物进行光合作用需要什么？', opts: ['氧气和水', '阳光、水和二氧化碳', '氮气和阳光', '土壤和肥料'], correct: 1, exp: '光合作用需要阳光、水和二氧化碳，产生葡萄糖和氧气。' },
      { q: '人类的正常体温约为多少？', opts: ['35°C', '37°C', '39°C', '40°C'], correct: 1, exp: '人体正常体温约为 37°C（口腔温度）。' },
      { q: 'DNA 双螺旋结构的发现者之一是谁？', opts: ['达尔文', '孟德尔', '沃森和克里克', '巴斯德'], correct: 2, exp: '沃森和克里克于 1953 年提出 DNA 双螺旋结构模型。' },
      { q: '人体有多少对染色体？', opts: ['22 对', '23 对', '24 对', '46 对'], correct: 1, exp: '人体细胞有 23 对（46 条）染色体，其中 22 对常染色体，1 对性染色体。' },
      { q: '以下哪种动物属于哺乳动物？', opts: ['企鹅', '鳄鱼', '海豚', '青蛙'], correct: 2, exp: '海豚是哺乳动物，用肺呼吸，胎生哺乳。' },
    ]
  },
  // 天文宇宙 (level 4)
  {
    level: getLevel(0, 4),
    questions: [
      { q: '太阳系中最大的行星是？', opts: ['土星', '木星', '天王星', '海王星'], correct: 1, exp: '木星是太阳系最大的行星，直径约 14.3 万公里。' },
      { q: '地球距离太阳大约多远？', opts: ['5000 万公里', '1 亿公里', '1.5 亿公里', '3 亿公里'], correct: 2, exp: '地球到太阳的平均距离约 1.496 亿公里，称为 1 天文单位（AU）。' },
      { q: '月球的形成最广为接受的理论是？', opts: ['捕获说', '分裂说', '同源说', '大撞击说'], correct: 3, exp: '大撞击说认为约 45 亿年前，一个火星大小的天体撞击地球，碎片形成了月球。' },
      { q: '黑洞的引力大到连什么也无法逃脱？', opts: ['原子', '电子', '光', '声波'], correct: 2, exp: '黑洞的引力极强，连光也无法逃脱其事件视界。' },
      { q: '银河系属于哪种类型的星系？', opts: ['椭圆星系', '旋涡星系', '不规则星系', '棒旋星系'], correct: 3, exp: '银河系是一个棒旋星系，具有由恒星组成的中央棒状结构。' },
      { q: '哈勃太空望远镜是以谁的名字命名的？', opts: ['伽利略', '牛顿', '哈勃', '爱因斯坦'], correct: 2, exp: '以美国天文学家埃德温·哈勃命名，他发现了宇宙膨胀现象。' },
    ]
  },
  // 科学前沿 (level 5)
  {
    level: getLevel(0, 5),
    questions: [
      { q: '量子力学中"薛定谔的猫"说明了什么？', opts: ['猫会死', '猫会活', '叠加态原理', '测不准原理'], correct: 2, exp: '薛定谔的猫思想实验说明量子叠加态——猫同时处于死和活的叠加状态。' },
      { q: 'CRISPR 技术主要用于什么？', opts: ['天气预报', '基因编辑', '能源生产', '通信技术'], correct: 1, exp: 'CRISPR 是一种基因编辑技术，可以精确修改 DNA 序列。' },
      { q: '相对论是由谁提出的？', opts: ['牛顿', '爱因斯坦', '霍金', '玻尔'], correct: 1, exp: '爱因斯坦于 1905 年提出狭义相对论，1915 年提出广义相对论。' },
      { q: '世界上最快的超级计算机用于什么？', opts: ['玩游戏', '科学计算', '发邮件', '看视频'], correct: 1, exp: '超级计算机主要用于科学计算，如气候模拟、药物研发等。' },
      { q: '人造卫星通常使用什么能源？', opts: ['干电池', '太阳能', '核能', '风能'], correct: 1, exp: '大多数卫星使用太阳能电池板将太阳能转化为电能。' },
      { q: '以下哪个是量子计算的基本单位？', opts: ['比特', '量子比特', '字节', '字'], correct: 1, exp: '量子计算的基本单位是量子比特（qubit），可以同时处于 0 和 1 的叠加态。' },
    ]
  },
];

// Society questions (catIndex: 1)
const societyQuestions = [
  // 经济基础 (level 1)
  {
    level: getLevel(1, 1),
    questions: [
      { q: '经济学中"看不见的手"是谁提出的？', opts: ['凯恩斯', '马克思', '亚当·斯密', '李嘉图'], correct: 2, exp: '亚当·斯密在《国富论》中提出"看不见的手"的概念。' },
      { q: '货币最基本的职能是什么？', opts: ['保值', '流通手段', '世界货币', '支付手段'], correct: 1, exp: '货币最基本职能是流通手段，用于商品交换。' },
      { q: 'GDP 是指什么？', opts: ['国民生产总值', '国内生产总值', '居民消费价格指数', '采购经理指数'], correct: 1, exp: 'GDP（Gross Domestic Product）即国内生产总值。' },
      { q: '通货膨胀意味着什么？', opts: ['物价持续下降', '物价持续上涨', '就业率上升', '经济增长加快'], correct: 1, exp: '通货膨胀指一般物价水平持续上涨，货币购买力下降。' },
      { q: '股票的英文缩写是什么？', opts: ['GDP', 'CPI', 'Stock', 'Bond'], correct: 2, exp: '股票英文为 Stock，代表公司所有权的凭证。' },
      { q: '以下哪个是中央银行的主要职责？', opts: ['发放贷款', '吸收存款', '制定货币政策', '发行股票'], correct: 2, exp: '中央银行主要负责制定和执行货币政策，如调节利率和货币供给。' },
    ]
  },
  // 社会结构 (level 2)
  {
    level: getLevel(1, 2),
    questions: [
      { q: '社会学中"社会化"是指什么？', opts: ['公有制改革', '个人学习社会规范的过程', '社交活动', '社会运动'], correct: 1, exp: '社会化是个人学习社会规范、价值观和行为模式的过程。' },
      { q: '以下哪种是初级社会群体？', opts: ['公司', '政党', '家庭', '学校'], correct: 2, exp: '家庭是典型的初级社会群体，成员间有密切的情感联系。' },
      { q: '人口老龄化通常用哪个指标衡量？', opts: ['出生率', '死亡率', '老年人口比例', '人口增长率'], correct: 2, exp: '老年人口（65 岁以上）占总人口比例是衡量老龄化的重要指标。' },
      { q: '城市化是指什么？', opts: ['城市变农村', '农村人口向城市转移', '城市面积缩小', '农业人口增加'], correct: 1, exp: '城市化是农村人口向城市转移，城市规模扩大的过程。' },
      { q: '"社会分层"通常基于什么标准？', opts: ['身高', '收入、职业和教育', '年龄', '居住地'], correct: 1, exp: '社会分层通常依据收入、职业、教育等社会经济指标。' },
      { q: '社区的特征不包括以下哪项？', opts: ['共同地域', '社会互动', '共同情感', '大规模人口'], correct: 3, exp: '社区规模相对较小，成员间有较强的认同感和归属感，非大规模人口。' },
    ]
  },
  // 法律常识 (level 3)
  {
    level: getLevel(1, 3),
    questions: [
      { q: '我国最高法律是什么？', opts: ['刑法', '民法典', '宪法', '行政法'], correct: 2, exp: '宪法是国家的根本大法，具有最高法律效力。' },
      { q: '完全民事行为能力的年龄起点是多少岁？', opts: ['16 岁', '18 岁', '20 岁', '22 岁'], correct: 1, exp: '年满 18 周岁的公民具有完全民事行为能力。' },
      { q: '发明专利的保护期限是多久？', opts: ['10 年', '15 年', '20 年', '25 年'], correct: 2, exp: '发明专利权的保护期限为 20 年，自申请日起计算。' },
      { q: '以下哪种属于不可抗力？', opts: ['价格上涨', '地震', '工人罢工', '政策变化'], correct: 1, exp: '地震属于自然灾害，是典型的不可抗力事件。' },
      { q: '我国刑法规定的最低刑事责任年龄是？', opts: ['12 岁', '14 岁', '16 岁', '18 岁'], correct: 0, exp: '2021 年修正后，已满 12 周岁不满 14 周岁的特定情形下需负刑事责任。' },
      { q: '合同成立的要件不包括？', opts: ['要约', '承诺', '公证', '双方意思表示一致'], correct: 2, exp: '公证不是合同成立的必要条件，要约和承诺达成一致即可成立合同。' },
    ]
  },
  // 国际关系 (level 4)
  {
    level: getLevel(1, 4),
    questions: [
      { q: '联合国成立于哪一年？', opts: ['1942 年', '1945 年', '1948 年', '1950 年'], correct: 1, exp: '联合国于 1945 年 10 月 24 日正式成立。' },
      { q: '联合国安理会五个常任理事国不包括？', opts: ['中国', '日本', '俄罗斯', '英国'], correct: 1, exp: '五常为中、美、俄、英、法，日本不是常任理事国。' },
      { q: 'WTO 的中文名称是什么？', opts: ['国际货币基金组织', '世界银行', '世界贸易组织', '世界卫生组织'], correct: 2, exp: 'WTO（World Trade Organization）即世界贸易组织。' },
      { q: '"冷战"时期两大阵营是？', opts: ['同盟国和协约国', '北约和华约', '欧盟和东盟', '联合国和国联'], correct: 1, exp: '冷战时期以美国为首的北约和以苏联为首的华约形成对峙。' },
      { q: '欧盟的正式货币是什么？', opts: ['英镑', '美元', '欧元', '法郎'], correct: 2, exp: '欧元（Euro）是欧盟多数成员国的统一货币。' },
      { q: '万隆会议是哪个年份召开的？', opts: ['1953 年', '1955 年', '1957 年', '1960 年'], correct: 1, exp: '万隆会议（亚非会议）于 1955 年在印度尼西亚万隆举行。' },
    ]
  },
  // 当代议题 (level 5)
  {
    level: getLevel(1, 5),
    questions: [
      { q: '联合国可持续发展目标（SDGs）共有多少个？', opts: ['15 个', '16 个', '17 个', '18 个'], correct: 2, exp: '联合国 2030 年可持续发展议程包含 17 个可持续发展目标。' },
      { q: '"碳中和"是指什么？', opts: ['不排放二氧化碳', '排放和吸收的二氧化碳相抵消', '使用清洁能源', '停止工业生产'], correct: 1, exp: '碳中和指通过植树造林、碳捕集等方式，使碳排放与吸收相抵消。' },
      { q: '数字鸿沟是指什么？', opts: ['互联网故障', '不同群体在数字技术使用上的差距', '数据安全漏洞', '手机信号盲区'], correct: 1, exp: '数字鸿沟指不同地区或群体在信息技术获取和使用上的不平等。' },
      { q: '全球化的主要推动力是什么？', opts: ['战争', '科技进步和贸易自由化', '人口增长', '气候变化'], correct: 1, exp: '科技进步降低通信和运输成本，贸易自由化促进商品资本流动。' },
      { q: '人工智能伦理面临的主要挑战不包括？', opts: ['隐私保护', '算法偏见', '电池续航', '就业影响'], correct: 2, exp: '电池续航不是 AI 伦理的核心问题，隐私、偏见和就业影响才是。' },
      { q: '难民是指什么样的人？', opts: ['移民', '因战乱或迫害而逃离本国的人', '游客', '留学生'], correct: 1, exp: '难民因战争、迫害等原因逃离本国，寻求国际保护。' },
    ]
  },
];

// Logic questions (catIndex: 2)
const logicQuestions = [
  // 数学思维 (level 1)
  {
    level: getLevel(2, 1),
    questions: [
      { q: 'π 的近似值是多少？', opts: ['3.12', '3.14', '3.16', '3.18'], correct: 1, exp: '圆周率 π 约等于 3.1415926...，常取 3.14。' },
      { q: '一个三角形内角之和是多少度？', opts: ['90°', '180°', '270°', '360°'], correct: 1, exp: '任意三角形内角之和恒等于 180°。' },
      { q: '2¹⁰ 等于多少？', opts: ['512', '1024', '2048', '256'], correct: 1, exp: '2¹⁰ = 1024，是计算机科学中常用的数值。' },
      { q: '以下哪个是质数？', opts: ['4', '9', '13', '15'], correct: 2, exp: '13 只有 1 和自身两个正因数，是质数。' },
      { q: '0 是不是偶数？', opts: ['是', '不是', '既是偶数也是奇数', '既不是偶数也不是奇数'], correct: 0, exp: '0 能被 2 整除，是偶数。' },
      { q: '一个公平的六面骰子掷一次，得到偶数的概率是？', opts: ['1/2', '1/3', '1/6', '2/3'], correct: 0, exp: '骰子有 6 面，偶数有 3 个（2、4、6），概率 3/6 = 1/2。' },
    ]
  },
  // 逻辑推理 (level 2)
  {
    level: getLevel(2, 2),
    questions: [
      { q: '所有的猫都爱吃鱼。Tom 是一只猫。以下哪个结论正确？', opts: ['Tom 可能爱吃鱼', 'Tom 一定爱吃鱼', 'Tom 不爱吃鱼', '无法确定'], correct: 1, exp: '根据三段论：所有猫都爱吃鱼 + Tom 是猫 → Tom 一定爱吃鱼。' },
      { q: '如果 A > B 且 B > C，那么？', opts: ['A = C', 'A < C', 'A > C', '无法比较'], correct: 2, exp: '不等式具有传递性：A > B > C，所以 A > C。' },
      { q: '"所有鸟都会飞。企鹅是鸟。" 这个推理有什么问题？', opts: ['没有错误', '企鹅不是鸟', '并非所有鸟都会飞', '企鹅会飞'], correct: 2, exp: '前提"所有鸟都会飞"是错的，企鹅不会飞，所以推理无效。' },
      { q: '如果今天是星期三，那么 100 天后是星期几？', opts: ['星期三', '星期四', '星期五', '星期六'], correct: 2, exp: '100 ÷ 7 = 14 余 2，所以 100 天后是星期三 + 2 = 星期五。' },
      { q: '以下哪个是充分必要条件？', opts: ['如果下雨地就湿', '当且仅当三角形等边则等角', '如果你努力学习就会成功', '如果生病了就要吃药'], correct: 1, exp: '"当且仅当"表示充分必要条件，等边三角形必然等角，反之亦然。' },
      { q: '甲说："乙在说谎。"乙说："丙在说谎。"丙说："甲乙都在说谎。"那么谁在说真话？', opts: ['甲', '乙', '丙', '没有人说真话'], correct: 1, exp: '若乙说真话，则丙说谎（甲说了假话或乙说了假话），甲说谎成立。逻辑链成立。' },
    ]
  },
  // 编程基础 (level 3)
  {
    level: getLevel(2, 3),
    questions: [
      { q: '编程中"变量"的含义是什么？', opts: ['固定不变的数', '存储数据的容器', '数学公式', '程序名称'], correct: 1, exp: '变量是用于存储数据的命名容器，其值可以改变。' },
      { q: '以下哪个是循环结构的关键字？', opts: ['if', 'else', 'for', 'switch'], correct: 2, exp: 'for 是循环关键字，用于重复执行代码块。' },
      { q: 'HTML 中表示段落的标签是什么？', opts: ['<h1>', '<p>', '<div>', '<span>'], correct: 1, exp: '<p> 标签定义段落（paragraph）。' },
      { q: '"算法"的准确定义是什么？', opts: ['电脑程序', '解决问题的步骤和方法', '数据存储方式', '网络协议'], correct: 1, exp: '算法是解决特定问题的有限步骤和方法。' },
      { q: '数据库中的 SQL 是什么？', opts: ['编程语言', '标记语言', '结构化查询语言', '样式语言'], correct: 2, exp: 'SQL（Structured Query Language）用于管理和操作数据库。' },
      { q: '以下哪个是面向对象编程的特征？', opts: ['封装', '排序', '循环', '赋值'], correct: 0, exp: '封装、继承、多态是面向对象编程的三大特征。' },
    ]
  },
  // 概率统计 (level 4)
  {
    level: getLevel(2, 4),
    questions: [
      { q: '平均数、中位数和众数中，哪个受极端值影响最大？', opts: ['平均数', '中位数', '众数', '都不受影响'], correct: 0, exp: '平均数会因极端值而产生较大波动，中位数和众数相对稳定。' },
      { q: '抛一枚均匀硬币两次，两次都正面朝上的概率是？', opts: ['1/2', '1/3', '1/4', '1/6'], correct: 2, exp: '每次概率 1/2，两次独立事件：1/2 × 1/2 = 1/4。' },
      { q: '标准正态分布的均值和标准差分别是？', opts: ['μ=0, σ=0', 'μ=0, σ=1', 'μ=1, σ=0', 'μ=1, σ=1'], correct: 1, exp: '标准正态分布的均值为 0，标准差为 1，记为 N(0,1)。' },
      { q: '如果两个事件互斥，它们的概率关系是？', opts: ['P(A∩B) = P(A)×P(B)', 'P(A∪B) = 0', 'P(A∩B) = 0', 'P(A∪B) = P(A)+P(B)+P(A∩B)'], correct: 2, exp: '互斥事件不能同时发生，交集概率为 0。' },
      { q: '一组数据的标准差为 0 意味着什么？', opts: ['数据都相等', '数据差异很大', '数据为空', '数据有负数'], correct: 0, exp: '标准差为 0 说明所有数据都相等，没有离散程度。' },
      { q: '大数定律说明什么？', opts: ['大数比小数大', '试验次数越多，结果越趋近预期值', '数字越大越好', '大数不可预测'], correct: 1, exp: '大数定律说明试验次数增加时，样本均值趋近于期望值。' },
    ]
  },
  // 算法初步 (level 5)
  {
    level: getLevel(2, 5),
    questions: [
      { q: '二分查找要求数据已经怎么处理？', opts: ['随机排列', '排序', '加密', '压缩'], correct: 1, exp: '二分查找要求数据已排序，才能通过比较中间元素缩小搜索范围。' },
      { q: '冒泡排序的时间复杂度是多少？', opts: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'], correct: 2, exp: '冒泡排序最坏和平均时间复杂度均为 O(n²)。' },
      { q: '栈（Stack）的特点是？', opts: ['先进先出', '后进先出', '随机访问', '有序访问'], correct: 1, exp: '栈是后进先出（LIFO）的数据结构，像叠盘子一样。' },
      { q: '递归函数最重要的特征是什么？', opts: ['使用循环', '调用自身', '没有返回值', '使用全局变量'], correct: 1, exp: '递归函数在定义中调用自身，必须有终止条件避免无限递归。' },
      { q: '哈希表（Hash Table）的查找时间复杂度平均为？', opts: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 0, exp: '哈希表通过哈希函数直接定位，平均查找时间为 O(1)。' },
      { q: '图的深度优先搜索使用什么数据结构辅助？', opts: ['队列', '栈', '数组', '链表'], correct: 1, exp: '深度优先搜索（DFS）使用栈（或递归）来实现回溯。' },
    ]
  },
];

// Life questions (catIndex: 3)
const lifeQuestions = [
  // 健康养生 (level 1)
  {
    level: getLevel(3, 1),
    questions: [
      { q: '成年人每天建议饮水量约为多少？', opts: ['500ml', '1000ml', '1500-2000ml', '3000ml'], correct: 2, exp: '成年人每天建议饮水 1.5-2 升（约 8 杯水）。' },
      { q: '以下哪种维生素在阳光下可由皮肤合成？', opts: ['维生素 A', '维生素 C', '维生素 D', '维生素 E'], correct: 2, exp: '皮肤经阳光照射可合成维生素 D，有助于钙吸收。' },
      { q: '人体必需的营养素不包括以下哪项？', opts: ['碳水化合物', '蛋白质', '咖啡因', '维生素'], correct: 2, exp: '咖啡因不是人体必需的营养素，而糖、蛋白、脂肪、维生素、矿物质和水是必需的。' },
      { q: '正常成年人安静时的心率范围约为？', opts: ['40-50 次/分', '60-100 次/分', '100-120 次/分', '120-140 次/分'], correct: 1, exp: '健康成年人安静心率通常在 60-100 次/分钟之间。' },
      { q: '以下哪种行为对眼睛健康最有益？', opts: ['长时间看手机', '每 20 分钟远眺', '在暗光下阅读', '不眨眼'], correct: 1, exp: '遵循"20-20-20"法则：每 20 分钟看 20 英尺外 20 秒，可缓解眼疲劳。' },
      { q: '流感的主要传播方式是？', opts: ['血液传播', '飞沫传播', '食物传播', '性传播'], correct: 1, exp: '流感病毒主要通过咳嗽、打喷嚏产生的飞沫传播。' },
    ]
  },
  // 美食烹饪 (level 2)
  {
    level: getLevel(3, 2),
    questions: [
      { q: '川菜中最具代表性的调味料是什么？', opts: ['酱油', '醋', '花椒和辣椒', '糖'], correct: 2, exp: '川菜以麻辣著称，花椒和辣椒是其核心调味料。' },
      { q: '米饭的主要营养成分是什么？', opts: ['蛋白质', '脂肪', '碳水化合物', '维生素'], correct: 2, exp: '米饭富含碳水化合物（淀粉），是人体的主要能量来源。' },
      { q: '以下哪个是发面常用的原料？', opts: ['小苏打', '酵母', '泡打粉', '以上都是'], correct: 3, exp: '酵母、小苏打和泡打粉都可以用来发面（膨松剂），使面团蓬松。' },
      { q: '焦糖化反应需要什么条件？', opts: ['低温', '高温加热', '加水', '加醋'], correct: 1, exp: '焦糖化是糖在高温（约 160°C 以上）加热时发生的褐变反应。' },
      { q: '寿司的主要材料是？', opts: ['糯米', '白米加醋', '小米', '糙米'], correct: 1, exp: '寿司饭用白米加醋、糖、盐调味制成，而非纯糯米。' },
      { q: '以下哪种烹饪方式最能保留蔬菜营养？', opts: ['油炸', '长时间炖煮', '快速蒸或焯水', '烧烤'], correct: 2, exp: '快速蒸或焯水可以最大限度保留蔬菜中的水溶性维生素。' },
    ]
  },
  // 居家生活 (level 3)
  {
    level: getLevel(3, 3),
    questions: [
      { q: '家庭电路中火线和零线之间的电压是多少？', opts: ['110V', '220V', '380V', '12V'], correct: 1, exp: '我国家庭用电标准电压为 220V（单相交流电）。' },
      { q: '冰箱冷藏室的最佳温度范围是？', opts: ['-18°C 以下', '0-4°C', '4-8°C', '10-15°C'], correct: 1, exp: '冰箱冷藏室建议设定在 0-4°C 以抑制细菌生长。' },
      { q: '以下哪种材料适合做隔热层？', opts: ['铁板', '玻璃', '泡沫塑料', '瓷砖'], correct: 2, exp: '泡沫塑料导热系数低，是良好的隔热材料。' },
      { q: '洗衣机使用中"甩干"是利用什么原理？', opts: ['重力', '离心力', '磁力', '浮力'], correct: 1, exp: '甩干利用离心力，通过高速旋转使水脱离衣物。' },
      { q: '家庭节约用水的好习惯不包括？', opts: ['刷牙时关水龙头', '洗菜水浇花', '使用节水型马桶', '长时间冲淋'], correct: 3, exp: '长时间冲淋浪费水，不是节水习惯。' },
      { q: '以下哪种垃圾分类是正确的？', opts: ['电池属于可回收', '餐厨垃圾属于有害垃圾', '塑料瓶属于可回收', '玻璃属于其他垃圾'], correct: 2, exp: '塑料瓶属于可回收垃圾，电池属于有害垃圾，餐厨垃圾属于厨余垃圾。' },
    ]
  },
  // 旅行地理 (level 4)
  {
    level: getLevel(3, 4),
    questions: [
      { q: '世界上面积最大的国家是？', opts: ['中国', '美国', '俄罗斯', '加拿大'], correct: 2, exp: '俄罗斯领土面积约 1710 万平方公里，世界第一。' },
      { q: '万里长城全长大约多少公里？', opts: ['5000 公里', '10000 公里', '21000 公里', '30000 公里'], correct: 2, exp: '明长城总长约 8851.8 公里，但历代长城总长超过 21000 公里。' },
      { q: '以下哪个是亚洲国家？', opts: ['巴西', '澳大利亚', '印度', '尼日利亚'], correct: 2, exp: '印度位于南亚，是亚洲国家。' },
      { q: '世界上最长的河流是？', opts: ['长江', '亚马孙河', '尼罗河', '密西西比河'], correct: 2, exp: '尼罗河长约 6650 公里，是世界上最长的河流。' },
      { q: '时区是如何划分的？', opts: ['按国家边界', '按经度每 15 度一个时区', '按纬度', '随机划分'], correct: 1, exp: '全球按经度每 15 度划分一个时区，共 24 个时区。' },
      { q: '马丘比丘位于哪个国家？', opts: ['墨西哥', '秘鲁', '巴西', '智利'], correct: 1, exp: '马丘比丘是印加帝国遗址，位于南美洲秘鲁境内。' },
    ]
  },
  // 安全急救 (level 5)
  {
    level: getLevel(3, 5),
    questions: [
      { q: '发现有人触电，首先应该做什么？', opts: ['直接用手拉开', '切断电源或用绝缘物挑开电线', '泼水', '拨打 120'], correct: 1, exp: '应先切断电源或用干燥木棍等绝缘物将电线挑开，避免自身触电。' },
      { q: '心肺复苏（CPR）时胸外按压的频率是？', opts: ['60-80 次/分', '80-100 次/分', '100-120 次/分', '120-140 次/分'], correct: 2, exp: '成人 CPR 胸外按压频率为 100-120 次/分钟。' },
      { q: '发生火灾时正确的逃生方式是？', opts: ['乘坐电梯', '用湿毛巾捂住口鼻低姿逃生', '跳楼', '躲在衣柜里'], correct: 1, exp: '火灾时应湿毛巾捂口鼻，低姿沿安全通道逃生，不坐电梯。' },
      { q: '轻微烫伤后第一时间应如何处理？', opts: ['涂抹牙膏', '用冰直接敷', '用流动冷水冲洗', '刺破水泡'], correct: 2, exp: '烫伤后应立即用流动冷水冲洗 15-20 分钟降温止痛。' },
      { q: '海姆立克急救法用于处理什么情况？', opts: ['心脏病发作', '气道异物梗阻', '骨折', '中毒'], correct: 1, exp: '海姆立克急救法用于处理气道被异物阻塞导致的窒息。' },
      { q: '地震发生时在室内应该怎么做？', opts: ['跑向门口', '躲在坚固桌下或墙角', '站在窗户旁', '使用电梯'], correct: 1, exp: '地震时应"伏地、遮挡、抓牢"，躲在坚固的桌子下或内墙墙角。' },
    ]
  },
];

// Humanities questions (catIndex: 4)
const humanitiesQuestions = [
  // 古代文学 (level 1)
  {
    level: getLevel(4, 1),
    questions: [
      { q: '"床前明月光"出自哪位诗人？', opts: ['杜甫', '李白', '白居易', '王维'], correct: 1, exp: '出自李白的《静夜思》，是唐代最著名的诗歌之一。' },
      { q: '中国四大名著中，《红楼梦》的作者是谁？', opts: ['罗贯中', '施耐庵', '吴承恩', '曹雪芹'], correct: 3, exp: '《红楼梦》前 80 回为曹雪芹所著，后 40 回一般认为是高鹗续写。' },
      { q: '《诗经》共有多少篇？', opts: ['205 篇', '300 篇', '305 篇', '311 篇'], correct: 2, exp: '《诗经》共 305 篇，又称"诗三百"。' },
      { q: '"但愿人长久，千里共婵娟"中"婵娟"指什么？', opts: ['美女', '月亮', '花朵', '远方'], correct: 1, exp: '"婵娟"在此处指月亮，表达对亲人的思念之情。' },
      { q: '以下哪位不是"唐宋八大家"之一？', opts: ['韩愈', '柳宗元', '李白', '苏轼'], correct: 2, exp: '李白是诗人，非"唐宋八大家"之列。八大家包括韩柳欧王曾三苏。' },
      { q: '《论语》记录的是谁的言行？', opts: ['老子', '孔子', '孟子', '庄子'], correct: 1, exp: '《论语》是孔子及其弟子的言行录，由孔子弟子及再传弟子编撰。' },
    ]
  },
  // 世界历史 (level 2)
  {
    level: getLevel(4, 2),
    questions: [
      { q: '第一次世界大战爆发于哪一年？', opts: ['1913 年', '1914 年', '1915 年', '1916 年'], correct: 1, exp: '第一次世界大战于 1914 年 7 月 28 日爆发。' },
      { q: '法国大革命爆发于哪一年？', opts: ['1776 年', '1789 年', '1799 年', '1804 年'], correct: 1, exp: '法国大革命始于 1789 年 7 月 14 日攻占巴士底狱。' },
      { q: '古埃及的著名建筑象征是什么？', opts: ['长城', '金字塔', '斗兽场', '神庙'], correct: 1, exp: '金字塔是古埃及法老的陵墓，最著名的是吉萨金字塔群。' },
      { q: '哥伦布在 1492 年到达了哪里？', opts: ['印度', '中国', '美洲', '澳大利亚'], correct: 2, exp: '哥伦布于 1492 年到达巴哈马群岛，开启了欧洲对美洲的探索。' },
      { q: '指南针最早出现在哪个国家？', opts: ['希腊', '印度', '中国', '阿拉伯'], correct: 2, exp: '指南针是中国古代四大发明之一，最早为司南。' },
      { q: '罗马帝国灭亡的公元年份大约是？', opts: ['375 年', '395 年', '476 年', '500 年'], correct: 2, exp: '西罗马帝国于 476 年灭亡，标志着欧洲古代史的结束和中世纪的开始。' },
    ]
  },
  // 哲学思想 (level 3)
  {
    level: getLevel(4, 3),
    questions: [
      { q: '"我思故我在"是哪位哲学家的名言？', opts: ['柏拉图', '笛卡尔', '康德', '尼采'], correct: 1, exp: '"Cogito, ergo sum"（我思故我在）是笛卡尔的认识论基础。' },
      { q: '儒家思想的核心是什么？', opts: ['无为而治', '仁和礼', '兼爱非攻', '法不阿贵'], correct: 1, exp: '儒家以"仁"为核心，"礼"为行为规范。' },
      { q: '古希腊三贤不包括以下哪位？', opts: ['苏格拉底', '柏拉图', '亚里士多德', '毕达哥拉斯'], correct: 3, exp: '古希腊三贤是苏格拉底、柏拉图和亚里士多德（师徒三代）。' },
      { q: '尼采提出的著名概念是？', opts: ['绝对精神', '超人哲学', '存在先于本质', '无知之幕'], correct: 1, exp: '尼采提出"超人"（Übermensch）概念，代表超越传统道德的理想人格。' },
      { q: '道家思想的创始人是？', opts: ['孔子', '老子', '墨子', '韩非子'], correct: 1, exp: '老子是道家思想创始人，著有《道德经》。' },
      { q: '"无知之幕"是哪个哲学家的思想实验？', opts: ['边沁', '密尔', '罗尔斯', '诺齐克'], correct: 2, exp: '"无知之幕"是罗尔斯在《正义论》中提出的公平原则思想实验。' },
    ]
  },
  // 艺术鉴赏 (level 4)
  {
    level: getLevel(4, 4),
    questions: [
      { q: '《蒙娜丽莎》是谁的作品？', opts: ['米开朗基罗', '达·芬奇', '拉斐尔', '梵高'], correct: 1, exp: '《蒙娜丽莎》是达·芬奇的代表作，现藏于法国卢浮宫。' },
      { q: '贝多芬的第五交响曲别称是什么？', opts: ['命运交响曲', '英雄交响曲', '田园交响曲', '合唱交响曲'], correct: 0, exp: '贝多芬第五交响曲以开头的"命运动机"闻名，被称为《命运交响曲》。' },
      { q: '印象派的代表人物是谁？', opts: ['达利', '莫奈', '毕加索', '康定斯基'], correct: 1, exp: '莫奈是印象派代表人物，其作品《日出·印象》得名于印象派。' },
      { q: '中国传统绘画中的"四君子"指什么？', opts: ['梅兰竹菊', '松竹梅兰', '兰菊竹莲', '梅松竹菊'], correct: 0, exp: '四君子指梅、兰、竹、菊，象征高洁品格。' },
      { q: '电影最早是由谁发明的？', opts: ['爱迪生', '卢米埃尔兄弟', '梅里爱', '格里菲斯'], correct: 1, exp: '卢米埃尔兄弟于 1895 年首次公开放映电影。' },
      { q: '芭蕾舞起源于哪个国家？', opts: ['法国', '俄罗斯', '意大利', '英国'], correct: 2, exp: '芭蕾舞起源于意大利文艺复兴时期，后在法国和俄罗斯发展成熟。' },
    ]
  },
  // 文化比较 (level 5)
  {
    level: getLevel(4, 5),
    questions: [
      { q: '春节的起源与哪个传说有关？', opts: ['嫦娥奔月', '年兽', '牛郎织女', '白蛇传'], correct: 1, exp: '春节源于年兽传说，人们通过放鞭炮、贴春联等方式驱赶年兽。' },
      { q: '日本茶道的精神核心是什么？', opts: ['华丽', '和敬清寂', '效率', '竞争'], correct: 1, exp: '日本茶道的核心理念是"和敬清寂"，强调和谐、尊敬、清净和寂静。' },
      { q: '圣诞节是为了纪念谁？', opts: ['圣诞老人', '耶稣基督', '圣母玛利亚', '圣彼得'], correct: 1, exp: '圣诞节（12 月 25 日）是基督教纪念耶稣诞生的节日。' },
      { q: '中秋节的传统食物是什么？', opts: ['粽子', '月饼', '汤圆', '饺子'], correct: 1, exp: '中秋节的标志性食品是月饼，象征团圆。' },
      { q: '以下哪个是伊斯兰教的节日？', opts: ['圣诞节', '排灯节', '开斋节', '浴佛节'], correct: 2, exp: '开斋节是伊斯兰教重要节日，标志着斋月结束。' },
      { q: '中国书法五种主要书体不包括？', opts: ['篆书', '隶书', '楷书', '印刷体'], correct: 3, exp: '五种主要书体为篆、隶、楷、行、草。印刷体不是书法书体。' },
    ]
  },
];

// Insert all questions
console.log('📝 插入科学题目...');
for (const group of scienceQuestions) {
  for (let i = 0; i < group.questions.length; i++) {
    const q = group.questions[i];
    insertQuestion.run(
      crypto.randomUUID(),
      group.level.id,
      q.q,
      JSON.stringify(q.opts),
      q.correct,
      q.exp,
      JSON.stringify(['科学']),
      'easy',
      i + 1
    );
  }
}

console.log('📝 插入社会题目...');
for (const group of societyQuestions) {
  for (let i = 0; i < group.questions.length; i++) {
    const q = group.questions[i];
    insertQuestion.run(
      crypto.randomUUID(),
      group.level.id,
      q.q,
      JSON.stringify(q.opts),
      q.correct,
      q.exp,
      JSON.stringify(['社会']),
      'easy',
      i + 1
    );
  }
}

console.log('📝 插入逻辑题目...');
for (const group of logicQuestions) {
  for (let i = 0; i < group.questions.length; i++) {
    const q = group.questions[i];
    insertQuestion.run(
      crypto.randomUUID(),
      group.level.id,
      q.q,
      JSON.stringify(q.opts),
      q.correct,
      q.exp,
      JSON.stringify(['逻辑']),
      'easy',
      i + 1
    );
  }
}

console.log('📝 插入生活题目...');
for (const group of lifeQuestions) {
  for (let i = 0; i < group.questions.length; i++) {
    const q = group.questions[i];
    insertQuestion.run(
      crypto.randomUUID(),
      group.level.id,
      q.q,
      JSON.stringify(q.opts),
      q.correct,
      q.exp,
      JSON.stringify(['生活']),
      'easy',
      i + 1
    );
  }
}

console.log('📝 插入人文题目...');
for (const group of humanitiesQuestions) {
  for (let i = 0; i < group.questions.length; i++) {
    const q = group.questions[i];
    insertQuestion.run(
      crypto.randomUUID(),
      group.level.id,
      q.q,
      JSON.stringify(q.opts),
      q.correct,
      q.exp,
      JSON.stringify(['人文']),
      'easy',
      i + 1
    );
  }
}

// ========== 6. 为测试用户解锁第一关（科学-物理入门）================
console.log('📝 为测试用户解锁第一关...');

const firstLevel = levels.find(l => l.category_id === categories[0].id && l.level_number === 1);
if (firstLevel) {
  db.prepare(`
    INSERT OR IGNORE INTO user_progress (id, user_id, level_id, status, best_score, attempts)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), testUserId, firstLevel.id, 'unlocked', 0, 0);
}

db.close();

console.log('');
console.log('✅  种子数据导入完成！');
console.log('');
console.log('📊  统计信息：');
console.log(`   - 测试用户：13800000000`);
console.log(`   - 测试管理员：testadmin / test123`);
console.log(`   - 学科分类：${categories.length} 个`);
console.log(`   - 关卡：${levels.length} 个`);
console.log(`   - 题目：150 道`);
console.log('');
console.log('🚀 启动服务：npm run dev');
