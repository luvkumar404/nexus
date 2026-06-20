import { makeRules } from './ruleFactory.js';

export const technicalSeoRules = makeRules('technical-seo', [
  'technical-robots-txt-exists',
  'technical-robots-txt-valid',
  'technical-sitemap-exists',
  'technical-sitemap-valid',
  'technical-url-structure',
  'technical-trailing-slash-consistency',
  'technical-www-redirect',
  'technical-custom-404',
  'technical-soft-404',
  'technical-server-errors',
  'technical-non-404-4xx',
  'technical-timeout',
  'technical-content-type-validation'
]);
