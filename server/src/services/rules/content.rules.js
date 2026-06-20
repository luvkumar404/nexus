import { makeRules } from './ruleFactory.js';

export const contentRules = makeRules('content', [
  'content-word-count',
  'content-reading-level',
  'content-keyword-stuffing',
  'content-article-link-density',
  'content-broken-html',
  'content-meta-tags-in-body',
  'content-mime-type',
  'content-duplicate-description',
  'content-heading-hierarchy',
  'content-heading-length',
  'content-heading-uniqueness',
  'content-text-html-ratio',
  'content-title-same-as-h1',
  'content-title-pixel-width',
  'content-description-pixel-width',
  'content-exact-duplicate-content',
  'content-near-duplicate-content'
]);
