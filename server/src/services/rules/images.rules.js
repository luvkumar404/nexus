import { makeRules } from './ruleFactory.js';

export const imagesRules = makeRules('images', [
  'images-alt-present',
  'images-alt-quality',
  'images-dimensions',
  'images-lazy-loading',
  'images-modern-format',
  'images-size',
  'images-responsive-srcset',
  'images-broken-images',
  'images-figure-captions',
  'images-filename-quality',
  'images-inline-svg-size',
  'images-picture-fallback',
  'images-alt-length',
  'images-background-image-seo-warning'
]);
