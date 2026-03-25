/**
 * Actuarial exams — SOA (P, FM, IFM, SRM, STAM, LTAM) and CAS (MAS-I, MAS-II, 5–9).
 * Same structure as other prep data for TestPrepPage.
 */

// ─── SOA Exam P: Probability ───
export const SOA_P_DOMAINS = [
  { id: 'p_gen', name: 'General Probability', desc: 'Sets, combinatorics, Bayes', weight: 0.35, games: ['math-sprint', 'math-jeopardy'] },
  { id: 'p_uni', name: 'Univariate Random Variables', desc: 'Distributions, expectation, variance', weight: 0.35, games: ['math-sprint', 'graph-explorer'] },
  { id: 'p_multi', name: 'Multivariate Random Variables', desc: 'Joint distributions, conditioning', weight: 0.30, games: ['math-sprint'] },
];

export const SOA_P_QUESTIONS = [
  { id: 'p1', comp: 'p_gen', type: 'mc', difficulty: 1, q: 'P(A ∪ B) = P(A) + P(B) when A and B are:', choices: ['independent', 'mutually exclusive', 'equal', 'complements'], answer: 'mutually exclusive', explanation: 'Addition rule: no overlap so probabilities add.' },
  { id: 'p2', comp: 'p_gen', type: 'mc', difficulty: 2, q: 'Bayes formula is used to compute:', choices: ['P(A)', 'P(A|B) from P(B|A), P(A), P(B)', 'P(A and B)', 'expectation'], answer: 'P(A|B) from P(B|A), P(A), P(B)', explanation: 'Bayes: posterior from prior and likelihood.' },
  { id: 'p3', comp: 'p_uni', type: 'mc', difficulty: 1, q: 'For a discrete r.v. X, E[X] is:', choices: ['sum of x·P(X=x)', 'P(X>0)', 'variance squared', 'median'], answer: 'sum of x·P(X=x)', explanation: 'Definition of expectation for discrete.' },
  { id: 'p4', comp: 'p_uni', type: 'mc', difficulty: 2, q: 'Var(X) = E[X²] − (E[X])² is equivalent to:', choices: ['E[(X−μ)²]', 'E[X²] only', 'E[X]²', 'E[X−μ]'], answer: 'E[(X−μ)²]', explanation: 'Variance = second moment minus squared mean.' },
  { id: 'p5', comp: 'p_multi', type: 'mc', difficulty: 1, q: 'X and Y independent implies:', choices: ['E[XY]=E[X]E[Y]', 'E[XY]=E[X]+E[Y]', 'Var(X+Y)=Var(X)', 'Cov(X,Y)=1'], answer: 'E[XY]=E[X]E[Y]', explanation: 'Independence implies expectation of product = product of expectations.' },
  { id: 'p6', comp: 'p_multi', type: 'mc', difficulty: 2, q: 'Joint pdf f(x,y) integrates to:', choices: ['0', '1', 'E[X]', 'Cov(X,Y)'], answer: '1', explanation: 'Valid pdf integrates to 1 over support.' },
];

// ─── SOA Exam FM: Financial Mathematics ───
export const SOA_FM_DOMAINS = [
  { id: 'fm_tvm', name: 'Time Value of Money', desc: 'Interest rates, discounting', weight: 0.25, games: ['math-sprint'] },
  { id: 'fm_ann', name: 'Annuities', desc: 'Ordinary, due, perpetuities', weight: 0.30, games: ['math-sprint'] },
  { id: 'fm_loans', name: 'Loans & Bonds', desc: 'Amortization, bond pricing', weight: 0.30, games: [] },
  { id: 'fm_cash', name: 'Cash Flows & Immunization', desc: 'Duration, convexity, applications', weight: 0.15, games: [] },
];

export const SOA_FM_QUESTIONS = [
  { id: 'fm1', comp: 'fm_tvm', type: 'mc', difficulty: 1, q: 'At 5% annual effective rate, $100 grows to what in 1 year?', choices: ['$95', '$100', '$105', '$110'], answer: '$105', explanation: '100(1.05) = 105.' },
  { id: 'fm2', comp: 'fm_tvm', type: 'mc', difficulty: 2, q: 'Present value of $1000 due in 2 years at 10% effective annual?', choices: ['826.45', '900', '1100', '1210'], answer: '826.45', explanation: '1000 / (1.10)² ≈ 826.45.' },
  { id: 'fm3', comp: 'fm_ann', type: 'mc', difficulty: 1, q: 'Ordinary annuity: payments at:', choices: ['beginning of period', 'end of period', 'mid-period', 'continuous'], answer: 'end of period', explanation: 'Ordinary annuity: payment at end of each period.' },
  { id: 'fm4', comp: 'fm_ann', type: 'mc', difficulty: 2, q: 'Perpetuity-immediate present value with payment 1 and rate i:', choices: ['1/i', 'i', '1/(1+i)', '(1+i)/i'], answer: '1/i', explanation: 'PV = 1/i for perpetuity-immediate.' },
  { id: 'fm5', comp: 'fm_loans', type: 'mc', difficulty: 1, q: 'Bond price is the PV of:', choices: ['coupons only', 'redemption only', 'coupons and redemption', 'dividends'], answer: 'coupons and redemption', explanation: 'Bond = PV of coupon stream + redemption.' },
  { id: 'fm6', comp: 'fm_loans', type: 'mc', difficulty: 2, q: 'When yield > coupon rate, bond price is:', choices: ['above par', 'below par', 'at par', 'zero'], answer: 'below par', explanation: 'Discount bond when yield exceeds coupon.' },
  { id: 'fm7', comp: 'fm_cash', type: 'mc', difficulty: 2, q: 'Macaulay duration measures:', choices: ['coupon size', 'weighted average time to cash flows', 'yield only', 'convexity'], answer: 'weighted average time to cash flows', explanation: 'Duration = weighted avg time, weights = PV of CF.' },
];

// ─── SOA IFM, SRM, STAM, LTAM (compact) ───
export const SOA_IFM_DOMAINS = [
  { id: 'ifm_deriv', name: 'Derivatives & Options', desc: 'Put-call, binomial, Black-Scholes', weight: 0.40, games: [] },
  { id: 'ifm_asset', name: 'Asset Pricing', desc: 'CAPM, portfolio theory', weight: 0.35, games: [] },
  { id: 'ifm_corp', name: 'Corporate Finance', desc: 'Capital structure, options in corp finance', weight: 0.25, games: [] },
];

export const SOA_IFM_QUESTIONS = [
  { id: 'ifm1', comp: 'ifm_deriv', type: 'mc', difficulty: 1, q: 'Put-call parity relates:', choices: ['put price, call price, stock, strike, risk-free', 'only puts', 'only calls', 'dividends only'], answer: 'put price, call price, stock, strike, risk-free', explanation: 'C − P = S − K e^{-rT} (no dividends).' },
  { id: 'ifm2', comp: 'ifm_asset', type: 'mc', difficulty: 2, q: 'CAPM states expected return equals:', choices: ['risk-free rate only', 'r_f + β(E[R_m]−r_f)', 'variance only', 'dividend yield'], answer: 'r_f + β(E[R_m]−r_f)', explanation: 'Security market line.' },
  { id: 'ifm3', comp: 'ifm_corp', type: 'mc', difficulty: 1, q: 'Equity can be viewed as a call option on:', choices: ['bond', 'assets of the firm', 'dividends', 'debt only'], answer: 'assets of the firm', explanation: 'Merton model: equity = call on assets.' },
];

export const SOA_SRM_DOMAINS = [
  { id: 'srm_lin', name: 'Linear Regression', desc: 'OLS, inference, multiple regression', weight: 0.35, games: [] },
  { id: 'srm_time', name: 'Time Series', desc: 'ARIMA, stationarity', weight: 0.35, games: [] },
  { id: 'srm_other', name: 'Other Risk Models', desc: 'GLM, decision trees, model selection', weight: 0.30, games: [] },
];

export const SOA_SRM_QUESTIONS = [
  { id: 'srm1', comp: 'srm_lin', type: 'mc', difficulty: 1, q: 'OLS minimizes:', choices: ['sum of residuals', 'sum of squared residuals', 'R²', 'correlation'], answer: 'sum of squared residuals', explanation: 'Least squares criterion.' },
  { id: 'srm2', comp: 'srm_time', type: 'mc', difficulty: 2, q: 'A stationary time series has:', choices: ['trend only', 'constant mean and variance over time', 'seasonality only', 'no variance'], answer: 'constant mean and variance over time', explanation: 'Stationarity: mean and variance do not depend on time.' },
  { id: 'srm3', comp: 'srm_other', type: 'mc', difficulty: 1, q: 'Overfitting occurs when a model:', choices: ['fits training data too well, poor generalization', 'has few parameters', 'is linear only', 'has no intercept'], answer: 'fits training data too well, poor generalization', explanation: 'Overfitting = low train error, high test error.' },
];

export const SOA_STAM_DOMAINS = [
  { id: 'stam_freq', name: 'Severity & Frequency', desc: 'Loss distributions, frequency models', weight: 0.35, games: [] },
  { id: 'stam_agg', name: 'Aggregate Loss', desc: 'Compound distributions, aggregate models', weight: 0.35, games: [] },
  { id: 'stam_cred', name: 'Credibility', desc: 'Limited fluctuation, Bühlmann', weight: 0.30, games: [] },
];

export const SOA_STAM_QUESTIONS = [
  { id: 'stam1', comp: 'stam_freq', type: 'mc', difficulty: 1, q: 'Poisson distribution is often used for:', choices: ['claim frequency', 'claim severity only', 'interest rate', 'mortality'], answer: 'claim frequency', explanation: 'Count of events in a period.' },
  { id: 'stam2', comp: 'stam_agg', type: 'mc', difficulty: 2, q: 'Aggregate loss S = X₁+...+X_N where N is frequency. E[S] =', choices: ['E[N]', 'E[N]·E[X]', 'E[X] only', 'Var(N)'], answer: 'E[N]·E[X]', explanation: 'Compound: E[S] = E[N]E[X] when N independent of X.' },
  { id: 'stam3', comp: 'stam_cred', type: 'mc', difficulty: 1, q: 'Credibility theory blends:', choices: ['prior and sample mean', 'only prior', 'only sample', 'two samples only'], answer: 'prior and sample mean', explanation: 'Credibility estimate = Z·sample + (1−Z)·prior.' },
];

export const SOA_LTAM_DOMAINS = [
  { id: 'ltam_surv', name: 'Survival Models', desc: 'Life tables, force of mortality', weight: 0.35, games: [] },
  { id: 'ltam_ins', name: 'Life Insurance & Annuities', desc: 'Insurance benefits, annuities', weight: 0.35, games: [] },
  { id: 'ltam_pension', name: 'Pension & Multi-State', desc: 'Multiple state models, pension plans', weight: 0.30, games: [] },
];

export const SOA_LTAM_QUESTIONS = [
  { id: 'ltam1', comp: 'ltam_surv', type: 'mc', difficulty: 1, q: 'Force of mortality μ(x) represents:', choices: ['probability of death at x', 'instantaneous rate of death at x', 'survival only', 'curtate expectation'], answer: 'instantaneous rate of death at x', explanation: 'μ(x) = −(d/dx)ln S(x).' },
  { id: 'ltam2', comp: 'ltam_ins', type: 'mc', difficulty: 2, q: 'Whole life insurance pays at:', choices: ['end of year of death', 'moment of death (continuous) or EOY', 'only at issue', 'never'], answer: 'moment of death (continuous) or EOY', explanation: 'Benefit paid upon death; model can be continuous or discrete.' },
  { id: 'ltam3', comp: 'ltam_pension', type: 'mc', difficulty: 1, q: 'Multiple state models use:', choices: ['transition forces between states', 'single state only', 'no probabilities', 'only mortality'], answer: 'transition forces between states', explanation: 'Markov model with states and transition rates.' },
];

// ─── CAS exams ───
export const CAS_MAS1_DOMAINS = [
  { id: 'mas1_prob', name: 'Probability & Distributions', desc: 'Probability, univariate/multivariate', weight: 0.35, games: [] },
  { id: 'mas1_est', name: 'Estimation', desc: 'MLE, Bayesian, goodness of fit', weight: 0.35, games: [] },
  { id: 'mas1_model', name: 'Modeling', desc: 'Linear models, time series intro', weight: 0.30, games: [] },
];

export const CAS_MAS1_QUESTIONS = [
  { id: 'm1a', comp: 'mas1_prob', type: 'mc', difficulty: 1, q: 'MLE stands for:', choices: ['Mean Likelihood Estimate', 'Maximum Likelihood Estimation', 'Minimum Loss Estimate', 'Marginal Likelihood'], answer: 'Maximum Likelihood Estimation', explanation: 'MLE maximizes the likelihood function.' },
  { id: 'm1b', comp: 'mas1_est', type: 'mc', difficulty: 2, q: 'Chi-square goodness-of-fit test compares:', choices: ['observed and expected counts', 'means only', 'variances only', 'correlations'], answer: 'observed and expected counts', explanation: 'Test of fit for categorical or binned data.' },
  { id: 'm1c', comp: 'mas1_model', type: 'mc', difficulty: 1, q: 'In linear regression, R² measures:', choices: ['proportion of variance explained', 'slope', 'intercept', 'residual sum only'], answer: 'proportion of variance explained', explanation: 'R² = 1 − (SS_res/SS_tot).' },
];

export const CAS_MAS2_DOMAINS = [
  { id: 'mas2_lin', name: 'Linear Models', desc: 'Regression, GLM', weight: 0.35, games: [] },
  { id: 'mas2_time', name: 'Time Series', desc: 'ARIMA, forecasting', weight: 0.35, games: [] },
  { id: 'mas2_other', name: 'Other Topics', desc: 'Simulation, credibility', weight: 0.30, games: [] },
];

export const CAS_MAS2_QUESTIONS = [
  { id: 'm2a', comp: 'mas2_lin', type: 'mc', difficulty: 1, q: 'GLM generalizes linear regression by allowing:', choices: ['only normal response', 'non-normal response and link function', 'no link', 'only identity link'], answer: 'non-normal response and link function', explanation: 'GLM: response distribution + link.' },
  { id: 'm2b', comp: 'mas2_time', type: 'mc', difficulty: 2, q: 'AR(1) model: X_t = φ X_{t−1} + ε_t. Stationary when:', choices: ['|φ| < 1', 'φ > 1', 'φ = 0 only', 'φ = 1'], answer: '|φ| < 1', explanation: 'Stationarity for AR(1) requires |φ| < 1.' },
  { id: 'm2c', comp: 'mas2_other', type: 'mc', difficulty: 1, q: 'Monte Carlo simulation is used for:', choices: ['exact analytic answers only', 'approximating distributions and expectations', 'only discrete r.v.', 'no variance'], answer: 'approximating distributions and expectations', explanation: 'Simulation approximates when analytic is hard.' },
];

// CAS 5, 6, 7, 8, 9 — domains and questions per exam (expand with real syllabus as needed)
export const CAS_5_DOMAINS = [
  { id: 'cas5_ratemaking', name: 'Ratemaking', desc: 'Basic ratemaking, loss development', weight: 0.50, games: [] },
  { id: 'cas5_reserving', name: 'Reserving', desc: 'Claim liabilities, methods', weight: 0.50, games: [] },
];
export const CAS_5_QUESTIONS = [
  { id: 'c51', comp: 'cas5_ratemaking', type: 'mc', difficulty: 1, q: 'Loss ratio =', choices: ['earned premium / incurred loss', 'incurred loss / earned premium', 'written premium / loss', 'loss / exposure'], answer: 'incurred loss / earned premium', explanation: 'Loss ratio = losses / premium.' },
  { id: 'c52', comp: 'cas5_reserving', type: 'mc', difficulty: 2, q: 'Chain ladder method is used for:', choices: ['ratemaking only', 'estimating claim reserves', 'pricing only', 'underwriting'], answer: 'estimating claim reserves', explanation: 'Chain ladder projects development to ultimate.' },
];

export const CAS_6_DOMAINS = [
  { id: 'cas6_reg', name: 'Regulation', desc: 'Insurance regulation, financial reporting', weight: 0.50, games: [] },
  { id: 'cas6_fin', name: 'Financial Reporting', desc: 'Statutory, GAAP', weight: 0.50, games: [] },
];
export const CAS_6_QUESTIONS = [
  { id: 'c61', comp: 'cas6_reg', type: 'mc', difficulty: 1, q: 'NAIC model laws relate to:', choices: ['state insurance regulation', 'federal tax only', 'international only', 'accounting only'], answer: 'state insurance regulation', explanation: 'NAIC = National Association of Insurance Commissioners.' },
  { id: 'c62', comp: 'cas6_fin', type: 'mc', difficulty: 2, q: 'Statutory accounting differs from GAAP in:', choices: ['conservatism, admissibility', 'only GAAP', 'only statutory', 'no difference'], answer: 'conservatism, admissibility', explanation: 'Statutory is more conservative; some assets inadmissible.' },
];

export const CAS_7_DOMAINS = [
  { id: 'cas7_adv', name: 'Advanced Reserving', desc: 'Claim liability estimation', weight: 0.50, games: [] },
  { id: 'cas7_special', name: 'Special Topics', desc: 'Reinsurance, run-off', weight: 0.50, games: [] },
];
export const CAS_7_QUESTIONS = [
  { id: 'c71', comp: 'cas7_adv', type: 'mc', difficulty: 1, q: 'Stochastic reserving incorporates:', choices: ['only point estimates', 'uncertainty and distributions', 'no variance', 'only mean'], answer: 'uncertainty and distributions', explanation: 'Stochastic methods quantify uncertainty.' },
  { id: 'c72', comp: 'cas7_special', type: 'mc', difficulty: 2, q: 'Reinsurance can transfer:', choices: ['only premium', 'risk and/or loss', 'only expenses', 'nothing'], answer: 'risk and/or loss', explanation: 'Reinsurance transfers risk from ceding to assuming company.' },
];

export const CAS_8_DOMAINS = [
  { id: 'cas8_adv_rate', name: 'Advanced Ratemaking', desc: 'Ratemaking techniques', weight: 0.50, games: [] },
  { id: 'cas8_trend', name: 'Trending & Credibility', desc: 'Trend, credibility in rating', weight: 0.50, games: [] },
];
export const CAS_8_QUESTIONS = [
  { id: 'c81', comp: 'cas8_adv_rate', type: 'mc', difficulty: 1, q: 'Experience rating adjusts premium based on:', choices: ['industry only', 'insured’s own loss experience', 'competition only', 'no adjustment'], answer: 'insured’s own loss experience', explanation: 'Experience rating uses policyholder’s history.' },
  { id: 'c82', comp: 'cas8_trend', type: 'mc', difficulty: 2, q: 'Loss trend is used to:', choices: ['ignore inflation', 'project losses to future level', 'eliminate variance', 'only historical'], answer: 'project losses to future level', explanation: 'Trend adjusts for inflation and other shifts.' },
];

export const CAS_9_DOMAINS = [
  { id: 'cas9_risk', name: 'Risk Management', desc: 'ERM, risk identification', weight: 0.50, games: [] },
  { id: 'cas9_capital', name: 'Capital & Solvency', desc: 'Capital adequacy, stress testing', weight: 0.50, games: [] },
];
export const CAS_9_QUESTIONS = [
  { id: 'c91', comp: 'cas9_risk', type: 'mc', difficulty: 1, q: 'ERM stands for:', choices: ['Enterprise Risk Management', 'Estimated Risk Model', 'Exposure Rating Method', 'Equal Risk Measure'], answer: 'Enterprise Risk Management', explanation: 'ERM = holistic approach to risk.' },
  { id: 'c92', comp: 'cas9_capital', type: 'mc', difficulty: 2, q: 'Stress testing assesses:', choices: ['only best case', 'impact of severe scenarios on capital', 'only premium', 'no scenarios'], answer: 'impact of severe scenarios on capital', explanation: 'Stress tests evaluate resilience under adverse scenarios.' },
];

// ─── Test configs ───
export const ACTUARY_TEST_CONFIG = {
  soa_p: { totalQuestions: 30, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { p_gen: 11, p_uni: 11, p_multi: 8 } },
  soa_fm: { totalQuestions: 30, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { fm_tvm: 8, fm_ann: 9, fm_loans: 9, fm_cash: 4 } },
  soa_ifm: { totalQuestions: 30, timeMinutes: 180, passingScore: 0.70, categoryDistribution: { ifm_deriv: 12, ifm_asset: 11, ifm_corp: 7 } },
  soa_srm: { totalQuestions: 35, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { srm_lin: 12, srm_time: 12, srm_other: 11 } },
  soa_stam: { totalQuestions: 35, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { stam_freq: 12, stam_agg: 12, stam_cred: 11 } },
  soa_ltam: { totalQuestions: 35, timeMinutes: 300, passingScore: 0.70, categoryDistribution: { ltam_surv: 12, ltam_ins: 12, ltam_pension: 11 } },
  cas_mas1: { totalQuestions: 40, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { mas1_prob: 14, mas1_est: 14, mas1_model: 12 } },
  cas_mas2: { totalQuestions: 40, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { mas2_lin: 14, mas2_time: 14, mas2_other: 12 } },
  cas_5: { totalQuestions: 40, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { cas5_ratemaking: 20, cas5_reserving: 20 } },
  cas_6: { totalQuestions: 40, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { cas6_reg: 20, cas6_fin: 20 } },
  cas_7: { totalQuestions: 40, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { cas7_adv: 20, cas7_special: 20 } },
  cas_8: { totalQuestions: 40, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { cas8_adv_rate: 20, cas8_trend: 20 } },
  cas_9: { totalQuestions: 40, timeMinutes: 240, passingScore: 0.70, categoryDistribution: { cas9_risk: 20, cas9_capital: 20 } },
};

export function getActuaryQuestionsForExam(examId) {
  const map = {
    soa_p: SOA_P_QUESTIONS,
    soa_fm: SOA_FM_QUESTIONS,
    soa_ifm: SOA_IFM_QUESTIONS,
    soa_srm: SOA_SRM_QUESTIONS,
    soa_stam: SOA_STAM_QUESTIONS,
    soa_ltam: SOA_LTAM_QUESTIONS,
    cas_mas1: CAS_MAS1_QUESTIONS,
    cas_mas2: CAS_MAS2_QUESTIONS,
    cas_5: CAS_5_QUESTIONS,
    cas_6: CAS_6_QUESTIONS,
    cas_7: CAS_7_QUESTIONS,
    cas_8: CAS_8_QUESTIONS,
    cas_9: CAS_9_QUESTIONS,
  };
  return map[examId] || SOA_P_QUESTIONS;
}

export function getActuaryDomainsForExam(examId) {
  const map = {
    soa_p: SOA_P_DOMAINS,
    soa_fm: SOA_FM_DOMAINS,
    soa_ifm: SOA_IFM_DOMAINS,
    soa_srm: SOA_SRM_DOMAINS,
    soa_stam: SOA_STAM_DOMAINS,
    soa_ltam: SOA_LTAM_DOMAINS,
    cas_mas1: CAS_MAS1_DOMAINS,
    cas_mas2: CAS_MAS2_DOMAINS,
    cas_5: CAS_5_DOMAINS,
    cas_6: CAS_6_DOMAINS,
    cas_7: CAS_7_DOMAINS,
    cas_8: CAS_8_DOMAINS,
    cas_9: CAS_9_DOMAINS,
  };
  return map[examId] || SOA_P_DOMAINS;
}
