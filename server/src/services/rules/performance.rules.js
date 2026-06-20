import { makeRules } from './ruleFactory.js';

export const performanceRules = makeRules('performance', [
  'perf-lcp',
  'perf-cls',
  'perf-inp',
  'perf-ttfb',
  'perf-fcp',
  'perf-dom-size',
  'perf-css-file-size',
  'perf-font-loading',
  'perf-preconnect',
  'perf-render-blocking-resources',
  'perf-lazy-above-fold-images',
  'perf-lcp-hints',
  'perf-text-compression',
  'perf-brotli',
  'perf-cache-policy',
  'perf-minify-css',
  'perf-minify-js',
  'perf-response-time',
  'perf-http2',
  'perf-page-weight',
  'perf-js-file-size',
  'perf-video-for-animations'
]);
