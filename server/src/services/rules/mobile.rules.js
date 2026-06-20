import { makeRules } from './ruleFactory.js';

export const mobileRules = makeRules('mobile', [
  'mobile-font-size',
  'mobile-horizontal-scroll',
  'mobile-interstitials',
  'mobile-viewport-width',
  'mobile-multiple-viewport-tags'
]);
