import { makeRules } from './ruleFactory.js';

export const aiGeoReadinessRules = makeRules('ai-geo-readiness', [
  'ai-semantic-html',
  'ai-content-structure',
  'ai-bot-access',
  'ai-llms-txt',
  'ai-schema-drift'
]);
