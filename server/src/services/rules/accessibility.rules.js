import { makeRules } from './ruleFactory.js';

export const accessibilityRules = makeRules('accessibility', [
  'accessibility-aria-labels',
  'accessibility-color-contrast',
  'accessibility-focus-visible',
  'accessibility-form-labels',
  'accessibility-heading-order',
  'accessibility-landmark-regions',
  'accessibility-link-text',
  'accessibility-skip-link',
  'accessibility-table-headers',
  'accessibility-touch-targets',
  'accessibility-video-captions',
  'accessibility-zoom-disabled'
]);
