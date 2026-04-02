/**
 * Short tutoring copy for Math 7–12 loop games (Match, Bingo, Jeopardy).
 * Keeps explanations concise for GameReview + QBotExplainer.
 */

/** @param {string} expression @param {string|number} answer */
export function explainMathLoopExpression(expression, answer) {
  const expr = String(expression || '').trim();
  const ans = String(answer);
  if (/\d+\s*[+]\s*\d+/.test(expr)) {
    const [a, b] = expr.split('+').map((s) => s.trim());
    return `Add: ${a} + ${b}. Align place value and add column by column → ${ans}.`;
  }
  if (/\d+\s*[-−]\s*\d+/.test(expr)) {
    const parts = expr.split(/[-−]/).map((s) => s.trim());
    return `Subtract: ${parts[0]} − ${parts[1]}. Regroup if needed → ${ans}.`;
  }
  if (/\d+\s*[×x*]\s*\d+/.test(expr)) {
    const [a, b] = expr.split(/[×x*]/).map((s) => s.trim());
    return `Multiply: ${a} × ${b} (repeated addition or facts) → ${ans}.`;
  }
  if (/\d+\s*÷\s*\d+/.test(expr) || /\d+\s*\/\s*\d+/.test(expr)) {
    return `Divide: think “what times the divisor equals the dividend?” → ${ans}.`;
  }
  if (/slope/i.test(expr)) {
    return `Slope m = (y₂ − y₁)/(x₂ − x₁) with two points on the line → ${ans}.`;
  }
  if (/y-int|y intercept|f\(0\)/i.test(expr)) {
    return `The y-intercept is the output when x = 0 (or the constant in y = mx + b) → ${ans}.`;
  }
  if (/→\s*x|solve|=\s*\?\s*→\s*x/i.test(expr) || /x\s*=\s*\?/i.test(expr)) {
    return `Isolate x with inverse operations on both sides → ${ans}.`;
  }
  if (/factor/i.test(expr)) {
    return `Factor using GCF, patterns, or quadratic structure; keyed form → ${ans}.`;
  }
  if (/vertex/i.test(expr)) {
    return `Vertex from y = a(x − h)² + k is (h, k) → ${ans}.`;
  }
  if (/√|sqrt|x²\s*=/i.test(expr)) {
    return `Use roots or inverse squares; watch for principal (positive) root when context demands → ${ans}.`;
  }
  if (/\|\s*−|^\s*\|/i.test(expr) || /\|−/.test(expr)) {
    return `Absolute value is distance from zero: simplify inside the bars → ${ans}.`;
  }
  if (/GCF|gcd|LCM|lcm|C\(|P\(|!/i.test(expr)) {
    return `Use prime factorization, counting rules (n!, C(n,r)), or listing factors → ${ans}.`;
  }
  if (/Re\(|Im\(|i²|i⁴|\|.*\+.*i\|/i.test(expr)) {
    return `Complex: Re = real part, Im = imaginary; |a+bi| = √(a²+b²); i² = −1 → ${ans}.`;
  }
  if (/sin|cos|tan|θ|°/i.test(expr)) {
    return `Use the unit circle, right-triangle ratios, or identities; substitute carefully → ${ans}.`;
  }
  if (/mean|median|mode|range/i.test(expr)) {
    return `Statistics: mean = average, median = middle, mode = most frequent, range = max − min → ${ans}.`;
  }
  if (/P\(|probability|%\)/i.test(expr)) {
    return `Probability: favorable ÷ total; adjust for with/without replacement or “not” → ${ans}.`;
  }
  if (/perimeter|area|volume/i.test(expr)) {
    return `Use the right formula for the shape (rectangle, square, …) and substitute given lengths → ${ans}.`;
  }
  if (/f\(x\)|→\s*y/i.test(expr)) {
    return `Substitute into the function and simplify step by step → ${ans}.`;
  }
  return `Work the expression step by step; compare your reasoning to the keyed result ${ans}.`;
}

/**
 * @param {{ q: string, answer: string, choices?: string[] }} q
 * @param {string} choice
 * @param {boolean} isCorrect
 */
export function explainJeopardyMc(q, choice, isCorrect) {
  const stem = String(q?.q || '');
  const correct = String(q?.answer ?? '');
  if (isCorrect) {
    return `${correct} fits the stem. On similar items, verify each distractor against the exact wording of the question.`;
  }
  const picked = String(choice ?? '');
  const prefix = picked && picked !== correct
    ? `You chose “${picked}”, but the best match is “${correct}”. `
    : '';
  if (/\d/.test(stem) && (/what is|compute|find|equals|=\s*\?/i.test(stem))) {
    return `${prefix}Recompute or model the situation with an equation; watch sign and order of operations, then match the keyed value.`;
  }
  if (/which|best|most appropriate|primarily|key (purpose|reason|idea)|teacher should|student(s)? should/i.test(stem)) {
    return `${prefix}Eliminate choices that are only partially true or true in general but do not answer this stem. Pick the option most directly tied to the scenario.`;
  }
  return `${prefix}Re-read the stem; cross out distractors that are off-topic. The accepted response is “${correct}”.`;
}
