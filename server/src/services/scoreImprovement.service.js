function impactRange(category) {
  const missing = category.rules.filter((rule) => ['warn', 'fail'].includes(rule.status)).length;
  if (!missing) return '+0';
  const low = Math.min(40, Math.max(5, missing * 5));
  const high = Math.min(50, low + 15);
  return `+${low} to +${high}`;
}

export function buildScoreImprovementPlan(categories = []) {
  return categories.map((category) => {
    const priorityRules = (category.rules || [])
      .filter((rule) => ['fail', 'warn'].includes(rule.status))
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
      })
      .slice(0, 4);

    return {
      categoryId: category.id,
      categoryName: category.name,
      currentScore: category.score,
      targetScore: category.score == null ? null : Math.min(100, Math.max(90, category.score + 15)),
      expectedScoreImpact: impactRange(category),
      difficulty: priorityRules.some((rule) => rule.difficulty === 'hard') ? 'hard' : priorityRules.some((rule) => rule.difficulty === 'medium') ? 'medium' : 'easy',
      topFixes: priorityRules.map((rule) => ({
        ruleId: rule.ruleId,
        title: rule.ruleName,
        recommendation: rule.recommendation,
        impact: rule.impact,
        difficulty: rule.difficulty
      }))
    };
  }).filter((item) => item.topFixes.length > 0);
}
