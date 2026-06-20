export function plainText($) {
  return $('body').text().replace(/\s+/g, ' ').trim();
}

export function wordCount(text = '') {
  return text.split(/\s+/).filter(Boolean).length;
}

export function hasDuplicateValues(values = []) {
  const clean = values.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
  return new Set(clean).size !== clean.length;
}

export function readingEase(text = '') {
  const sentences = Math.max(text.split(/[.!?]+/).filter(Boolean).length, 1);
  const words = Math.max(wordCount(text), 1);
  const syllables = text.toLowerCase().split(/\s+/).reduce((sum, word) => sum + Math.max((word.match(/[aeiouy]+/g) || ['x']).length, 1), 0);
  return Math.round(Math.max(0, Math.min(100, 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words))));
}
