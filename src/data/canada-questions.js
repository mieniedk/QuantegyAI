/**
 * Canadian teacher certification prep — by province/territory.
 * All 10 provinces + 3 territories. Same structure as other prep data for TestPrepPage.
 */

// ─── Ontario ───
export const ONTARIO_DOMAINS = [
  { id: 'on_math', name: 'Math Proficiency', desc: 'Number, algebra, geometry, data', weight: 0.40, games: ['math-sprint', 'algebra-sprint', 'fraction-pizza'] },
  { id: 'on_prof', name: 'Professional Knowledge', desc: 'Curriculum, assessment, pedagogy', weight: 0.35, games: [] },
  { id: 'on_lit', name: 'Literacy & Communication', desc: 'Reading, writing, communication', weight: 0.25, games: [] },
];

export const ONTARIO_QUESTIONS = [
  { id: 'on1', comp: 'on_math', type: 'mc', difficulty: 1, q: 'What is 15% of 200?', choices: ['20', '25', '30', '35'], answer: '30', explanation: '0.15 × 200 = 30.' },
  { id: 'on2', comp: 'on_math', type: 'mc', difficulty: 2, q: 'Solve: 3x + 5 = 20', choices: ['3', '5', '6', '7'], answer: '5', explanation: '3x = 15, x = 5.' },
  { id: 'on3', comp: 'on_math', type: 'mc', difficulty: 1, q: 'Area of a circle with radius 5? (πr²)', choices: ['10π', '25π', '5π', '15π'], answer: '25π', explanation: 'π(5)² = 25π.' },
  { id: 'on4', comp: 'on_prof', type: 'mc', difficulty: 1, q: 'Differentiated instruction aims to:', choices: ['teach the same way to all', 'meet diverse learner needs', 'reduce curriculum', 'eliminate assessment'], answer: 'meet diverse learner needs', explanation: 'Differentiation adjusts content, process, product.' },
  { id: 'on5', comp: 'on_prof', type: 'mc', difficulty: 2, q: 'Formative assessment is used to:', choices: ['assign final grades only', 'guide teaching and learning during instruction', 'replace summative assessment', 'report to parents only'], answer: 'guide teaching and learning during instruction', explanation: 'Formative = ongoing feedback for improvement.' },
  { id: 'on6', comp: 'on_lit', type: 'mc', difficulty: 1, q: 'A thesis statement in an essay typically:', choices: ['appears only in the conclusion', 'states the main argument or claim', 'lists sources', 'is optional'], answer: 'states the main argument or claim', explanation: 'Thesis = central claim of the essay.' },
];

// ─── British Columbia ───
export const BC_DOMAINS = [
  { id: 'bc_math', name: 'Numeracy & Math', desc: 'Number, operations, problem solving', weight: 0.40, games: ['math-sprint', 'q-blocks'] },
  { id: 'bc_curr', name: 'BC Curriculum & Pedagogy', desc: 'Core competencies, Big Ideas', weight: 0.35, games: [] },
  { id: 'bc_prof', name: 'Professional Practice', desc: 'Standards, ethics, Indigenous education', weight: 0.25, games: [] },
];

export const BC_QUESTIONS = [
  { id: 'bc1', comp: 'bc_math', type: 'mc', difficulty: 1, q: 'Simplify: 2/3 × 6', choices: ['4', '6', '8', '12'], answer: '4', explanation: '2/3 × 6 = 12/3 = 4.' },
  { id: 'bc2', comp: 'bc_math', type: 'mc', difficulty: 2, q: 'A price increased 20% then decreased 20%. Compared to original it is:', choices: ['same', 'higher', 'lower', 'cannot tell'], answer: 'lower', explanation: '1.2 × 0.8 = 0.96 (4% lower).' },
  { id: 'bc3', comp: 'bc_curr', type: 'mc', difficulty: 1, q: 'BC curriculum emphasizes core competencies including:', choices: ['only content knowledge', 'communication, thinking, personal & social', 'only standardized tests', 'no competencies'], answer: 'communication, thinking, personal & social', explanation: 'Core competencies are central to BC curriculum.' },
  { id: 'bc4', comp: 'bc_curr', type: 'mc', difficulty: 2, q: '"Big Ideas" in BC curriculum refer to:', choices: ['only facts', 'enduring understandings that connect learning', 'single lessons', 'optional topics'], answer: 'enduring understandings that connect learning', explanation: 'Big Ideas are key conceptual understandings.' },
  { id: 'bc5', comp: 'bc_prof', type: 'mc', difficulty: 1, q: 'TRB in BC stands for:', choices: ['Teacher Registration Board', 'Teacher Regulation Branch', 'Teaching Resources Bureau', 'Test Review Board'], answer: 'Teacher Regulation Branch', explanation: 'TRB regulates certification in BC.' },
];

// ─── Alberta ───
export const ALBERTA_DOMAINS = [
  { id: 'ab_math', name: 'Mathematics Content', desc: 'Number, algebra, geometry, data', weight: 0.40, games: ['math-sprint', 'equation-balance'] },
  { id: 'ab_curr', name: 'Program of Studies', desc: 'Outcomes, competencies', weight: 0.35, games: [] },
  { id: 'ab_prof', name: 'Professional Responsibilities', desc: 'Teaching quality, inclusion', weight: 0.25, games: [] },
];

export const ALBERTA_QUESTIONS = [
  { id: 'ab1', comp: 'ab_math', type: 'mc', difficulty: 1, q: 'What is 4² + 3²?', choices: ['7', '25', '12', '49'], answer: '25', explanation: '16 + 9 = 25.' },
  { id: 'ab2', comp: 'ab_math', type: 'mc', difficulty: 2, q: 'If 5n − 2 = 18, then n =', choices: ['3', '4', '5', '6'], answer: '4', explanation: '5n = 20, n = 4.' },
  { id: 'ab3', comp: 'ab_curr', type: 'mc', difficulty: 1, q: 'Alberta Program of Studies defines:', choices: ['only textbooks', 'learning outcomes by grade and subject', 'only assessment', 'optional content'], answer: 'learning outcomes by grade and subject', explanation: 'Program of Studies outlines required outcomes.' },
  { id: 'ab4', comp: 'ab_prof', type: 'mc', difficulty: 1, q: 'Inclusive education in Alberta emphasizes:', choices: ['excluding some students', 'welcoming all learners and reducing barriers', 'only special education classes', 'no accommodations'], answer: 'welcoming all learners and reducing barriers', explanation: 'Inclusion = all students belong and participate.' },
];

// ─── Quebec ───
export const QUEBEC_DOMAINS = [
  { id: 'qc_math', name: 'Mathématiques', desc: 'Nombre, algèbre, géométrie', weight: 0.40, games: ['math-sprint'] },
  { id: 'qc_prog', name: 'Programme & Compétences', desc: 'Programme québécois, compétences', weight: 0.35, games: [] },
  { id: 'qc_prof', name: 'Pratique professionnelle', desc: 'Éthique, différenciation', weight: 0.25, games: [] },
];

export const QUEBEC_QUESTIONS = [
  { id: 'qc1', comp: 'qc_math', type: 'mc', difficulty: 1, q: 'Quel est le résultat de 7 × 8?', choices: ['54', '56', '58', '64'], answer: '56', explanation: '7 × 8 = 56.' },
  { id: 'qc2', comp: 'qc_math', type: 'mc', difficulty: 2, q: 'Résoudre: 2x + 4 = 14', choices: ['x = 4', 'x = 5', 'x = 6', 'x = 9'], answer: 'x = 5', explanation: '2x = 10, x = 5.' },
  { id: 'qc3', comp: 'qc_prog', type: 'mc', difficulty: 1, q: 'Le programme du Québec met l\'accent sur:', choices: ['seulement les examens', 'compétences et savoirs disciplinaires', 'aucune compétence', 'uniquement le français'], answer: 'compétences et savoirs disciplinaires', explanation: 'Programme intègre compétences et contenus.' },
  { id: 'qc4', comp: 'qc_prof', type: 'mc', difficulty: 1, q: 'La différenciation pédagogique vise à:', choices: ['enseigner la même chose à tous', 'adapter l\'enseignement aux besoins des élèves', 'réduire les attentes', 'éliminer l\'évaluation'], answer: 'adapter l\'enseignement aux besoins des élèves', explanation: 'Différenciation = adapter pour la réussite de tous.' },
];

// ─── Saskatchewan ───
export const SASKATCHEWAN_DOMAINS = [
  { id: 'sk_math', name: 'Mathematics', desc: 'Number, algebra, geometry, data', weight: 0.40, games: ['math-sprint'] },
  { id: 'sk_curr', name: 'Curriculum & Instruction', desc: 'Outcomes, pedagogy', weight: 0.35, games: [] },
  { id: 'sk_prof', name: 'Professional Practice', desc: 'Standards, ethics, inclusion', weight: 0.25, games: [] },
];
export const SASKATCHEWAN_QUESTIONS = [
  { id: 'sk1', comp: 'sk_math', type: 'mc', difficulty: 1, q: 'What is 12 × 11?', choices: ['121', '132', '122', '111'], answer: '132', explanation: '12 × 11 = 132.' },
  { id: 'sk2', comp: 'sk_math', type: 'mc', difficulty: 2, q: 'Solve: 2x − 5 = 11', choices: ['3', '6', '8', '10'], answer: '8', explanation: '2x = 16, x = 8.' },
  { id: 'sk3', comp: 'sk_curr', type: 'mc', difficulty: 1, q: 'Saskatchewan curriculum is organized by:', choices: ['outcomes and indicators', 'textbooks only', 'exams only', 'no framework'], answer: 'outcomes and indicators', explanation: 'Curriculum defines outcomes and indicators by grade.' },
  { id: 'sk4', comp: 'sk_curr', type: 'mc', difficulty: 2, q: 'Constructivist approaches in SK emphasize:', choices: ['only lecture', 'students building understanding through active learning', 'no group work', 'testing only'], answer: 'students building understanding through active learning', explanation: 'Constructivism values active, sense-making learning.' },
  { id: 'sk5', comp: 'sk_prof', type: 'mc', difficulty: 1, q: 'Professional growth in SK teaching includes:', choices: ['no ongoing learning', 'continuous learning and reflection', 'only initial certification', 'only subject content'], answer: 'continuous learning and reflection', explanation: 'Teachers are expected to engage in ongoing professional development.' },
  { id: 'sk6', comp: 'sk_prof', type: 'mc', difficulty: 2, q: 'Ethical teaching practice includes:', choices: ['confidentiality and fairness', 'sharing student data openly', 'no professional boundaries', 'ignoring diversity'], answer: 'confidentiality and fairness', explanation: 'Ethics include confidentiality, fairness, and integrity.' },
];

// ─── Manitoba ───
export const MANITOBA_DOMAINS = [
  { id: 'mb_math', name: 'Numeracy & Math', desc: 'Number, operations, problem solving', weight: 0.40, games: ['math-sprint'] },
  { id: 'mb_curr', name: 'Curriculum & Pedagogy', desc: 'Outcomes, Manitoba framework', weight: 0.35, games: [] },
  { id: 'mb_prof', name: 'Professional Standards', desc: 'Ethics, Indigenous perspectives', weight: 0.25, games: [] },
];
export const MANITOBA_QUESTIONS = [
  { id: 'mb1', comp: 'mb_math', type: 'mc', difficulty: 1, q: 'Simplify: 18 ÷ 3 + 4', choices: ['6', '10', '12', '22'], answer: '10', explanation: '18 ÷ 3 = 6, 6 + 4 = 10.' },
  { id: 'mb2', comp: 'mb_math', type: 'mc', difficulty: 2, q: 'What is 20% of 150?', choices: ['25', '30', '35', '40'], answer: '30', explanation: '0.20 × 150 = 30.' },
  { id: 'mb3', comp: 'mb_curr', type: 'mc', difficulty: 1, q: 'Manitoba curriculum emphasizes:', choices: ['only testing', 'learning outcomes and competencies', 'no outcomes', 'optional content'], answer: 'learning outcomes and competencies', explanation: 'Curriculum outlines outcomes and key competencies.' },
  { id: 'mb4', comp: 'mb_curr', type: 'mc', difficulty: 2, q: 'Assessment for learning in MB focuses on:', choices: ['only final grades', 'ongoing feedback to improve learning', 'no feedback', 'standardized tests only'], answer: 'ongoing feedback to improve learning', explanation: 'Assessment for learning supports growth during instruction.' },
  { id: 'mb5', comp: 'mb_prof', type: 'mc', difficulty: 2, q: 'Integrating Indigenous perspectives in MB education aims to:', choices: ['ignore Indigenous knowledge', 'honour and include Indigenous worldviews and knowledge', 'teach only history', 'optional only'], answer: 'honour and include Indigenous worldviews and knowledge', explanation: 'Reconciliation and inclusion of Indigenous perspectives are priorities.' },
  { id: 'mb6', comp: 'mb_prof', type: 'mc', difficulty: 1, q: 'Professional standards for MB teachers are set by:', choices: ['only schools', 'Manitoba Education and other bodies', 'federal only', 'no body'], answer: 'Manitoba Education and other bodies', explanation: 'Province and professional bodies set standards.' },
];

// ─── Nova Scotia ───
export const NOVA_SCOTIA_DOMAINS = [
  { id: 'ns_math', name: 'Mathematics', desc: 'Number, algebra, geometry, data', weight: 0.40, games: ['math-sprint'] },
  { id: 'ns_curr', name: 'Curriculum Outcomes', desc: 'Nova Scotia curriculum', weight: 0.35, games: [] },
  { id: 'ns_prof', name: 'Professional Conduct', desc: 'Standards, inclusion', weight: 0.25, games: [] },
];
export const NOVA_SCOTIA_QUESTIONS = [
  { id: 'ns1', comp: 'ns_math', type: 'mc', difficulty: 1, q: 'What is 25% of 48?', choices: ['10', '12', '14', '16'], answer: '12', explanation: '0.25 × 48 = 12.' },
  { id: 'ns2', comp: 'ns_math', type: 'mc', difficulty: 2, q: 'Perimeter of a square with side 7?', choices: ['14', '28', '49', '21'], answer: '28', explanation: '4 × 7 = 28.' },
  { id: 'ns3', comp: 'ns_curr', type: 'mc', difficulty: 1, q: 'Nova Scotia curriculum specifies:', choices: ['only textbooks', 'learning outcomes by grade and subject', 'no outcomes', 'optional only'], answer: 'learning outcomes by grade and subject', explanation: 'Curriculum defines what students should know and do.' },
  { id: 'ns4', comp: 'ns_curr', type: 'mc', difficulty: 2, q: 'Differentiated instruction in NS supports:', choices: ['one method for all', 'varied strategies to reach diverse learners', 'only high achievers', 'no variation'], answer: 'varied strategies to reach diverse learners', explanation: 'Differentiation addresses varied needs and strengths.' },
  { id: 'ns5', comp: 'ns_prof', type: 'mc', difficulty: 1, q: 'Inclusive education in NS means:', choices: ['excluding some learners', 'creating accessible learning for all students', 'no accommodations', 'special classes only'], answer: 'creating accessible learning for all students', explanation: 'Inclusion ensures all students can participate and succeed.' },
  { id: 'ns6', comp: 'ns_prof', type: 'mc', difficulty: 2, q: 'Nova Scotia teacher certification is granted by:', choices: ['federal government', 'NS Department of Education and Early Childhood Development', 'schools only', 'no body'], answer: 'NS Department of Education and Early Childhood Development', explanation: 'Province regulates teacher certification.' },
];

// ─── New Brunswick ───
export const NEW_BRUNSWICK_DOMAINS = [
  { id: 'nb_math', name: 'Mathematics', desc: 'Number, algebra, geometry', weight: 0.40, games: ['math-sprint'] },
  { id: 'nb_curr', name: 'Curriculum & Instruction', desc: 'NB curriculum, outcomes', weight: 0.35, games: [] },
  { id: 'nb_prof', name: 'Professional Practice', desc: 'Standards, bilingual context', weight: 0.25, games: [] },
];
export const NEW_BRUNSWICK_QUESTIONS = [
  { id: 'nb1', comp: 'nb_math', type: 'mc', difficulty: 1, q: 'If x + 9 = 17, then x =', choices: ['6', '8', '9', '26'], answer: '8', explanation: 'x = 17 − 9 = 8.' },
  { id: 'nb2', comp: 'nb_math', type: 'mc', difficulty: 2, q: 'What is 3/4 of 24?', choices: ['6', '12', '18', '20'], answer: '18', explanation: '(3/4) × 24 = 18.' },
  { id: 'nb3', comp: 'nb_curr', type: 'mc', difficulty: 1, q: 'New Brunswick curriculum is available in:', choices: ['English only', 'English and French', 'French only', 'neither'], answer: 'English and French', explanation: 'NB is officially bilingual; curriculum in both languages.' },
  { id: 'nb4', comp: 'nb_curr', type: 'mc', difficulty: 2, q: 'Formative assessment in NB classrooms is used to:', choices: ['only assign grades', 'inform instruction and next steps', 'replace summative', 'avoid feedback'], answer: 'inform instruction and next steps', explanation: 'Formative assessment guides teaching and learning.' },
  { id: 'nb5', comp: 'nb_prof', type: 'mc', difficulty: 1, q: 'Professional standards for NB teachers include:', choices: ['no expectations', 'ethical conduct and commitment to student learning', 'only subject knowledge', 'only experience'], answer: 'ethical conduct and commitment to student learning', explanation: 'Standards guide professional practice and accountability.' },
  { id: 'nb6', comp: 'nb_prof', type: 'mc', difficulty: 2, q: 'NB teachers are expected to:', choices: ['avoid professional learning', 'engage in ongoing professional development', 'only teach one subject', 'ignore curriculum updates'], answer: 'engage in ongoing professional development', explanation: 'Ongoing learning is part of professional practice.' },
];

// ─── Newfoundland and Labrador ───
export const NEWFOUNDLAND_DOMAINS = [
  { id: 'nl_math', name: 'Mathematics', desc: 'Number, algebra, geometry, data', weight: 0.40, games: ['math-sprint'] },
  { id: 'nl_curr', name: 'Curriculum & Assessment', desc: 'NL curriculum outcomes', weight: 0.35, games: [] },
  { id: 'nl_prof', name: 'Professional Responsibilities', desc: 'Standards, inclusion', weight: 0.25, games: [] },
];
export const NEWFOUNDLAND_QUESTIONS = [
  { id: 'nl1', comp: 'nl_math', type: 'mc', difficulty: 1, q: 'Mean of 3, 5, 7, 9?', choices: ['5', '6', '7', '8'], answer: '6', explanation: '(3+5+7+9)/4 = 6.' },
  { id: 'nl2', comp: 'nl_math', type: 'mc', difficulty: 2, q: 'Solve: 4a + 3 = 19', choices: ['3', '4', '5', '6'], answer: '4', explanation: '4a = 16, a = 4.' },
  { id: 'nl3', comp: 'nl_curr', type: 'mc', difficulty: 1, q: 'NL curriculum is developed by:', choices: ['only schools', 'provincial department of education', 'no body', 'federal only'], answer: 'provincial department of education', explanation: 'Province sets curriculum and outcomes.' },
  { id: 'nl4', comp: 'nl_curr', type: 'mc', difficulty: 2, q: 'Outcomes-based education in NL means:', choices: ['no clear goals', 'learning targets define what students should know and do', 'only tests matter', 'no curriculum'], answer: 'learning targets define what students should know and do', explanation: 'Outcomes guide planning and assessment.' },
  { id: 'nl5', comp: 'nl_prof', type: 'mc', difficulty: 2, q: 'Differentiated instruction supports:', choices: ['one size fits all', 'varied approaches to meet diverse learner needs', 'only high achievers', 'no variation'], answer: 'varied approaches to meet diverse learner needs', explanation: 'Differentiation adapts teaching to learner needs.' },
  { id: 'nl6', comp: 'nl_prof', type: 'mc', difficulty: 1, q: 'NL teacher certification is regulated by:', choices: ['federal only', 'NL Department of Education', 'schools only', 'no regulator'], answer: 'NL Department of Education', explanation: 'Province regulates certification.' },
];

// ─── Prince Edward Island ───
export const PEI_DOMAINS = [
  { id: 'pe_math', name: 'Mathematics', desc: 'Number, algebra, geometry', weight: 0.40, games: ['math-sprint'] },
  { id: 'pe_curr', name: 'Curriculum & Pedagogy', desc: 'PEI curriculum outcomes', weight: 0.35, games: [] },
  { id: 'pe_prof', name: 'Professional Practice', desc: 'Standards, ethics', weight: 0.25, games: [] },
];
export const PEI_QUESTIONS = [
  { id: 'pe1', comp: 'pe_math', type: 'mc', difficulty: 1, q: 'Area of a rectangle 8 by 5?', choices: ['13', '26', '40', '35'], answer: '40', explanation: '8 × 5 = 40.' },
  { id: 'pe2', comp: 'pe_math', type: 'mc', difficulty: 2, q: 'What is 15% of 80?', choices: ['10', '12', '15', '18'], answer: '12', explanation: '0.15 × 80 = 12.' },
  { id: 'pe3', comp: 'pe_curr', type: 'mc', difficulty: 1, q: 'PEI curriculum aligns with:', choices: ['no other jurisdiction', 'Atlantic Canadian and national considerations', 'international only', 'no framework'], answer: 'Atlantic Canadian and national considerations', explanation: 'PEI curriculum fits regional and national context.' },
  { id: 'pe4', comp: 'pe_curr', type: 'mc', difficulty: 2, q: 'Student-centred learning in PEI emphasizes:', choices: ['only teacher talk', 'active engagement and student agency', 'no choice', 'testing only'], answer: 'active engagement and student agency', explanation: 'Student-centred approaches value engagement and voice.' },
  { id: 'pe5', comp: 'pe_prof', type: 'mc', difficulty: 1, q: 'Teacher certification in PEI is granted by:', choices: ['federal government', 'PEI Department of Education', 'schools only', 'no body'], answer: 'PEI Department of Education', explanation: 'Province regulates teacher certification.' },
  { id: 'pe6', comp: 'pe_prof', type: 'mc', difficulty: 2, q: 'Inclusive practice in PEI includes:', choices: ['excluding some students', 'accessibility and belonging for all', 'no accommodations', 'special classes only'], answer: 'accessibility and belonging for all', explanation: 'Inclusion promotes access and belonging.' },
];

// ─── Northwest Territories ───
export const NWT_DOMAINS = [
  { id: 'nwt_math', name: 'Numeracy & Math', desc: 'Number, operations, problem solving', weight: 0.40, games: ['math-sprint'] },
  { id: 'nwt_curr', name: 'Curriculum & Culture', desc: 'NWT curriculum, Indigenous knowledge', weight: 0.35, games: [] },
  { id: 'nwt_prof', name: 'Professional Practice', desc: 'Standards, northern context', weight: 0.25, games: [] },
];
export const NWT_QUESTIONS = [
  { id: 'nwt1', comp: 'nwt_math', type: 'mc', difficulty: 1, q: 'What is 6 × 7?', choices: ['42', '36', '48', '13'], answer: '42', explanation: '6 × 7 = 42.' },
  { id: 'nwt2', comp: 'nwt_math', type: 'mc', difficulty: 2, q: 'If 3b + 4 = 16, then b =', choices: ['3', '4', '5', '6'], answer: '4', explanation: '3b = 12, b = 4.' },
  { id: 'nwt3', comp: 'nwt_curr', type: 'mc', difficulty: 1, q: 'NWT education often emphasizes:', choices: ['ignoring local culture', 'integrating Indigenous languages and northern perspectives', 'only southern curriculum', 'no local content'], answer: 'integrating Indigenous languages and northern perspectives', explanation: 'Northern and Indigenous context is valued in curriculum.' },
  { id: 'nwt4', comp: 'nwt_curr', type: 'mc', difficulty: 2, q: 'Place-based education in the North can include:', choices: ['only textbooks', 'local knowledge, land, and community', 'no local connection', 'international only'], answer: 'local knowledge, land, and community', explanation: 'Place-based learning connects to local context.' },
  { id: 'nwt5', comp: 'nwt_prof', type: 'mc', difficulty: 2, q: 'Teaching in the North may require:', choices: ['no adaptation', 'cultural responsiveness and flexibility with resources', 'only urban methods', 'no community connection'], answer: 'cultural responsiveness and flexibility with resources', explanation: 'Northern teaching often involves unique community and resource contexts.' },
  { id: 'nwt6', comp: 'nwt_prof', type: 'mc', difficulty: 1, q: 'NWT teacher certification is overseen by:', choices: ['federal only', 'NWT Education, Culture and Employment', 'schools only', 'no body'], answer: 'NWT Education, Culture and Employment', explanation: 'Territory regulates teacher certification.' },
];

// ─── Yukon ───
export const YUKON_DOMAINS = [
  { id: 'yk_math', name: 'Mathematics', desc: 'Number, algebra, geometry', weight: 0.40, games: ['math-sprint'] },
  { id: 'yk_curr', name: 'Curriculum & Instruction', desc: 'Yukon curriculum, First Nations', weight: 0.35, games: [] },
  { id: 'yk_prof', name: 'Professional Practice', desc: 'Standards, northern and Indigenous context', weight: 0.25, games: [] },
];
export const YUKON_QUESTIONS = [
  { id: 'yk1', comp: 'yk_math', type: 'mc', difficulty: 1, q: 'Solve: 4y = 20', choices: ['y = 4', 'y = 5', 'y = 16', 'y = 24'], answer: 'y = 5', explanation: 'y = 20/4 = 5.' },
  { id: 'yk2', comp: 'yk_math', type: 'mc', difficulty: 2, q: 'What is 30% of 90?', choices: ['24', '27', '30', '33'], answer: '27', explanation: '0.30 × 90 = 27.' },
  { id: 'yk3', comp: 'yk_curr', type: 'mc', difficulty: 1, q: 'Yukon education incorporates:', choices: ['only southern curriculum', 'First Nations ways of knowing and Yukon context', 'no local content', 'international only'], answer: 'First Nations ways of knowing and Yukon context', explanation: 'Yukon curriculum reflects First Nations and territorial priorities.' },
  { id: 'yk4', comp: 'yk_curr', type: 'mc', difficulty: 2, q: 'Reconciliation in Yukon education may involve:', choices: ['ignoring Indigenous history', 'truth-telling, respect, and inclusion of First Nations perspectives', 'only southern content', 'no change'], answer: 'truth-telling, respect, and inclusion of First Nations perspectives', explanation: 'Reconciliation involves respectful inclusion and truth.' },
  { id: 'yk5', comp: 'yk_prof', type: 'mc', difficulty: 1, q: 'Teacher certification in Yukon is overseen by:', choices: ['federal only', 'Yukon government / Department of Education', 'schools only', 'no regulator'], answer: 'Yukon government / Department of Education', explanation: 'Territory regulates teacher certification.' },
  { id: 'yk6', comp: 'yk_prof', type: 'mc', difficulty: 2, q: 'Culturally responsive teaching in Yukon includes:', choices: ['ignoring local culture', 'valuing student identity and community knowledge', 'only textbook content', 'no adaptation'], answer: 'valuing student identity and community knowledge', explanation: 'Culturally responsive practice honours student and community context.' },
];

// ─── Nunavut ───
export const NUNAVUT_DOMAINS = [
  { id: 'nu_math', name: 'Numeracy & Math', desc: 'Number, operations, problem solving', weight: 0.40, games: ['math-sprint'] },
  { id: 'nu_curr', name: 'Curriculum & Inuit Qaujimajatuqangit', desc: 'Nunavut curriculum, IQ', weight: 0.35, games: [] },
  { id: 'nu_prof', name: 'Professional Practice', desc: 'Standards, Inuit and northern context', weight: 0.25, games: [] },
];
export const NUNAVUT_QUESTIONS = [
  { id: 'nu1', comp: 'nu_math', type: 'mc', difficulty: 1, q: 'What is 9 − 3 × 2?', choices: ['12', '6', '3', '15'], answer: '6', explanation: '3 × 2 = 6, 9 − 6 = 6 (order of operations).' },
  { id: 'nu2', comp: 'nu_math', type: 'mc', difficulty: 2, q: 'Mean of 2, 4, 6, 8, 10?', choices: ['5', '6', '7', '8'], answer: '6', explanation: '(2+4+6+8+10)/5 = 6.' },
  { id: 'nu3', comp: 'nu_curr', type: 'mc', difficulty: 1, q: 'Inuit Qaujimajatuqangit (IQ) in Nunavut education refers to:', choices: ['only southern knowledge', 'Inuit traditional knowledge and values', 'no cultural content', 'optional only'], answer: 'Inuit traditional knowledge and values', explanation: 'IQ is the foundation for culturally relevant education in Nunavut.' },
  { id: 'nu4', comp: 'nu_curr', type: 'mc', difficulty: 2, q: 'Nunavut curriculum aims to:', choices: ['ignore Inuit culture', 'centre Inuit identity, language, and worldviews', 'only use English', 'copy southern curriculum only'], answer: 'centre Inuit identity, language, and worldviews', explanation: 'Nunavut curriculum is grounded in Inuit Qaujimajatuqangit.' },
  { id: 'nu5', comp: 'nu_prof', type: 'mc', difficulty: 2, q: 'Teaching in Nunavut may involve:', choices: ['only English', 'Inuktitut/Inuinnaqtun and culturally responsive practice', 'no Indigenous content', 'only standardized curriculum'], answer: 'Inuktitut/Inuinnaqtun and culturally responsive practice', explanation: 'Language and culture are central to Nunavut education.' },
  { id: 'nu6', comp: 'nu_prof', type: 'mc', difficulty: 1, q: 'Nunavut teacher certification is regulated by:', choices: ['federal only', 'Nunavut Department of Education', 'schools only', 'no body'], answer: 'Nunavut Department of Education', explanation: 'Territory regulates teacher certification.' },
];

// ─── Test configs ───
export const CANADA_TEST_CONFIG = {
  ontario: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { on_math: 16, on_prof: 14, on_lit: 10 } },
  bc: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { bc_math: 16, bc_curr: 14, bc_prof: 10 } },
  alberta: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { ab_math: 16, ab_curr: 14, ab_prof: 10 } },
  quebec: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { qc_math: 16, qc_prog: 14, qc_prof: 10 } },
  saskatchewan: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { sk_math: 16, sk_curr: 14, sk_prof: 10 } },
  manitoba: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { mb_math: 16, mb_curr: 14, mb_prof: 10 } },
  nova_scotia: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { ns_math: 16, ns_curr: 14, ns_prof: 10 } },
  new_brunswick: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { nb_math: 16, nb_curr: 14, nb_prof: 10 } },
  newfoundland: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { nl_math: 16, nl_curr: 14, nl_prof: 10 } },
  pei: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { pe_math: 16, pe_curr: 14, pe_prof: 10 } },
  nwt: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { nwt_math: 16, nwt_curr: 14, nwt_prof: 10 } },
  yukon: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { yk_math: 16, yk_curr: 14, yk_prof: 10 } },
  nunavut: { totalQuestions: 40, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { nu_math: 16, nu_curr: 14, nu_prof: 10 } },
};

export function getCanadaQuestionsForExam(examId) {
  const map = {
    ontario: ONTARIO_QUESTIONS,
    bc: BC_QUESTIONS,
    alberta: ALBERTA_QUESTIONS,
    quebec: QUEBEC_QUESTIONS,
    saskatchewan: SASKATCHEWAN_QUESTIONS,
    manitoba: MANITOBA_QUESTIONS,
    nova_scotia: NOVA_SCOTIA_QUESTIONS,
    new_brunswick: NEW_BRUNSWICK_QUESTIONS,
    newfoundland: NEWFOUNDLAND_QUESTIONS,
    pei: PEI_QUESTIONS,
    nwt: NWT_QUESTIONS,
    yukon: YUKON_QUESTIONS,
    nunavut: NUNAVUT_QUESTIONS,
  };
  return map[examId] || ONTARIO_QUESTIONS;
}

export function getCanadaDomainsForExam(examId) {
  const map = {
    ontario: ONTARIO_DOMAINS,
    bc: BC_DOMAINS,
    alberta: ALBERTA_DOMAINS,
    quebec: QUEBEC_DOMAINS,
    saskatchewan: SASKATCHEWAN_DOMAINS,
    manitoba: MANITOBA_DOMAINS,
    nova_scotia: NOVA_SCOTIA_DOMAINS,
    new_brunswick: NEW_BRUNSWICK_DOMAINS,
    newfoundland: NEWFOUNDLAND_DOMAINS,
    pei: PEI_DOMAINS,
    nwt: NWT_DOMAINS,
    yukon: YUKON_DOMAINS,
    nunavut: NUNAVUT_DOMAINS,
  };
  return map[examId] || ONTARIO_DOMAINS;
}
