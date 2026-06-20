import { CATEGORY_ORDER, CATEGORY_WEIGHTS } from '../config/categoryWeights.config.js';
import { gradeFromScore } from '../utils/scoreUtils.js';
import { buildCategoryResult, calculateOverallScore } from './categoryScoring.service.js';

export function scoreAudit(ruleResults) {
  const categories = CATEGORY_ORDER.map((categoryId) => {
    const config = CATEGORY_WEIGHTS[categoryId];
    const rules = ruleResults.filter((rule) => rule.categoryId === categoryId);
    return buildCategoryResult(config, rules);
  });
  const overallScore = calculateOverallScore(categories);
  return {
    overallScore,
    grade: overallScore == null ? 'NA' : gradeFromScore(overallScore),
    summary: {
      totalRules: ruleResults.length,
      applicableRules: ruleResults.filter((rule) => ['pass', 'warn', 'fail'].includes(rule.status)).length,
      passed: ruleResults.filter((rule) => rule.status === 'pass').length,
      warnings: ruleResults.filter((rule) => rule.status === 'warn').length,
      failed: ruleResults.filter((rule) => rule.status === 'fail').length,
      info: ruleResults.filter((rule) => rule.status === 'info').length,
      notAvailable: ruleResults.filter((rule) => rule.status === 'not_available').length,
      skipped: ruleResults.filter((rule) => rule.status === 'skipped').length
    },
    categories
  };
}
