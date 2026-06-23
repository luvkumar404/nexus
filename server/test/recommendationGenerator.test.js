import test from 'node:test';
import assert from 'node:assert/strict';
import { AUDIT_RULES } from '../src/config/auditRules.config.js';
import { generateRecommendation } from '../src/services/recommendationGenerator.service.js';
import { buildScoreImprovementPlan } from '../src/services/scoreImprovement.service.js';

function rule(overrides = {}) {
  return {
    ruleId: 'core-description-present',
    ruleName: 'Meta Description Present',
    categoryId: 'core-seo',
    status: 'fail',
    severity: 'high',
    message: 'Meta description is missing.',
    recommendation: 'Add a concise meta description.',
    evidence: { selector: 'meta[name="description"]' },
    affectedUrl: 'https://example.com/path/page',
    impact: 'high',
    difficulty: 'easy',
    score: 0,
    ...overrides
  };
}

test('failed and warning results receive complete structured solutions', () => {
  for (const status of ['fail', 'warn']) {
    const result = generateRecommendation(rule({ status }));
    assert.equal(result.status, status === 'fail' ? 'failed' : 'warning');
    for (const key of ['ruleId', 'title', 'category', 'priority', 'impact', 'expectedValue', 'explanation', 'solution', 'steps', 'verification', 'estimatedEffort']) assert.ok(result[key], key);
    assert.ok(Array.isArray(result.affectedItems));
    assert.ok(result.steps.length >= 4);
  }
});

test('passed, skipped, and unavailable results do not receive solutions', () => {
  for (const status of ['pass', 'skipped', 'not_available', 'info']) assert.equal(generateRecommendation(rule({ status })), null);
});

test('missing evidence is disclosed and does not produce a fabricated exact fix', () => {
  const result = generateRecommendation(rule({ evidence: {} }));
  assert.match(result.explanation, /Unable to determine an exact fix/);
  assert.match(result.solution, /Unable to determine an exact fix/);
  assert.deepEqual(result.affectedItems, ['https://example.com/path/page']);
});

test('relative affected resources are resolved against the audited URL', () => {
  const result = generateRecommendation(rule({ categoryId: 'images', ruleId: 'images-alt-present', evidence: { images: [{ src: '../hero.jpg', alt: null }] } }));
  assert.ok(result.affectedItems.includes('https://example.com/hero.jpg'));
});

test('every configured rule and category can produce a deterministic complete recommendation', () => {
  const categories = new Set();
  for (const configured of AUDIT_RULES) {
    categories.add(configured.category);
    const result = generateRecommendation(rule({ ruleId: configured.id, ruleName: configured.name, categoryId: configured.category, evidence: { value: 'detected' } }));
    assert.equal(result.ruleId, configured.id);
    assert.ok(result.expectedValue, configured.id);
    assert.ok(result.solution, configured.id);
    assert.ok(result.verification, configured.id);
  }
  assert.equal(categories.size, 20);
});

test('legal checks include an automated-check disclaimer', () => {
  const result = generateRecommendation(rule({ ruleId: 'legal-privacy-policy', categoryId: 'legal-compliance', evidence: { value: 'not found' } }));
  assert.match(result.automatedCheckDisclaimer, /not legal advice/i);
});

test('improvement plan prioritizes high failures then high warnings and calculates from weights', () => {
  const fail = rule({ ruleId: 'a', solution: { priority: 'high', solution: 'Fix A' } });
  const warning = rule({ ruleId: 'b', status: 'warn', score: 50, solution: { priority: 'high', solution: 'Fix B' } });
  const plan = buildScoreImprovementPlan([{ id: 'core-seo', name: 'Core SEO', weight: 12, score: 25, rules: [warning, fail] }]);
  assert.deepEqual(plan[0].topFixes.map((item) => item.ruleId), ['a', 'b']);
  assert.equal(plan[0].targetScore, 100);
  assert.equal(plan[0].expectedScoreImpact, 'Up to +75.0 overall points');
});
