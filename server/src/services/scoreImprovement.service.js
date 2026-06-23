const severityRank = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const impactRank = { high: 0, medium: 1, moderate: 1, low: 2 };

function priorityRank(rule) {
  const high = ['critical', 'high'].includes(rule.severity) || rule.solution?.priority === 'high';
  if (high && rule.status === 'fail') return 0;
  if (high && rule.status === 'warn') return 1;
  return 2;
}

function compareRules(a, b) {
  return priorityRank(a) - priorityRank(b)
    || (impactRank[String(a.impact).toLowerCase()] ?? 3) - (impactRank[String(b.impact).toLowerCase()] ?? 3)
    || (severityRank[a.severity] ?? 4) - (severityRank[b.severity] ?? 4)
    || a.ruleId.localeCompare(b.ruleId);
}

function calculableImpact(category, availableWeight) {
  const eligible = (category.rules || []).filter((rule) => ['pass', 'warn', 'fail'].includes(rule.status) && Number.isFinite(Number(rule.score)));
  const actionable = eligible.filter((rule) => ['fail', 'warn'].includes(rule.status));
  if (!eligible.length || actionable.length === 0 || !Number.isFinite(category.weight) || !availableWeight) return null;
  const categoryPoints = actionable.reduce((sum, rule) => sum + (100 - Number(rule.score)), 0) / eligible.length;
  return {
    categoryPoints,
    overallPoints: categoryPoints * (category.weight / availableWeight)
  };
}

export function buildScoreImprovementPlan(categories = []) {
  const availableWeight = categories.filter((category) => category.score !== null).reduce((sum, category) => sum + Number(category.weight || 0), 0);
  return categories.map((category) => {
    const priorityRules = (category.rules || []).filter((rule) => ['fail', 'warn'].includes(rule.status)).sort(compareRules);
    const projected = calculableImpact(category, availableWeight);
    return {
      categoryId: category.id,
      categoryName: category.name,
      currentScore: category.score,
      targetScore: projected && category.score != null ? Math.min(100, Math.round(category.score + projected.categoryPoints)) : null,
      expectedScoreImpact: projected ? `Up to +${projected.overallPoints.toFixed(1)} overall points` : null,
      scoreImpactCertain: Boolean(projected),
      scoreImpactExplanation: projected ? 'Calculated from current eligible rule scores and category weights; actual results require every listed rule to pass.' : 'A score change cannot be calculated from the available rule weights and scores.',
      difficulty: priorityRules.some((rule) => rule.difficulty === 'hard') ? 'hard' : priorityRules.some((rule) => rule.difficulty === 'medium') ? 'medium' : 'easy',
      topFixes: priorityRules.map((rule) => ({
        ruleId: rule.ruleId,
        status: rule.status,
        priority: rule.solution?.priority,
        title: rule.ruleName,
        recommendation: rule.solution?.solution || rule.recommendation,
        impact: rule.impact,
        difficulty: rule.difficulty
      }))
    };
  }).filter((item) => item.topFixes.length > 0);
}
