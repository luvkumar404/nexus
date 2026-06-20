import { makeRules } from './ruleFactory.js';

export const redirectsRules = makeRules('redirects', [
  'redirects-meta-refresh-redirect',
  'redirects-javascript-redirect',
  'redirects-http-refresh-header',
  'redirects-redirect-loop',
  'redirects-redirect-type',
  'redirects-broken-redirect',
  'redirects-resource-redirect',
  'redirects-case-normalization-redirect'
]);
