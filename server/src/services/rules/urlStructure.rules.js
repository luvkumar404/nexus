import { makeRules } from './ruleFactory.js';

export const urlStructureRules = makeRules('url-structure', [
  'url-slug-keywords',
  'url-stop-words',
  'url-uppercase-urls',
  'url-underscores',
  'url-double-slashes',
  'url-spaces-in-url',
  'url-non-ascii',
  'url-length',
  'url-repetitive-path',
  'url-excessive-parameters',
  'url-session-ids',
  'url-tracking-params',
  'url-internal-search-urls',
  'url-http-https-duplicate'
]);
