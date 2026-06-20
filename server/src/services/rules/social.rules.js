import { makeRules } from './ruleFactory.js';

export const socialRules = makeRules('social', [
  'social-og-title',
  'social-og-description',
  'social-og-image',
  'social-og-image-dimensions',
  'social-og-url',
  'social-og-url-canonical-match',
  'social-twitter-card',
  'social-share-buttons',
  'social-profile-links'
]);
