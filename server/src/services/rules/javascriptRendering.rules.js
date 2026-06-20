import { makeRules } from './ruleFactory.js';

export const javascriptRenderingRules = makeRules('javascript-rendering', [
  'js-initial-html-title',
  'js-initial-html-description',
  'js-initial-html-h1',
  'js-initial-html-canonical',
  'js-canonical-mismatch',
  'js-noindex-mismatch',
  'js-title-modified-by-js',
  'js-description-modified-by-js',
  'js-h1-modified-by-js',
  'js-rendered-content',
  'js-rendered-links',
  'js-blocked-js-css',
  'js-ssr-check'
]);
