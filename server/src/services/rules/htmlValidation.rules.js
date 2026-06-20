import { makeRules } from './ruleFactory.js';

export const htmlValidationRules = makeRules('html-validation', [
  'html-missing-doctype',
  'html-missing-charset',
  'html-invalid-head',
  'html-noscript-in-head',
  'html-multiple-heads',
  'html-size-limit',
  'html-lorem-ipsum',
  'html-multiple-titles',
  'html-multiple-descriptions'
]);
