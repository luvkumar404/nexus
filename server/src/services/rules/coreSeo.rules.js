import { makeRules } from './ruleFactory.js';

export const coreSeoRules = makeRules('core-seo', [
  'core-title-present',
  'core-title-length',
  'core-description-present',
  'core-description-length',
  'core-canonical-present',
  'core-canonical-valid',
  'core-viewport-present',
  'core-favicon-present',
  'core-h1-present',
  'core-h1-single',
  'core-canonical-header',
  'core-nosnippet',
  'core-robots-meta',
  'core-title-unique',
  'core-canonical-conflicting',
  'core-canonical-to-homepage',
  'core-canonical-http-mismatch',
  'core-canonical-loop',
  'core-canonical-to-noindex'
], {
  'core-title-present': { name: 'Title Present', severity: 'high' },
  'core-description-present': { name: 'Meta Description Present', severity: 'high' },
  'core-h1-present': { name: 'H1 Present', severity: 'high' }
});
