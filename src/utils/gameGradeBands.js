export function resolveGameGradeBand(grade) {
  const g = String(grade || '').toLowerCase();
  if (g.includes('grade6')) return 'g6';
  if (g.includes('grade7')) return 'g7';
  if (g.includes('grade8') || g.includes('grade4-8')) return 'g8';
  if (
    g.includes('grade9') ||
    g.includes('grade10') ||
    g.includes('grade11') ||
    g.includes('algebra') ||
    g.includes('grade7-12')
  ) {
    return 'hs';
  }
  return 'g7';
}

export function gameGradeBandLabel(band) {
  if (band === 'g6') return 'Grade 6';
  if (band === 'g7') return 'Grade 7';
  if (band === 'g8') return 'Grade 8';
  return 'Algebra/HS';
}
