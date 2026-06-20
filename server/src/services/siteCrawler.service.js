import * as cheerio from 'cheerio';
import { env } from '../config/env.js';
import { fetchPage } from './fetchPage.service.js';
import { sameOrigin } from '../utils/normalizeUrl.js';

function absolute(base, value) {
  try {
    return new URL(value, base).toString().split('#')[0];
  } catch {
    return null;
  }
}

function extractPageSignals(page) {
  const $ = cheerio.load(page.html || '');
  const links = $('a[href]').map((_, el) => absolute(page.finalUrl, $(el).attr('href'))).get().filter(Boolean);
  return {
    url: page.finalUrl,
    statusCode: page.statusCode,
    title: $('title').first().text().trim(),
    canonical: $('link[rel="canonical"]').first().attr('href') ? absolute(page.finalUrl, $('link[rel="canonical"]').first().attr('href')) : '',
    robotsMeta: $('meta[name="robots"]').attr('content') || '',
    internalLinks: links.filter((link) => sameOrigin(link, page.finalUrl)),
    paginationLinks: {
      next: $('link[rel="next"]').attr('href') ? absolute(page.finalUrl, $('link[rel="next"]').attr('href')) : '',
      prev: $('link[rel="prev"]').attr('href') ? absolute(page.finalUrl, $('link[rel="prev"]').attr('href')) : ''
    }
  };
}

export async function crawlSite(startUrl, { enabled, maxPages, seedPage } = {}) {
  if (!enabled) {
    return {
      enabled: false,
      crawlPages: [],
      internalLinkGraph: {},
      canonicalMap: {},
      noindexPages: [],
      paginationLinks: []
    };
  }
  const limit = Math.max(1, Math.min(Number(maxPages || env.auditMaxPages), env.auditMaxPages));
  const crawlStartUrl = seedPage?.finalUrl || startUrl;
  const queue = [crawlStartUrl];
  const seen = new Set();
  const crawlPages = [];
  const internalLinkGraph = {};
  const canonicalMap = {};
  const noindexPages = [];
  const paginationLinks = [];

  async function processPage(next) {
    try {
      const page = seedPage && next === crawlStartUrl ? seedPage : await fetchPage(next, { preferBrowser: false, logDebug: false, timeout: 15000 });
      const contentType = page.headers['content-type'] || '';
      if (!contentType.includes('text/html') && !page.html.includes('<html')) return;
      const signals = extractPageSignals(page);
      crawlPages.push(signals);
      internalLinkGraph[signals.url] = signals.internalLinks;
      if (signals.canonical) canonicalMap[signals.url] = signals.canonical;
      if (/noindex/i.test(signals.robotsMeta)) noindexPages.push(signals.url);
      if (signals.paginationLinks.next || signals.paginationLinks.prev) paginationLinks.push({ url: signals.url, ...signals.paginationLinks });
      signals.internalLinks.forEach((link) => {
        if (!seen.has(link) && queue.length < limit * 3) queue.push(link);
      });
    } catch {
      // Crawl failures are handled as unavailable by rules unless confirmed evidence exists.
    }
  }

  while (queue.length && seen.size < limit) {
    const batch = [];
    while (queue.length && batch.length < env.auditConcurrency && seen.size < limit) {
      const next = queue.shift();
      if (!next || seen.has(next) || !sameOrigin(next, crawlStartUrl)) continue;
      seen.add(next);
      batch.push(next);
    }
    if (!batch.length) continue;
    await Promise.all(batch.map((next) => processPage(next)));
  }

  return { enabled: true, crawlPages, internalLinkGraph, canonicalMap, noindexPages, paginationLinks };
}
