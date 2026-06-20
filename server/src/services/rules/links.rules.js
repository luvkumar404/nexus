import { makeRules } from './ruleFactory.js';

export const linksRules = makeRules('links', [
  'links-broken-internal-links',
  'links-external-links',
  'links-internal-links-present',
  'links-nofollow-usage',
  'links-anchor-text',
  'links-link-depth',
  'links-dead-end-pages',
  'links-https-downgrade',
  'links-excessive-external-links',
  'links-invalid-href',
  'links-tel-mailto-validation',
  'links-redirect-chains',
  'links-orphan-pages',
  'links-localhost-links',
  'links-local-file-links',
  'links-broken-fragments',
  'links-excessive-total-links',
  'links-onclick-navigation',
  'links-whitespace-href'
]);
