export function tokenize(text = '') {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
}

export function jaccardSimilarity(a = '', b = '') {
  const aSet = new Set(tokenize(a));
  const bSet = new Set(tokenize(b));
  if (!aSet.size || !bSet.size) return 0;
  const intersection = [...aSet].filter((word) => bSet.has(word)).length;
  return intersection / new Set([...aSet, ...bSet]).size;
}

export function readabilityScore(text = '') {
  const sentences = Math.max(String(text).split(/[.!?]+/).filter(Boolean).length, 1);
  const words = Math.max(String(text).split(/\s+/).filter(Boolean).length, 1);
  const syllables = String(text).toLowerCase().split(/\s+/).reduce((sum, word) => {
    const matches = word.match(/[aeiouy]+/g);
    return sum + Math.max(matches ? matches.length : 1, 1);
  }, 0);
  return Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words))));
}
