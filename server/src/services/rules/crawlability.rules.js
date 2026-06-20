import { makeRules } from './ruleFactory.js';

export const crawlabilityRules = makeRules('crawlability', [
  'crawl-schema-noindex-conflict',
  'crawl-pagination-canonical',
  'crawl-sitemap-domain',
  'crawl-noindex-in-sitemap',
  'crawl-indexability-conflict',
  'crawl-canonical-redirect',
  'crawl-sitemap-url-limit',
  'crawl-sitemap-size-limit',
  'crawl-sitemap-duplicate-urls',
  'crawl-sitemap-orphan-urls',
  'crawl-blocked-resources',
  'crawl-crawl-delay',
  'crawl-sitemap-in-robotstxt',
  'crawl-pagination-broken',
  'crawl-pagination-loop',
  'crawl-pagination-sequence',
  'crawl-pagination-noindex',
  'crawl-pagination-orphaned'
]);
