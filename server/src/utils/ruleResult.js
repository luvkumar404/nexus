import { statusToScore } from './scoreUtils.js';

function baseResult({
  status,
  message,
  recommendation,
  evidence = {},
  source = 'html',
  affectedUrl,
  severity = 'medium',
  impact = 'medium',
  difficulty = 'easy',
  confidence = 'high',
  developerDetails
}) {
  const scoreEligible = ['pass', 'warn', 'fail'].includes(status);
  return {
    status,
    score: scoreEligible ? statusToScore(status) : null,
    severity,
    message,
    recommendation,
    evidence,
    affectedUrl,
    impact,
    difficulty,
    source,
    confidence,
    scoreEligible,
    ...(developerDetails ? { developerDetails } : {})
  };
}

export function createPass(input = {}) {
  return baseResult({ status: 'pass', severity: input.severity || 'info', message: input.message || 'Check passed.', recommendation: input.recommendation || 'No action needed.', ...input });
}

export function createWarn(input = {}) {
  return baseResult({ status: 'warn', severity: input.severity || 'medium', message: input.message || 'This check needs attention.', recommendation: input.recommendation || 'Review and improve this item.', ...input });
}

export function createFail(input = {}) {
  return baseResult({ status: 'fail', severity: input.severity || 'high', message: input.message || 'This check failed.', recommendation: input.recommendation || 'Fix this issue.', ...input });
}

export function createInfo(input = {}) {
  return baseResult({ status: 'info', severity: input.severity || 'info', message: input.message || 'Informational check.', recommendation: input.recommendation || 'Review if relevant.', ...input });
}

export function createNotAvailable({
  message = 'This rule could not be evaluated with the available audit data.',
  recommendation = 'No action is required until the required data source is available.',
  evidence = {},
  source = 'html',
  affectedUrl,
  reason = 'not_available',
  severity = 'info',
  impact = 'medium',
  difficulty = 'easy',
  confidence = 'high',
  developerDetails
} = {}) {
  return baseResult({
    status: 'not_available',
    severity,
    message,
    recommendation,
    evidence: { ...evidence, reason },
    source,
    affectedUrl,
    impact,
    difficulty,
    confidence,
    developerDetails
  });
}

export function createSkipped({
  message = 'This rule is not applicable to this page.',
  recommendation = 'No action is required for this page type or audit mode.',
  evidence = {},
  source = 'html',
  affectedUrl,
  reason = 'skipped',
  severity = 'info',
  impact = 'low',
  difficulty = 'easy',
  confidence = 'high'
} = {}) {
  return baseResult({
    status: 'skipped',
    severity,
    message,
    recommendation,
    evidence: { ...evidence, reason },
    source,
    affectedUrl,
    impact,
    difficulty,
    confidence
  });
}
