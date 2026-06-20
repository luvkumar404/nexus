import { makeRules } from './ruleFactory.js';

export const internationalizationRules = makeRules('internationalization', [
  'intl-html-lang-attribute',
  'intl-hreflang-tags',
  'intl-hreflang-return-links',
  'intl-hreflang-to-noindex',
  'intl-hreflang-to-non-canonical',
  'intl-hreflang-to-broken-url',
  'intl-hreflang-to-redirect',
  'intl-conflicting-hreflang',
  'intl-language-mismatch',
  'intl-multiple-hreflang-declaration-methods'
]);
