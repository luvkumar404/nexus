import * as cheerio from 'cheerio';
import { classifyLinks } from '../utils/linkUtils.js';
import { extractImages } from '../utils/imageUtils.js';
import { extractSchema } from '../utils/schemaUtils.js';
import { plainText, readingEase, wordCount, hasDuplicateValues } from '../utils/textUtils.js';
import { extractDomain } from '../utils/extractDomain.js';
import { detectApplicabilitySignals, detectPageType } from './pageTypeDetector.service.js';

function metaContent($, selector) {
  return $(selector).first().attr('content')?.trim() || '';
}

function getMeta($, key) {
  return (
    metaContent($, `meta[property="${key}"]`) ||
    metaContent($, `meta[name="${key}"]`) ||
    metaContent($, `meta[itemprop="${key}"]`) ||
    null
  );
}

function safeAbsolute(value, base) {
  if (!value) return '';
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function extractHeadings($) {
  const clean = (text) => text.replace(/\s+/g, ' ').trim();
  const get = (tag) => $(tag).map((_, el) => clean($(el).text())).get().filter(Boolean);
  const headings = {
    h1: get('h1'),
    h2: get('h2'),
    h3: get('h3'),
    h4: get('h4'),
    h5: get('h5'),
    h6: get('h6')
  };
  return {
    ...headings,
    counts: {
      h1: headings.h1.length,
      h2: headings.h2.length,
      h3: headings.h3.length,
      h4: headings.h4.length,
      h5: headings.h5.length,
      h6: headings.h6.length
    },
    total: headings.h1.length + headings.h2.length + headings.h3.length + headings.h4.length + headings.h5.length + headings.h6.length,
    hasH1: headings.h1.length > 0,
    multipleH1: headings.h1.length > 1
  };
}

function headingWarnings(headings) {
  const warnings = [];
  if (!headings.h1.length) warnings.push('No H1 heading found.');
  if (headings.h1.length > 1) warnings.push('More than one H1 heading found.');
  const levels = [1, 2, 3, 4, 5, 6].filter((level) => headings[`h${level}`].length);
  for (let i = 1; i < levels.length; i += 1) {
    if (levels[i] - levels[i - 1] > 1) warnings.push(`Skipped heading level from H${levels[i - 1]} to H${levels[i]}.`);
  }
  if (hasDuplicateValues(Object.values(headings).flat())) warnings.push('Duplicate headings detected.');
  return warnings;
}

export function parseHtml({ url, normalizedUrl, finalUrl, html, headers, statusCode, timing, robotsTxt, sitemap, lighthouse, fetchMethod, debug }) {
  const $ = cheerio.load(html || '');
  const headings = extractHeadings($);
  const text = plainText($);
  const canonicals = $('link[rel="canonical"]').map((_, el) => safeAbsolute($(el).attr('href'), finalUrl)).get().filter(Boolean);
  const socialMeta = {
    'og:title': getMeta($, 'og:title') || '',
    'og:description': getMeta($, 'og:description') || '',
    'og:image': safeAbsolute(getMeta($, 'og:image'), finalUrl),
    'og:url': getMeta($, 'og:url') || finalUrl,
    'og:type': getMeta($, 'og:type') || '',
    'og:site_name': getMeta($, 'og:site_name') || '',
    'twitter:card': getMeta($, 'twitter:card') || '',
    'twitter:title': getMeta($, 'twitter:title') || '',
    'twitter:description': getMeta($, 'twitter:description') || '',
    'twitter:image': safeAbsolute(getMeta($, 'twitter:image'), finalUrl)
  };
  const meta = {
    title: $('title').first().text().trim(),
    description: getMeta($, 'description') || '',
    canonical: canonicals[0] || '',
    canonicals,
    viewport: metaContent($, 'meta[name="viewport"]'),
    robots: metaContent($, 'meta[name="robots"]'),
    favicon: $('link[rel~="icon"]').first().attr('href') || '',
    lang: $('html').attr('lang') || ''
  };
  const links = classifyLinks($, finalUrl);
  const images = extractImages($, finalUrl);
  const resources = {
    scripts: $('script[src]').map((_, el) => safeAbsolute($(el).attr('src'), finalUrl)).get().filter(Boolean),
    stylesheets: $('link[rel="stylesheet"]').map((_, el) => safeAbsolute($(el).attr('href'), finalUrl)).get().filter(Boolean)
  };
  const hreflang = $('link[rel="alternate"][hreflang]').map((_, el) => ({
    lang: $(el).attr('hreflang') || '',
    href: $(el).attr('href') ? new URL($(el).attr('href'), finalUrl).toString() : '',
    valid: Boolean($(el).attr('hreflang') && $(el).attr('href'))
  })).get();
  const schema = extractSchema($);
  const social = {
    metaTags: socialMeta,
    resolved: {
      title: socialMeta['og:title'] || socialMeta['twitter:title'] || meta.title || null,
      description: socialMeta['og:description'] || socialMeta['twitter:description'] || meta.description || null,
      image: socialMeta['og:image'] || socialMeta['twitter:image'] || null,
      url: socialMeta['og:url'] || finalUrl,
      type: socialMeta['og:type'] || 'website',
      siteName: socialMeta['og:site_name'] || extractDomain(finalUrl)
    },
    preview: {
      domain: extractDomain(finalUrl),
      title: socialMeta['og:title'] || socialMeta['twitter:title'] || meta.title || 'Not found',
      description: socialMeta['og:description'] || socialMeta['twitter:description'] || meta.description || 'Not found',
      image: socialMeta['og:image'] || socialMeta['twitter:image'] || ''
    }
  };
  const context = {
    url,
    finalUrl,
    html,
    $,
    headers,
    statusCode,
    robotsTxt,
    sitemap,
    lighthouse,
    renderedDom: null,
    links,
    images,
    headings,
    headingWarnings: headingWarnings(headings),
    meta,
    schema,
    crawlPages: [],
    resources,
    hreflang,
    text,
    wordCount: wordCount(text),
    readability: readingEase(text),
    timing,
    fetchMethod,
    debug,
    social,
    pageMetrics: {
      title: meta.title,
      metaDescription: meta.description,
      canonical: meta.canonical,
      wordCount: wordCount(text),
      internalLinks: links.filter((link) => link.internal).length,
      externalLinks: links.filter((link) => !link.internal && /^https?:/.test(link.url || '')).length,
      images: images.length,
      scripts: resources.scripts.length,
      stylesheets: resources.stylesheets.length
    }
  };
  context.pageType = detectPageType(context);
  context.applicability = detectApplicabilitySignals(context);
  return context;
}
