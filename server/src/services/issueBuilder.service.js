export function buildIssuesFromRuleResults(auditId, ruleResults) {
  return ruleResults
    .filter((rule) => ['fail', 'warn'].includes(rule.status))
    .map((rule) => ({
      audit: auditId,
      title: rule.ruleName,
      description: rule.message,
      severity: rule.severity === 'critical' ? 'critical' : rule.status === 'fail' ? 'high' : 'medium',
      category: rule.categoryId,
      affectedUrl: rule.affectedUrl,
      recommendation: rule.recommendation,
      estimatedImpact: rule.impact,
      difficulty: rule.difficulty
    }));
}
