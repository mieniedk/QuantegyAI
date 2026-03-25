/**
 * Accounting certification exams — CPA (AUD, FAR, REG, BEC), CMA (Part 1 & 2), CIA (Part 1–3).
 * Same structure as other prep data for TestPrepPage.
 */

// ─── CPA: Audit & Attestation (AUD) ───
export const CPA_AUD_DOMAINS = [
  { id: 'aud_ethics', name: 'Ethics & Professional Responsibilities', desc: 'Independence, integrity, AICPA', weight: 0.25, games: [] },
  { id: 'aud_risk', name: 'Assessing Risk & Planning', desc: 'Risk assessment, materiality, planning', weight: 0.30, games: [] },
  { id: 'aud_evidence', name: 'Evidence & Procedures', desc: 'Audit evidence, sampling, testing', weight: 0.30, games: [] },
  { id: 'aud_report', name: 'Reporting & Communication', desc: 'Report types, opinions, communications', weight: 0.15, games: [] },
];

export const CPA_AUD_QUESTIONS = [
  { id: 'aud1', comp: 'aud_ethics', type: 'mc', difficulty: 1, q: 'Independence in appearance requires that a reasonable observer would conclude the auditor is free from:', choices: ['all relationships', 'bias and conflicts of interest', 'client contact', 'documentation'], answer: 'bias and conflicts of interest', explanation: 'Independence in appearance means no perceived bias.' },
  { id: 'aud2', comp: 'aud_risk', type: 'mc', difficulty: 1, q: 'Inherent risk is:', choices: ['risk after controls', 'susceptibility to material misstatement before considering controls', 'detection risk only', 'audit risk only'], answer: 'susceptibility to material misstatement before considering controls', explanation: 'Inherent risk exists absent internal controls.' },
  { id: 'aud3', comp: 'aud_risk', type: 'mc', difficulty: 2, q: 'Materiality is set to:', choices: ['any amount', 'help plan the audit and evaluate misstatements', 'eliminate all risk', 'satisfy management'], answer: 'help plan the audit and evaluate misstatements', explanation: 'Materiality guides scope and evaluation of findings.' },
  { id: 'aud4', comp: 'aud_evidence', type: 'mc', difficulty: 1, q: 'Which is generally the most reliable audit evidence?', choices: ['oral representation from management', 'external document received directly by auditor', 'internal memo', 'copy of a bank statement'], answer: 'external document received directly by auditor', explanation: 'External evidence from independent sources is more reliable.' },
  { id: 'aud5', comp: 'aud_report', type: 'mc', difficulty: 2, q: 'An unqualified (unmodified) opinion states that the financial statements:', choices: ['are free from all misstatements', 'present fairly in all material respects', 'are perfect', 'need no disclosure'], answer: 'present fairly in all material respects', explanation: 'Unqualified opinion = fair presentation in all material respects.' },
  { id: 'aud6', comp: 'aud_evidence', type: 'mc', difficulty: 2, q: 'Substantive procedures are designed to:', choices: ['test controls only', 'detect material misstatements at the assertion level', 'replace risk assessment', 'eliminate sampling risk'], answer: 'detect material misstatements at the assertion level', explanation: 'Substantive procedures address detection risk and assertions.' },
];

// ─── CPA: Financial Accounting & Reporting (FAR) ───
export const CPA_FAR_DOMAINS = [
  { id: 'far_concepts', name: 'Conceptual Framework & Standards', desc: 'GAAP, framework, reporting', weight: 0.25, games: [] },
  { id: 'far_financials', name: 'Financial Statements', desc: 'Balance sheet, income, cash flows', weight: 0.35, games: [] },
  { id: 'far_topics', name: 'Specific Topics', desc: 'Leases, revenue, inventory, PPE', weight: 0.40, games: [] },
];

export const CPA_FAR_QUESTIONS = [
  { id: 'far1', comp: 'far_concepts', type: 'mc', difficulty: 1, q: 'Accrual accounting recognizes revenue when:', choices: ['cash is received', 'earned and realized or realizable', 'contract is signed', 'invoice is sent'], answer: 'earned and realized or realizable', explanation: 'Revenue recognition: earned and realized/realizable.' },
  { id: 'far2', comp: 'far_financials', type: 'mc', difficulty: 1, q: 'Operating activities in the statement of cash flows include:', choices: ['issuing stock', 'paying dividends', 'collections from customers', 'buying equipment'], answer: 'collections from customers', explanation: 'Operating = day-to-day revenue and expense flows.' },
  { id: 'far3', comp: 'far_financials', type: 'mc', difficulty: 2, q: 'Retained earnings is increased by:', choices: ['dividends declared', 'net income', 'treasury stock purchases', 'prior period adjustments only'], answer: 'net income', explanation: 'Retained earnings = prior RE + net income − dividends.' },
  { id: 'far4', comp: 'far_topics', type: 'mc', difficulty: 1, q: 'A lease that transfers substantially all risks and rewards of the asset is classified as:', choices: ['operating only', 'finance (formerly capital) lease', 'short-term only', 'off-balance-sheet'], answer: 'finance (formerly capital) lease', explanation: 'Finance lease = lessee recognizes asset and liability.' },
  { id: 'far5', comp: 'far_topics', type: 'mc', difficulty: 2, q: 'FIFO vs. LIFO: in rising prices, FIFO typically yields:', choices: ['lower COGS and higher ending inventory', 'higher COGS', 'same as LIFO', 'lower inventory'], answer: 'lower COGS and higher ending inventory', explanation: 'FIFO uses older (lower) costs for COGS; inventory is newer (higher).' },
  { id: 'far6', comp: 'far_concepts', type: 'mc', difficulty: 2, q: 'Going concern assumption means:', choices: ['the entity will liquidate soon', 'the entity will continue operating for the foreseeable future', 'no disclosure needed', 'only cash basis'], answer: 'the entity will continue operating for the foreseeable future', explanation: 'Going concern underlies preparation of financial statements.' },
];

// ─── CPA: Regulation (REG) ───
export const CPA_REG_DOMAINS = [
  { id: 'reg_ethics', name: 'Ethics & Federal Tax Procedures', desc: 'Circular 230, preparer responsibilities', weight: 0.20, games: [] },
  { id: 'reg_business', name: 'Business Law', desc: 'Contracts, agency, entities', weight: 0.25, games: [] },
  { id: 'reg_fed_tax', name: 'Federal Taxation', desc: 'Individual, entity, property transactions', weight: 0.55, games: [] },
];

export const CPA_REG_QUESTIONS = [
  { id: 'reg1', comp: 'reg_ethics', type: 'mc', difficulty: 1, q: 'Circular 230 governs:', choices: ['state CPA licensing', 'practice before the IRS', 'SEC only', 'audit only'], answer: 'practice before the IRS', explanation: 'Circular 230 sets rules for tax practitioners before IRS.' },
  { id: 'reg2', comp: 'reg_business', type: 'mc', difficulty: 1, q: 'A valid contract requires, among other things:', choices: ['only an offer', 'offer, acceptance, consideration', 'only consideration', 'only acceptance'], answer: 'offer, acceptance, consideration', explanation: 'Contract = offer + acceptance + consideration (+ capacity, legality).' },
  { id: 'reg3', comp: 'reg_fed_tax', type: 'mc', difficulty: 1, q: 'For a C corporation, income tax is paid at:', choices: ['shareholder level only', 'corporate level (entity pays tax)', 'both levels only on dividends', 'neither level'], answer: 'corporate level (entity pays tax)', explanation: 'C corps pay entity-level income tax; dividends may be taxed again to shareholders.' },
  { id: 'reg4', comp: 'reg_fed_tax', type: 'mc', difficulty: 2, q: 'S corporation income is generally taxed:', choices: ['only at the corporate level', 'at the shareholder level (pass-through)', 'twice like C corp', 'only on distribution'], answer: 'at the shareholder level (pass-through)', explanation: 'S corps are pass-through entities; income flows to shareholders.' },
  { id: 'reg5', comp: 'reg_business', type: 'mc', difficulty: 2, q: 'In a general partnership, partners are typically:', choices: ['not liable for partnership debts', 'jointly and severally liable', 'liable only to each other', 'protected by the entity'], answer: 'jointly and severally liable', explanation: 'General partners have joint and several liability for partnership obligations.' },
  { id: 'reg6', comp: 'reg_fed_tax', type: 'mc', difficulty: 2, q: 'Capital gains on assets held more than one year are generally:', choices: ['taxed as ordinary income only', 'taxed at preferential (lower) rates', 'not taxable', 'taxed at double the ordinary rate'], answer: 'taxed at preferential (lower) rates', explanation: 'Long-term capital gains receive preferential tax rates.' },
];

// ─── CPA: Business Environment & Concepts (BEC) ───
export const CPA_BEC_DOMAINS = [
  { id: 'bec_corp', name: 'Corporate Governance & Economics', desc: 'Governance, econ, strategy', weight: 0.25, games: [] },
  { id: 'bec_finance', name: 'Financial Management', desc: 'Capital structure, working capital', weight: 0.25, games: [] },
  { id: 'bec_it', name: 'Operations & Information Technology', desc: 'IT, ops, internal control', weight: 0.25, games: [] },
  { id: 'bec_costing', name: 'Cost Accounting & Performance', desc: 'Costing, variance, budgeting', weight: 0.25, games: [] },
];

export const CPA_BEC_QUESTIONS = [
  { id: 'bec1', comp: 'bec_corp', type: 'mc', difficulty: 1, q: 'Corporate governance typically involves:', choices: ['only management', 'board oversight, accountability, and transparency', 'only shareholders', 'no internal control'], answer: 'board oversight, accountability, and transparency', explanation: 'Governance = structures for oversight and accountability.' },
  { id: 'bec2', comp: 'bec_finance', type: 'mc', difficulty: 1, q: 'Working capital is defined as:', choices: ['total assets', 'current assets minus current liabilities', 'fixed assets only', 'long-term debt'], answer: 'current assets minus current liabilities', explanation: 'Working capital = current assets − current liabilities.' },
  { id: 'bec3', comp: 'bec_finance', type: 'mc', difficulty: 2, q: 'Cost of capital is used to:', choices: ['only value bonds', 'evaluate investments and financing decisions', 'ignore risk', 'only for external reporting'], answer: 'evaluate investments and financing decisions', explanation: 'Cost of capital is the hurdle rate for investment and financing.' },
  { id: 'bec4', comp: 'bec_it', type: 'mc', difficulty: 1, q: 'Segregation of duties in internal control aims to:', choices: ['reduce all risk', 'prevent one person from controlling and concealing errors or fraud', 'eliminate IT', 'only separate departments'], answer: 'prevent one person from controlling and concealing errors or fraud', explanation: 'SoD reduces risk of fraud and error by separating incompatible duties.' },
  { id: 'bec5', comp: 'bec_costing', type: 'mc', difficulty: 1, q: 'Variable costs per unit:', choices: ['increase as volume increases', 'stay constant per unit as volume changes', 'decrease only', 'are always zero'], answer: 'stay constant per unit as volume changes', explanation: 'Variable cost per unit is constant; total varies with volume.' },
  { id: 'bec6', comp: 'bec_costing', type: 'mc', difficulty: 2, q: 'A favorable variance in standard costing means:', choices: ['actual cost exceeded standard', 'actual cost was less than standard (or revenue higher)', 'no analysis possible', 'budget was wrong'], answer: 'actual cost was less than standard (or revenue higher)', explanation: 'Favorable = better than standard (lower cost or higher revenue).' },
];

// ─── CMA Part 1: Financial Planning, Performance, and Analytics ───
export const CMA_P1_DOMAINS = [
  { id: 'cma1_planning', name: 'External Financial Reporting & Planning', desc: 'Reporting, planning, budgeting', weight: 0.35, games: [] },
  { id: 'cma1_performance', name: 'Performance Management', desc: 'Variance, analysis, metrics', weight: 0.35, games: [] },
  { id: 'cma1_cost', name: 'Cost Management', desc: 'Costing, allocation, decisions', weight: 0.30, games: [] },
];

export const CMA_P1_QUESTIONS = [
  { id: 'cma1a', comp: 'cma1_planning', type: 'mc', difficulty: 1, q: 'A master budget typically includes:', choices: ['only cash', 'operating budget and financial budget', 'only income statement', 'no capital budget'], answer: 'operating budget and financial budget', explanation: 'Master budget = operating + financial (cash, balance sheet, etc.).' },
  { id: 'cma1b', comp: 'cma1_performance', type: 'mc', difficulty: 1, q: 'Flexible budget adjusts for:', choices: ['only fixed costs', 'actual level of activity (volume)', 'prior year only', 'no changes'], answer: 'actual level of activity (volume)', explanation: 'Flexible budget uses actual volume to compare with actual results.' },
  { id: 'cma1c', comp: 'cma1_performance', type: 'mc', difficulty: 2, q: 'Unfavorable direct labor efficiency variance may indicate:', choices: ['lower wages', 'higher productivity than planned', 'higher labor hours than standard for output', 'no variance'], answer: 'higher labor hours than standard for output', explanation: 'Efficiency variance = (actual hrs − standard hrs) × standard rate.' },
  { id: 'cma1d', comp: 'cma1_cost', type: 'mc', difficulty: 1, q: 'Activity-based costing (ABC) allocates overhead using:', choices: ['only direct labor hours', 'multiple cost drivers/activities', 'only machine hours', 'no allocation'], answer: 'multiple cost drivers/activities', explanation: 'ABC uses activities as cost drivers for more accurate allocation.' },
  { id: 'cma1e', comp: 'cma1_cost', type: 'mc', difficulty: 2, q: 'Relevant costs for a decision are:', choices: ['sunk costs', 'future costs that differ between alternatives', 'all historical costs', 'only fixed costs'], answer: 'future costs that differ between alternatives', explanation: 'Relevant = future and different under the alternatives.' },
];

// ─── CMA Part 2: Strategic Financial Management ───
export const CMA_P2_DOMAINS = [
  { id: 'cma2_analysis', name: 'Financial Statement Analysis', desc: 'Ratios, analysis, reporting', weight: 0.25, games: [] },
  { id: 'cma2_finance', name: 'Corporate Finance', desc: 'Capital budgeting, risk, working capital', weight: 0.35, games: [] },
  { id: 'cma2_decision', name: 'Decision Analysis & Risk', desc: 'Decisions, risk, ethics', weight: 0.25, games: [] },
  { id: 'cma2_invest', name: 'Investment Decisions', desc: 'NPV, IRR, capital structure', weight: 0.15, games: [] },
];

export const CMA_P2_QUESTIONS = [
  { id: 'cma2a', comp: 'cma2_analysis', type: 'mc', difficulty: 1, q: 'Current ratio is computed as:', choices: ['current assets / current liabilities', 'total assets / total liabilities', 'quick assets only', 'inventory / current liabilities'], answer: 'current assets / current liabilities', explanation: 'Current ratio = current assets ÷ current liabilities.' },
  { id: 'cma2b', comp: 'cma2_finance', type: 'mc', difficulty: 1, q: 'NPV (net present value) of a project is the:', choices: ['sum of undiscounted cash flows', 'present value of cash inflows minus present value of outflows', 'payback only', 'accounting profit'], answer: 'present value of cash inflows minus present value of outflows', explanation: 'NPV = PV(inflows) − PV(outflows).' },
  { id: 'cma2c', comp: 'cma2_finance', type: 'mc', difficulty: 2, q: 'IRR is the discount rate at which:', choices: ['NPV is negative', 'NPV equals zero', 'payback equals zero', 'profit is max'], answer: 'NPV equals zero', explanation: 'IRR is the rate that makes NPV = 0.' },
  { id: 'cma2d', comp: 'cma2_decision', type: 'mc', difficulty: 1, q: 'Ethical decision-making in management accounting includes:', choices: ['ignoring standards', 'integrity, objectivity, confidentiality', 'only profit', 'no disclosure'], answer: 'integrity, objectivity, confidentiality', explanation: 'IMA standards emphasize integrity, objectivity, and confidentiality.' },
  { id: 'cma2e', comp: 'cma2_invest', type: 'mc', difficulty: 2, q: 'WACC (weighted average cost of capital) is used as:', choices: ['only for debt', 'discount rate for projects with similar risk to the firm', 'only for equity', 'ignoring risk'], answer: 'discount rate for projects with similar risk to the firm', explanation: 'WACC is the hurdle rate for average-risk projects.' },
];

// ─── CIA Part 1: Essentials of Internal Auditing ───
export const CIA_P1_DOMAINS = [
  { id: 'cia1_foundations', name: 'Foundations of Internal Auditing', desc: 'Standards, mandate, role', weight: 0.25, games: [] },
  { id: 'cia1_conduct', name: 'Conducting the Engagement', desc: 'Planning, fieldwork, reporting', weight: 0.45, games: [] },
  { id: 'cia1_governance', name: 'Governance & Risk', desc: 'Governance, risk, control', weight: 0.30, games: [] },
];

export const CIA_P1_QUESTIONS = [
  { id: 'cia1a', comp: 'cia1_foundations', type: 'mc', difficulty: 1, q: 'The IIA Standards require internal audit to be:', choices: ['subordinate to operations', 'independent and objective', 'only advisory', 'avoiding risk'], answer: 'independent and objective', explanation: 'Independence and objectivity are core to internal audit.' },
  { id: 'cia1b', comp: 'cia1_conduct', type: 'mc', difficulty: 1, q: 'Audit fieldwork typically includes:', choices: ['only planning', 'gathering evidence and testing', 'only reporting', 'no documentation'], answer: 'gathering evidence and testing', explanation: 'Fieldwork = evidence gathering and testing.' },
  { id: 'cia1c', comp: 'cia1_conduct', type: 'mc', difficulty: 2, q: 'Working papers support:', choices: ['only the report', 'the audit conclusions and compliance with standards', 'only management', 'no review'], answer: 'the audit conclusions and compliance with standards', explanation: 'Working papers document evidence and support conclusions.' },
  { id: 'cia1d', comp: 'cia1_governance', type: 'mc', difficulty: 1, q: 'Internal control is designed to provide reasonable assurance regarding:', choices: ['only financial reporting', 'achievement of objectives (operations, reporting, compliance)', 'only compliance', 'no risk'], answer: 'achievement of objectives (operations, reporting, compliance)', explanation: 'Internal control supports operations, reporting, and compliance objectives.' },
  { id: 'cia1e', comp: 'cia1_governance', type: 'mc', difficulty: 2, q: 'Risk-based audit planning prioritizes:', choices: ['only low-risk areas', 'areas of higher risk and significance', 'random selection', 'management preference only'], answer: 'areas of higher risk and significance', explanation: 'Risk-based planning focuses audit effort where risk is higher.' },
];

// ─── CIA Part 2: Practice of Internal Auditing ───
export const CIA_P2_DOMAINS = [
  { id: 'cia2_managing', name: 'Managing the Internal Audit Activity', desc: 'Planning, resourcing, quality', weight: 0.20, games: [] },
  { id: 'cia2_engagement', name: 'Engagement Planning & Execution', desc: 'Planning, sampling, data analytics', weight: 0.45, games: [] },
  { id: 'cia2_communicating', name: 'Communicating Results', desc: 'Reporting, follow-up', weight: 0.20, games: [] },
  { id: 'cia2_fraud', name: 'Fraud & Governance', desc: 'Fraud awareness, governance', weight: 0.15, games: [] },
];

export const CIA_P2_QUESTIONS = [
  { id: 'cia2a', comp: 'cia2_managing', type: 'mc', difficulty: 1, q: 'Quality assurance for internal audit may include:', choices: ['only external audit', 'internal assessments and external assessments', 'no review', 'only management review'], answer: 'internal assessments and external assessments', explanation: 'QA includes internal and external assessments of the audit function.' },
  { id: 'cia2b', comp: 'cia2_engagement', type: 'mc', difficulty: 1, q: 'Statistical sampling allows the auditor to:', choices: ['eliminate risk', 'draw conclusions about a population from a sample', 'audit only one item', 'ignore materiality'], answer: 'draw conclusions about a population from a sample', explanation: 'Sampling permits inference about the population from the sample.' },
  { id: 'cia2c', comp: 'cia2_communicating', type: 'mc', difficulty: 2, q: 'Audit reports should be:', choices: ['only oral', 'clear, accurate, objective, and timely', 'withheld from management', 'only positive findings'], answer: 'clear, accurate, objective, and timely', explanation: 'IIA standards emphasize clear, accurate, objective, timely communication.' },
  { id: 'cia2d', comp: 'cia2_fraud', type: 'mc', difficulty: 1, q: 'Internal auditors are responsible for:', choices: ['preventing all fraud', 'evaluating controls and assessing fraud risk', 'investigating only', 'ignoring fraud'], answer: 'evaluating controls and assessing fraud risk', explanation: 'IA evaluates controls and fraud risk; management owns prevention.' },
  { id: 'cia2e', comp: 'cia2_engagement', type: 'mc', difficulty: 2, q: 'Data analytics in internal audit can help:', choices: ['only replace sampling', 'identify anomalies and test full populations', 'ignore controls', 'only external audit'], answer: 'identify anomalies and test full populations', explanation: 'Analytics can test full populations and flag exceptions.' },
];

// ─── CIA Part 3: Business Knowledge for Internal Auditing ───
export const CIA_P3_DOMAINS = [
  { id: 'cia3_business', name: 'Business Acumen', desc: 'Strategy, operations, finance', weight: 0.35, games: [] },
  { id: 'cia3_info', name: 'Information Security & Technology', desc: 'IT controls, security', weight: 0.35, games: [] },
  { id: 'cia3_financial', name: 'Financial Management', desc: 'Financial reporting, analysis', weight: 0.30, games: [] },
];

export const CIA_P3_QUESTIONS = [
  { id: 'cia3a', comp: 'cia3_business', type: 'mc', difficulty: 1, q: 'SWOT analysis assesses:', choices: ['only finance', 'strengths, weaknesses, opportunities, threats', 'only internal', 'only external'], answer: 'strengths, weaknesses, opportunities, threats', explanation: 'SWOT = internal (S,W) and external (O,T) factors.' },
  { id: 'cia3b', comp: 'cia3_info', type: 'mc', difficulty: 1, q: 'General IT controls typically include:', choices: ['only application code', 'access security, change management, operations', 'only backups', 'no controls'], answer: 'access security, change management, operations', explanation: 'GITCs cover access, change management, and operations.' },
  { id: 'cia3c', comp: 'cia3_financial', type: 'mc', difficulty: 2, q: 'When auditing financial reporting, internal audit may focus on:', choices: ['only external audit work', 'controls over financial reporting and key assertions', 'only tax', 'no controls'], answer: 'controls over financial reporting and key assertions', explanation: 'IA evaluates design and operating effectiveness of relevant controls.' },
];

// ─── Test configs ───
export const ACCOUNTING_TEST_CONFIG = {
  cpa_aud: { totalQuestions: 72, timeMinutes: 240, passingScore: 0.75, categoryDistribution: { aud_ethics: 18, aud_risk: 22, aud_evidence: 22, aud_report: 10 } },
  cpa_far: { totalQuestions: 66, timeMinutes: 240, passingScore: 0.75, categoryDistribution: { far_concepts: 16, far_financials: 23, far_topics: 27 } },
  cpa_reg: { totalQuestions: 76, timeMinutes: 240, passingScore: 0.75, categoryDistribution: { reg_ethics: 15, reg_business: 19, reg_fed_tax: 42 } },
  cpa_bec: { totalQuestions: 62, timeMinutes: 240, passingScore: 0.75, categoryDistribution: { bec_corp: 16, bec_finance: 16, bec_it: 16, bec_costing: 14 } },
  cma_p1: { totalQuestions: 100, timeMinutes: 240, passingScore: 0.72, categoryDistribution: { cma1_planning: 35, cma1_performance: 35, cma1_cost: 30 } },
  cma_p2: { totalQuestions: 100, timeMinutes: 240, passingScore: 0.72, categoryDistribution: { cma2_analysis: 25, cma2_finance: 35, cma2_decision: 25, cma2_invest: 15 } },
  cia_p1: { totalQuestions: 125, timeMinutes: 150, passingScore: 0.70, categoryDistribution: { cia1_foundations: 31, cia1_conduct: 56, cia1_governance: 38 } },
  cia_p2: { totalQuestions: 100, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cia2_managing: 20, cia2_engagement: 45, cia2_communicating: 20, cia2_fraud: 15 } },
  cia_p3: { totalQuestions: 100, timeMinutes: 120, passingScore: 0.70, categoryDistribution: { cia3_business: 35, cia3_info: 35, cia3_financial: 30 } },
};

export function getAccountingQuestionsForExam(examId) {
  const map = {
    cpa_aud: CPA_AUD_QUESTIONS,
    cpa_far: CPA_FAR_QUESTIONS,
    cpa_reg: CPA_REG_QUESTIONS,
    cpa_bec: CPA_BEC_QUESTIONS,
    cma_p1: CMA_P1_QUESTIONS,
    cma_p2: CMA_P2_QUESTIONS,
    cia_p1: CIA_P1_QUESTIONS,
    cia_p2: CIA_P2_QUESTIONS,
    cia_p3: CIA_P3_QUESTIONS,
  };
  return map[examId] || CPA_AUD_QUESTIONS;
}

export function getAccountingDomainsForExam(examId) {
  const map = {
    cpa_aud: CPA_AUD_DOMAINS,
    cpa_far: CPA_FAR_DOMAINS,
    cpa_reg: CPA_REG_DOMAINS,
    cpa_bec: CPA_BEC_DOMAINS,
    cma_p1: CMA_P1_DOMAINS,
    cma_p2: CMA_P2_DOMAINS,
    cia_p1: CIA_P1_DOMAINS,
    cia_p2: CIA_P2_DOMAINS,
    cia_p3: CIA_P3_DOMAINS,
  };
  return map[examId] || CPA_AUD_DOMAINS;
}
