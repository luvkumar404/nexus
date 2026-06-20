import { AUDIT_RULES } from '../config/auditRules.config.js';
import { scoreAudit } from './scoring.service.js';

export async function runRulesEngine(context) {
  const ruleResults = [];
  for (const rule of AUDIT_RULES) {
    const output = await rule.run(context);
    ruleResults.push({
      ruleId: rule.id,
      categoryId: rule.category,
      ruleName: rule.name,
      status: output.status,
      score: output.score,
      scoreEligible: output.scoreEligible === true,
      severity: output.severity || rule.severity || 'info',
      message: output.message,
      recommendation: output.recommendation,
      evidence: output.evidence || {},
      developerDetails: output.developerDetails,
      affectedUrl: context.finalUrl || context.url,
      impact: output.impact || 'medium',
      difficulty: output.difficulty || 'easy',
      source: output.source || 'html',
      confidence: output.confidence || 'high'
    });
  }
  return scoreAudit(ruleResults);
}
