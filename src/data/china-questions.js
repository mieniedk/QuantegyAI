/**
 * China teacher certification prep — 教师资格考试 style.
 * Available in English and 中文. Same structure as other prep for TestPrepPage.
 */

// ─── Comprehensive Quality (English) 综合素质 ───
export const CHINA_COMPREHENSIVE_EN_DOMAINS = [
  { id: 'cn_comp_lit', name: 'General Literacy & Culture', desc: 'Reading, writing, general knowledge', weight: 0.35, games: [] },
  { id: 'cn_comp_ethics', name: 'Ethics & Regulations', desc: 'Teacher ethics, education law', weight: 0.35, games: [] },
  { id: 'cn_comp_logic', name: 'Logic & Reasoning', desc: 'Logical reasoning, problem solving', weight: 0.30, games: [] },
];

export const CHINA_COMPREHENSIVE_EN_QUESTIONS = [
  { id: 'cce1', comp: 'cn_comp_lit', type: 'mc', difficulty: 1, q: 'The main idea of a passage is typically:', choices: ['one detail', 'the central point or message the author conveys', 'the first sentence only', 'the title only'], answer: 'the central point or message the author conveys', explanation: 'Main idea = central message of the text.' },
  { id: 'cce2', comp: 'cn_comp_ethics', type: 'mc', difficulty: 1, q: 'Teacher professional ethics in China emphasise:', choices: ['only academic results', 'moral cultivation, care for students, and integrity', 'only discipline', 'no standards'], answer: 'moral cultivation, care for students, and integrity', explanation: 'Teacher ethics stress virtue, student care, and professional conduct.' },
  { id: 'cce3', comp: 'cn_comp_ethics', type: 'mc', difficulty: 2, q: 'The Education Law and related regulations require teachers to:', choices: ['ignore student rights', 'protect students\' lawful rights and promote their development', 'only teach the curriculum', 'avoid assessment'], answer: 'protect students\' lawful rights and promote their development', explanation: 'Law and regulations protect student rights and development.' },
  { id: 'cce4', comp: 'cn_comp_logic', type: 'mc', difficulty: 1, q: 'If all A are B, and all B are C, then:', choices: ['no conclusion', 'all A are C', 'all C are A', 'some B are not A'], answer: 'all A are C', explanation: 'Syllogism: A ⊆ B and B ⊆ C implies A ⊆ C.' },
  { id: 'cce5', comp: 'cn_comp_logic', type: 'mc', difficulty: 2, q: 'Logical reasoning in teaching helps with:', choices: ['only memorisation', 'analysing problems, designing lessons, and evaluating arguments', 'ignoring evidence', 'only exams'], answer: 'analysing problems, designing lessons, and evaluating arguments', explanation: 'Reasoning supports analysis, design, and evaluation.' },
  { id: 'cce6', comp: 'cn_comp_lit', type: 'mc', difficulty: 2, q: 'Comprehension of a text involves:', choices: ['only decoding', 'understanding, interpreting, and reflecting on meaning', 'only speed', 'only vocabulary'], answer: 'understanding, interpreting, and reflecting on meaning', explanation: 'Comprehension = making and reflecting on meaning.' },
];

// ─── Comprehensive Quality (中文) 综合素质 ───
export const CHINA_COMPREHENSIVE_ZH_DOMAINS = [
  { id: 'cn_comp_lit', name: '综合素养与文化', desc: '阅读、写作、常识', weight: 0.35, games: [] },
  { id: 'cn_comp_ethics', name: '职业道德与法规', desc: '教师道德、教育法规', weight: 0.35, games: [] },
  { id: 'cn_comp_logic', name: '逻辑与推理', desc: '逻辑推理、问题解决', weight: 0.30, games: [] },
];

export const CHINA_COMPREHENSIVE_ZH_QUESTIONS = [
  { id: 'ccz1', comp: 'cn_comp_lit', type: 'mc', difficulty: 1, q: '段落的中心思想通常指：', choices: ['一个细节', '作者传达的核心观点或主旨', '仅第一句', '仅标题'], answer: '作者传达的核心观点或主旨', explanation: '中心思想即文章的核心内容或主旨。' },
  { id: 'ccz2', comp: 'cn_comp_ethics', type: 'mc', difficulty: 1, q: '我国教师职业道德强调：', choices: ['仅考试成绩', '立德树人、关爱学生、为人师表', '仅纪律', '无标准'], answer: '立德树人、关爱学生、为人师表', explanation: '教师职业道德强调品德、关爱与师表。' },
  { id: 'ccz3', comp: 'cn_comp_ethics', type: 'mc', difficulty: 2, q: '《教师法》及相关法规要求教师：', choices: ['忽视学生权利', '保护学生合法权益，促进学生发展', '只教教材', '不做评价'], answer: '保护学生合法权益，促进学生发展', explanation: '法律法规保障学生权益与全面发展。' },
  { id: 'ccz4', comp: 'cn_comp_logic', type: 'mc', difficulty: 1, q: '若所有A是B，且所有B是C，则：', choices: ['无法结论', '所有A是C', '所有C是A', '有些B不是A'], answer: '所有A是C', explanation: '三段论：A⊆B且B⊆C 则 A⊆C。' },
  { id: 'ccz5', comp: 'cn_comp_logic', type: 'mc', difficulty: 2, q: '逻辑推理在教学中有助于：', choices: ['仅记忆', '分析问题、设计教学、评估论证', '忽视证据', '仅应试'], answer: '分析问题、设计教学、评估论证', explanation: '逻辑推理支持分析、设计与评价。' },
  { id: 'ccz6', comp: 'cn_comp_lit', type: 'mc', difficulty: 2, q: '对文本的理解包括：', choices: ['仅认字', '理解、解释与反思意义', '仅速度', '仅词汇'], answer: '理解、解释与反思意义', explanation: '理解即把握并反思文本意义。' },
];

// ─── Pedagogy & Psychology (English) 教育知识与能力 ───
export const CHINA_PEDAGOGY_EN_DOMAINS = [
  { id: 'cn_ped_dev', name: 'Child Development', desc: 'Development stages, individual differences', weight: 0.35, games: [] },
  { id: 'cn_ped_learn', name: 'Learning Theory', desc: 'Learning processes, motivation', weight: 0.35, games: [] },
  { id: 'cn_ped_teach', name: 'Teaching Design & Assessment', desc: 'Lesson design, assessment', weight: 0.30, games: [] },
];

export const CHINA_PEDAGOGY_EN_QUESTIONS = [
  { id: 'cpe1', comp: 'cn_ped_dev', type: 'mc', difficulty: 1, q: 'Piaget\'s concrete operational stage is characterised by:', choices: ['sensorimotor only', 'logical thought about concrete objects and events', 'only abstract reasoning', 'no logic'], answer: 'logical thought about concrete objects and events', explanation: 'Concrete operational (about 7–11) involves logical thinking about concrete things.' },
  { id: 'cpe2', comp: 'cn_ped_dev', type: 'mc', difficulty: 2, q: 'Individual differences among students require teachers to:', choices: ['teach everyone the same way', 'differentiate instruction and support according to needs', 'only focus on high achievers', 'ignore differences'], answer: 'differentiate instruction and support according to needs', explanation: 'Differentiation addresses varied needs and strengths.' },
  { id: 'cpe3', comp: 'cn_ped_learn', type: 'mc', difficulty: 1, q: 'Vygotsky\'s zone of proximal development (ZPD) refers to:', choices: ['what the child can do alone', 'what the child can achieve with guidance or scaffolding', 'only independent work', 'fixed ability'], answer: 'what the child can achieve with guidance or scaffolding', explanation: 'ZPD = range where support enables new learning.' },
  { id: 'cpe4', comp: 'cn_ped_learn', type: 'mc', difficulty: 2, q: 'Formative assessment is used to:', choices: ['only give grades', 'guide teaching and learning during instruction', 'replace summative assessment', 'rank students only'], answer: 'guide teaching and learning during instruction', explanation: 'Formative assessment supports ongoing improvement.' },
  { id: 'cpe5', comp: 'cn_ped_teach', type: 'mc', difficulty: 1, q: 'Teaching objectives in a lesson plan should be:', choices: ['vague', 'clear, measurable, and aligned with curriculum', 'only for the teacher', 'optional'], answer: 'clear, measurable, and aligned with curriculum', explanation: 'Objectives should be clear and measurable.' },
  { id: 'cpe6', comp: 'cn_ped_teach', type: 'mc', difficulty: 2, q: 'Inclusive education aims to:', choices: ['separate by ability', 'enable all students to participate and learn with appropriate support', 'only mainstream', 'no support'], answer: 'enable all students to participate and learn with appropriate support', explanation: 'Inclusion = all students with access and support.' },
];

// ─── Pedagogy & Psychology (中文) 教育知识与能力 ───
export const CHINA_PEDAGOGY_ZH_DOMAINS = [
  { id: 'cn_ped_dev', name: '儿童发展', desc: '发展阶段、个体差异', weight: 0.35, games: [] },
  { id: 'cn_ped_learn', name: '学习理论', desc: '学习过程、动机', weight: 0.35, games: [] },
  { id: 'cn_ped_teach', name: '教学设计与评价', desc: '教案设计、教学评价', weight: 0.30, games: [] },
];

export const CHINA_PEDAGOGY_ZH_QUESTIONS = [
  { id: 'cpz1', comp: 'cn_ped_dev', type: 'mc', difficulty: 1, q: '皮亚杰的具体运算阶段的特点是：', choices: ['仅感知运动', '对具体事物和情境进行逻辑思维', '仅抽象推理', '无逻辑'], answer: '对具体事物和情境进行逻辑思维', explanation: '具体运算阶段（约7–11岁）能对具体事物进行逻辑思维。' },
  { id: 'cpz2', comp: 'cn_ped_dev', type: 'mc', difficulty: 2, q: '学生个体差异要求教师：', choices: ['统一教法', '因材施教、按需支持', '只关注优等生', '忽视差异'], answer: '因材施教、按需支持', explanation: '因材施教针对不同需要与特点。' },
  { id: 'cpz3', comp: 'cn_ped_learn', type: 'mc', difficulty: 1, q: '维果茨基的“最近发展区”指：', choices: ['儿童独立能做的', '在成人或同伴帮助下能达到的水平', '仅独立完成', '固定能力'], answer: '在成人或同伴帮助下能达到的水平', explanation: '最近发展区即借助支持可完成的区间。' },
  { id: 'cpz4', comp: 'cn_ped_learn', type: 'mc', difficulty: 2, q: '形成性评价用于：', choices: ['仅打分', '在教学过程中改进教与学', '取代总结性评价', '仅排名'], answer: '在教学过程中改进教与学', explanation: '形成性评价为教学提供反馈以改进。' },
  { id: 'cpz5', comp: 'cn_ped_teach', type: 'mc', difficulty: 1, q: '教案中的教学目标应：', choices: ['笼统', '明确、可测、与课标一致', '仅教师用', '可有可无'], answer: '明确、可测、与课标一致', explanation: '教学目标应具体、可测量。' },
  { id: 'cpz6', comp: 'cn_ped_teach', type: 'mc', difficulty: 2, q: '融合教育旨在：', choices: ['按能力分班', '让所有学生在适当支持下参与和学习', '仅普通班', '无支持'], answer: '让所有学生在适当支持下参与和学习', explanation: '融合教育强调全体参与与支持。' },
];

// ─── Subject & Teaching (English) 学科知识与教学能力 ───
export const CHINA_SUBJECT_EN_DOMAINS = [
  { id: 'cn_sub_know', name: 'Subject Knowledge', desc: 'Core concepts, curriculum content', weight: 0.40, games: ['math-sprint'] },
  { id: 'cn_sub_method', name: 'Teaching Methods', desc: 'Pedagogy, strategies', weight: 0.35, games: [] },
  { id: 'cn_sub_assess', name: 'Assessment & Reflection', desc: 'Evaluation, reflection', weight: 0.25, games: [] },
];

export const CHINA_SUBJECT_EN_QUESTIONS = [
  { id: 'cse1', comp: 'cn_sub_know', type: 'mc', difficulty: 1, q: 'What is 25% of 80?', choices: ['18', '20', '22', '25'], answer: '20', explanation: '0.25 × 80 = 20.' },
  { id: 'cse2', comp: 'cn_sub_know', type: 'mc', difficulty: 2, q: 'Solve: 3x − 5 = 16', choices: ['5', '6', '7', '8'], answer: '7', explanation: '3x = 21, x = 7.' },
  { id: 'cse3', comp: 'cn_sub_method', type: 'mc', difficulty: 1, q: 'Hands-on and inquiry-based learning help students:', choices: ['only memorise', 'construct understanding through experience and exploration', 'only listen', 'ignore concepts'], answer: 'construct understanding through experience and exploration', explanation: 'Experiential and inquiry methods support deep understanding.' },
  { id: 'cse4', comp: 'cn_sub_method', type: 'mc', difficulty: 2, q: 'Differentiating by content, process, and product means:', choices: ['same for all', 'varying what students learn, how they learn, and how they show learning', 'only by product', 'no variation'], answer: 'varying what students learn, how they learn, and how they show learning', explanation: 'Differentiation adjusts content, process, and product.' },
  { id: 'cse5', comp: 'cn_sub_assess', type: 'mc', difficulty: 1, q: 'Summative assessment is typically used to:', choices: ['guide daily teaching', 'evaluate learning at the end of a unit or period', 'replace formative', 'only give feedback'], answer: 'evaluate learning at the end of a unit or period', explanation: 'Summative = assessment of learning at a point in time.' },
  { id: 'cse6', comp: 'cn_sub_assess', type: 'mc', difficulty: 2, q: 'Teacher reflection after a lesson helps to:', choices: ['ignore problems', 'improve future teaching based on what worked and what did not', 'only record grades', 'avoid change'], answer: 'improve future teaching based on what worked and what did not', explanation: 'Reflection supports continuous improvement.' },
];

// ─── Subject & Teaching (中文) 学科知识与教学能力 ───
export const CHINA_SUBJECT_ZH_DOMAINS = [
  { id: 'cn_sub_know', name: '学科知识', desc: '核心概念、课标内容', weight: 0.40, games: ['math-sprint'] },
  { id: 'cn_sub_method', name: '教学方法', desc: '教学策略、教法', weight: 0.35, games: [] },
  { id: 'cn_sub_assess', name: '评价与反思', desc: '教学评价、反思', weight: 0.25, games: [] },
];

export const CHINA_SUBJECT_ZH_QUESTIONS = [
  { id: 'csz1', comp: 'cn_sub_know', type: 'mc', difficulty: 1, q: '80 的 25% 是多少？', choices: ['18', '20', '22', '25'], answer: '20', explanation: '0.25 × 80 = 20。' },
  { id: 'csz2', comp: 'cn_sub_know', type: 'mc', difficulty: 2, q: '解方程：3x − 5 = 16', choices: ['5', '6', '7', '8'], answer: '7', explanation: '3x = 21，x = 7。' },
  { id: 'csz3', comp: 'cn_sub_method', type: 'mc', difficulty: 1, q: '动手实践与探究式学习有助于学生：', choices: ['仅记忆', '通过体验与探究建构理解', '仅听讲', '忽视概念'], answer: '通过体验与探究建构理解', explanation: '体验与探究有助于深度理解。' },
  { id: 'csz4', comp: 'cn_sub_method', type: 'mc', difficulty: 2, q: '在内容、过程、成果上因材施教指：', choices: ['完全一致', '在学习内容、学习方式、成果展示上有所区分', '仅看成果', '无区分'], answer: '在学习内容、学习方式、成果展示上有所区分', explanation: '分层体现在内容、过程与成果。' },
  { id: 'csz5', comp: 'cn_sub_assess', type: 'mc', difficulty: 1, q: '总结性评价通常用于：', choices: ['指导日常教学', '在单元或阶段结束时评价学习结果', '取代形成性', '仅给反馈'], answer: '在单元或阶段结束时评价学习结果', explanation: '总结性评价即某一阶段的学业评价。' },
  { id: 'csz6', comp: 'cn_sub_assess', type: 'mc', difficulty: 2, q: '课后教学反思有助于：', choices: ['忽视问题', '根据成败改进后续教学', '仅记成绩', '不改变'], answer: '根据成败改进后续教学', explanation: '反思促进教学改进。' },
];

// ─── Test configs ───
export const CHINA_TEST_CONFIG = {
  comprehensive_en: { totalQuestions: 120, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cn_comp_lit: 42, cn_comp_ethics: 42, cn_comp_logic: 36 } },
  comprehensive_zh: { totalQuestions: 120, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cn_comp_lit: 42, cn_comp_ethics: 42, cn_comp_logic: 36 } },
  pedagogy_en: { totalQuestions: 120, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cn_ped_dev: 42, cn_ped_learn: 42, cn_ped_teach: 36 } },
  pedagogy_zh: { totalQuestions: 120, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cn_ped_dev: 42, cn_ped_learn: 42, cn_ped_teach: 36 } },
  subject_en: { totalQuestions: 120, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cn_sub_know: 48, cn_sub_method: 42, cn_sub_assess: 30 } },
  subject_zh: { totalQuestions: 120, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cn_sub_know: 48, cn_sub_method: 42, cn_sub_assess: 30 } },
};

export function getChinaQuestionsForExam(examId) {
  const map = {
    comprehensive_en: CHINA_COMPREHENSIVE_EN_QUESTIONS,
    comprehensive_zh: CHINA_COMPREHENSIVE_ZH_QUESTIONS,
    pedagogy_en: CHINA_PEDAGOGY_EN_QUESTIONS,
    pedagogy_zh: CHINA_PEDAGOGY_ZH_QUESTIONS,
    subject_en: CHINA_SUBJECT_EN_QUESTIONS,
    subject_zh: CHINA_SUBJECT_ZH_QUESTIONS,
  };
  return map[examId] || CHINA_COMPREHENSIVE_EN_QUESTIONS;
}

export function getChinaDomainsForExam(examId) {
  const map = {
    comprehensive_en: CHINA_COMPREHENSIVE_EN_DOMAINS,
    comprehensive_zh: CHINA_COMPREHENSIVE_ZH_DOMAINS,
    pedagogy_en: CHINA_PEDAGOGY_EN_DOMAINS,
    pedagogy_zh: CHINA_PEDAGOGY_ZH_DOMAINS,
    subject_en: CHINA_SUBJECT_EN_DOMAINS,
    subject_zh: CHINA_SUBJECT_ZH_DOMAINS,
  };
  return map[examId] || CHINA_COMPREHENSIVE_EN_DOMAINS;
}
