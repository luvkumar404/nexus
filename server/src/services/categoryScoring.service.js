import { labelFromScore } from '../utils/scoreUtils.js';

export function calculateCategoryScore(categoryRules) {
  const eligible = categoryRules.filter((rule) => ['pass', 'warn', 'fail'].includes(rule.status));
  if (eligible.length === 0) return null;
  const total = eligible.reduce((sum, rule) => sum + Number(rule.score), 0);
  return Math.round(total / eligible.length);
}

export function calculateOverallScore(categories) {
  const available = categories.filter((category) => category.score !== null);
  if (available.length === 0) return null;
  const totalWeight = available.reduce((sum, category) => sum + category.weight, 0);
  const weightedScore = available.reduce((sum, category) => sum + category.score * (category.weight / totalWeight), 0);
  return Math.round(weightedScore);
}

export function buildCategoryResult(config, rules) {
  const score = calculateCategoryScore(rules);
  const passed = rules.filter((rule) => rule.status === 'pass').length;
  const warnings = rules.filter((rule) => rule.status === 'warn').length;
  const failed = rules.filter((rule) => rule.status === 'fail').length;
  const info = rules.filter((rule) => rule.status === 'info').length;
  const notAvailable = rules.filter((rule) => rule.status === 'not_available').length;
  const skipped = rules.filter((rule) => rule.status === 'skipped').length;
  return {
    id: config.id,
    name: config.name,
    weight: config.weight,
    score,
    status: labelFromScore(score),
    totalRules: rules.length,
    applicableRules: passed + warnings + failed,
    scoreEligibleRules: passed + warnings + failed,
    passed,
    warnings,
    failed,
    info,
    notAvailable,
    skipped,
    scoreExplanation: {
      eligibleRules: passed + warnings + failed,
      skippedRules: skipped,
      notAvailableRules: notAvailable,
      scoringFormula: 'Average of pass/warn/fail rules only',
      note: score === null && config.id === 'crawlability'
        ? 'Crawlability requires site crawl mode. Enable crawl mode to audit sitemap conflicts, orphan pages, pagination, and indexability signals.'
        : score === null
          ? 'No score-eligible rules were available for this category.'
          : 'Info, skipped, and not available rules do not affect this score.'
    },
    rules
  };
}
