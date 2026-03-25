function gcd(a, b) {
  const aa = Math.abs(a);
  const bb = Math.abs(b);
  if (bb === 0) return aa || 1;
  return gcd(bb, aa % bb);
}

function simplifyFraction(n, d) {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  const sign = d < 0 ? -1 : 1;
  const nn = n * sign;
  const dd = Math.abs(d);
  const g = gcd(nn, dd);
  return { n: nn / g, d: dd / g };
}

export function formatSignedInteger(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (n > 0) return `+${n}`;
  return String(n);
}

export function formatIntegerOption(value) {
  const raw = String(value).trim();
  if (/^-?\d+$/.test(raw)) return formatSignedInteger(raw);
  return raw;
}

export function formatCoordinateOption(value) {
  const raw = String(value).trim();
  const match = raw.match(/^\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/);
  if (!match) return raw;
  return `(${formatSignedInteger(match[1])}, ${formatSignedInteger(match[2])})`;
}

export function formatDecimalOption(value, decimalFormatter = (n) => String(n)) {
  const raw = String(value).trim();
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((part) => formatDecimalOption(part, decimalFormatter))
      .join(', ');
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) return decimalFormatter(Number(raw));
  return raw;
}

export function formatPercentOption(value, decimalFormatter = (n) => String(n)) {
  const raw = String(value).trim();
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((part) => formatPercentOption(part, decimalFormatter))
      .join(', ');
  }
  if (/^-?\d+(\.\d+)?%$/.test(raw)) {
    return `${decimalFormatter(Number(raw.replace('%', '')))}%`;
  }
  const fracMatch = raw.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (fracMatch) {
    const simplified = simplifyFraction(Number(fracMatch[1]), Number(fracMatch[2]));
    if (!simplified) return raw;
    return `${simplified.n}/${simplified.d}`;
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) return decimalFormatter(Number(raw));
  return raw;
}

export function formatProbabilityOption(value) {
  const raw = String(value).trim();
  const fracMatch = raw.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (fracMatch) {
    const simplified = simplifyFraction(Number(fracMatch[1]), Number(fracMatch[2]));
    if (!simplified) return raw;
    return `${simplified.n}/${simplified.d}`;
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) return String(Number(raw));
  return raw;
}
