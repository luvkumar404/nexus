import { createFail, createInfo, createNotAvailable, createPass, createSkipped, createWarn } from '../../utils/ruleResult.js';

function titleCase(id) {
  return id.split('-').slice(1).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function result(status, message, recommendation, evidence = {}, overrides = {}) {
  const payload = {
    message,
    recommendation,
    evidence,
    impact: overrides.impact || 'medium',
    difficulty: overrides.difficulty || 'easy',
    source: overrides.source || 'html',
    severity: overrides.severity,
    confidence: overrides.confidence || 'high'
  };
  if (status === 'pass') return createPass(payload);
  if (status === 'warn') return createWarn(payload);
  if (status === 'fail') return createFail(payload);
  return createInfo(payload);
}

function unavailable(reason, source = 'html') {
  if (reason === 'performance_unavailable') {
    return createNotAvailable({
      message: 'Performance audit is unavailable.',
      recommendation: 'Run `npx playwright install chromium` in the backend project, or disable Lighthouse checks using LIGHTHOUSE_ENABLED=false.',
      evidence: { reason: 'performance_unavailable' },
      reason: 'performance_unavailable',
      source: 'lighthouse',
      severity: 'medium',
      confidence: 'high'
    });
  }
  if (reason === 'requires_crawl_mode') {
    return createNotAvailable({
      message: 'This rule requires crawl mode to compare multiple pages or crawl paths.',
      recommendation: 'Enable crawl mode to evaluate this rule across the site.',
      evidence: { reason: 'requires_crawl_mode' },
      reason: 'requires_crawl_mode',
      source,
      severity: 'info',
      confidence: 'high'
    });
  }
  return createNotAvailable({
    message: 'This rule could not be evaluated with the available audit data.',
    recommendation: 'No action is required until the required data source is available.',
    evidence: { reason },
    reason,
    source,
    severity: 'info',
    confidence: 'high'
  });
}

function skipped(reason, source = 'html', message = 'This rule is not applicable to this page.') {
  return createSkipped({
    message,
    recommendation: 'No action is required unless this page type or site setup changes.',
    evidence: { reason },
    reason,
    source,
    confidence: 'high'
  });
}

function metricValue(context, key) {
  return context.lighthouse?.metrics?.[key]?.value;
}

function lighthouseUnavailable(context) {
  return !context.lighthouse?.available;
}

function hasHeader(context, header) {
  return Boolean(context.headers?.[header] || context.headers?.[header.toLowerCase()]);
}

function hrefs(context) {
  return context.links || [];
}

function canonical(context) {
  return context.meta?.canonical || '';
}

function imageLink(img) {
  return img.url || img.src || '';
}

function imageEvidence(images, predicate, extra = {}) {
  const affected = images.filter(predicate);
  return {
    count: affected.length,
    images: affected.slice(0, 10).map((img) => ({
      url: imageLink(img),
      src: img.src || '',
      alt: img.alt ?? null,
      width: img.width || null,
      height: img.height || null,
      loading: img.loading || null
    })),
    ...extra
  };
}

function lcpMs(context) {
  const value = metricValue(context, 'largestContentfulPaint');
  const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? (String(value).includes('s') ? numeric * 1000 : numeric) : null;
}

function isStaticPerformanceRule(id) {
  return [
    'perf-dom-size',
    'perf-preconnect',
    'perf-response-time',
    'perf-page-weight'
  ].includes(id);
}

function detectCookieConsent(context) {
  const html = context.html || '';
  const $ = context.$;
  const haystack = [
    html,
    $('script[src], iframe[src]').map((_, el) => $(el).attr('src')).get().join(' '),
    $('[class], [id]').map((_, el) => `${$(el).attr('class') || ''} ${$(el).attr('id') || ''}`).get().join(' '),
    $('[data-cookie], [data-consent], [data-cmp], [data-onetrust], [data-cookieconsent]').map((_, el) => JSON.stringify(el.attribs || {})).get().join(' ')
  ].join(' ').toLowerCase();
  const providers = [
    'cookieyes', 'onetrust', 'cookiebot', 'termly', 'quantcast', 'iubenda',
    'didomi', 'osano', 'trustarc', 'complianz', 'cookiescript', 'cookie-script'
  ];
  const matchedProviders = providers.filter((provider) => haystack.includes(provider));
  const generic = /cookie consent|cookie banner|cookie preferences|manage cookies|accept cookies|reject cookies/.test(haystack);
  return { detected: matchedProviders.length > 0 || generic, providers: matchedProviders, generic };
}

function detectTrackingScripts(context) {
  const html = (context.html || '').toLowerCase();
  const srcs = context.$('script[src], iframe[src]').map((_, el) => context.$(el).attr('src') || '').get().join(' ').toLowerCase();
  const haystack = `${html} ${srcs}`;
  const trackers = [
    ['Google Analytics', /google-analytics\.com|gtag\(|ga\(|analytics\.js|gtag\/js/],
    ['Google Tag Manager', /googletagmanager\.com|gtm\.js|dataLayer/],
    ['Meta/Facebook Pixel', /connect\.facebook\.net|fbq\(|facebook pixel|meta pixel/],
    ['Hotjar', /hotjar\.com|hj\(/],
    ['Microsoft Clarity', /clarity\.ms|clarity\(/],
    ['LinkedIn Insight', /snap\.licdn\.com|linkedin insight/],
    ['TikTok Pixel', /analytics\.tiktok\.com|ttq\(/],
    ['Twitter/X Pixel', /static\.ads-twitter\.com|twq\(/],
    ['Segment', /segment\.com|analytics\.load\(/],
    ['Mixpanel', /mixpanel\.com|mixpanel\./]
  ];
  return trackers.filter(([, pattern]) => pattern.test(haystack)).map(([name]) => name);
}

export function runGenericRule(rule, context) {
  const { id, category } = rule;
  const $ = context.$;
  const text = context.text || '';
  const headings = context.headings || {};
  const links = hrefs(context);
  const images = context.images || [];
  const scripts = context.resources?.scripts || [];
  const stylesheets = context.resources?.stylesheets || [];
  const url = context.finalUrl || context.url;
  const parsedUrl = new URL(url);

  if (id === 'core-title-present') return context.meta.title ? result('pass', 'Title tag exists.', 'No action needed.', { value: context.meta.title, selector: 'title' }) : result('fail', 'Title tag is missing.', 'Add a unique HTML title tag.', { selector: 'title' }, { impact: 'high' });
  if (id === 'core-title-length') return context.meta.title.length >= 30 && context.meta.title.length <= 60 ? result('pass', 'Title length is within the recommended range.', 'No action needed.', { value: context.meta.title.length }) : result('warn', `Title length is ${context.meta.title.length} characters.`, 'Use a title between 30 and 60 characters.', { value: context.meta.title.length });
  if (id === 'core-description-present') return context.meta.description ? result('pass', 'Meta description exists.', 'No action needed.', { value: context.meta.description, selector: 'meta[name="description"]' }) : result('fail', 'Meta description is missing.', 'Add a concise meta description.', { selector: 'meta[name="description"]' }, { impact: 'high' });
  if (id === 'core-description-length') return context.meta.description.length >= 120 && context.meta.description.length <= 160 ? result('pass', 'Meta description length is within range.', 'No action needed.', { value: context.meta.description.length }) : result('warn', `Meta description length is ${context.meta.description.length} characters.`, 'Use 120 to 160 characters for the description.', { value: context.meta.description.length });
  if (id === 'core-canonical-present') return canonical(context) ? result('pass', 'Canonical tag exists.', 'No action needed.', { value: canonical(context), selector: 'link[rel="canonical"]' }) : result('fail', 'Canonical tag is missing.', 'Add a self-referencing canonical unless another target is intentional.', { selector: 'link[rel="canonical"]' });
  if (id === 'core-canonical-valid') return canonical(context) && /^https?:\/\//.test(canonical(context)) ? result('pass', 'Canonical URL is absolute and valid.', 'No action needed.', { value: canonical(context) }) : result('warn', 'Canonical URL is missing or not absolute.', 'Use an absolute HTTP or HTTPS canonical URL.', { value: canonical(context) });
  if (id === 'core-viewport-present') return context.meta.viewport ? result('pass', 'Viewport meta tag exists.', 'No action needed.', { value: context.meta.viewport }) : result('fail', 'Viewport meta tag is missing.', 'Add a responsive viewport meta tag.', { selector: 'meta[name="viewport"]' });
  if (id === 'core-favicon-present') return context.meta.favicon ? result('pass', 'Favicon link exists.', 'No action needed.', { value: context.meta.favicon }) : result('warn', 'Favicon link is missing.', 'Add a favicon link in the document head.', {});
  if (id === 'core-h1-present') return headings.h1?.length ? result('pass', 'At least one H1 heading exists.', 'No action needed.', { value: headings.h1 }) : result('fail', 'No H1 heading found.', 'Add one descriptive H1 heading.', { selector: 'h1' }, { impact: 'high' });
  if (id === 'core-h1-single') return headings.h1?.length === 1 ? result('pass', 'Exactly one H1 heading found.', 'No action needed.', { value: headings.h1.length }) : result('warn', `Found ${headings.h1?.length || 0} H1 headings.`, 'Use one primary H1 per page.', { value: headings.h1?.length || 0 });
  if (id.includes('robots-meta')) return /noindex|nofollow|nosnippet/i.test(context.meta.robots || '') ? result('warn', `Robots meta includes ${context.meta.robots}.`, 'Confirm this directive is intentional for an indexable page.', { value: context.meta.robots }) : result('pass', 'No blocking robots meta directive found.', 'No action needed.', { value: context.meta.robots || 'not set' });
  if (id === 'core-nosnippet') return /nosnippet/i.test(context.meta.robots || '') ? result('warn', 'nosnippet directive is present.', 'Remove nosnippet if search snippets should be shown.', { value: context.meta.robots }) : result('pass', 'nosnippet directive is not present.', 'No action needed.', {});
  if (id.includes('canonical-http-mismatch')) return canonical(context).startsWith('http://') && url.startsWith('https://') ? result('fail', 'Canonical points to HTTP from an HTTPS page.', 'Update canonical to HTTPS.', { canonical: canonical(context) }) : result('pass', 'No canonical HTTP mismatch detected.', 'No action needed.', { canonical: canonical(context) });
  if (id.includes('canonical-conflicting')) return context.meta.canonicals?.length > 1 ? result('fail', 'Multiple canonical tags found.', 'Keep one canonical tag.', { value: context.meta.canonicals }) : result('pass', 'No conflicting canonical tags found.', 'No action needed.', { count: context.meta.canonicals?.length || 0 });
  if (id.includes('canonical-to-homepage')) return canonical(context) && new URL(canonical(context), url).pathname === '/' && parsedUrl.pathname !== '/' ? result('warn', 'Canonical points to the homepage.', 'Use a page-specific canonical URL.', { canonical: canonical(context) }) : result('pass', 'Canonical does not incorrectly point to homepage.', 'No action needed.', { canonical: canonical(context) });
  if (id.includes('canonical-loop')) return unavailable('requires_crawl_mode', 'crawler');
  if (id.includes('canonical-to-noindex')) return /noindex/i.test(context.meta.robots || '') && canonical(context) ? result('warn', 'Canonical exists on a noindex page.', 'Confirm canonical and noindex directives do not conflict.', { canonical: canonical(context), robots: context.meta.robots }) : unavailable('requires_external_validation', 'crawler');
  if (id === 'core-canonical-header') return hasHeader(context, 'link') ? result('info', 'HTTP Link header is present.', 'Confirm header canonicals do not conflict with HTML canonicals.', { value: context.headers.link }, { source: 'headers' }) : result('info', 'No canonical HTTP Link header found.', 'No action needed.', {}, { source: 'headers' });
  if (id === 'core-title-unique' || id === 'content-duplicate-description' || id === 'content-exact-duplicate-content' || id === 'content-near-duplicate-content') return context.crawlPages?.length > 1 ? result('pass', 'Crawl comparison completed for duplicate checks.', 'No action needed.', { crawlPages: context.crawlPages.length }, { source: 'crawler' }) : unavailable('requires_crawl_mode', 'crawler');

  if (category === 'performance') {
    if (lighthouseUnavailable(context) && id.startsWith('perf-') && !isStaticPerformanceRule(id)) {
      return createNotAvailable({
        message: context.lighthouse?.message || 'Performance audit is unavailable.',
        recommendation: context.lighthouse?.recommendation || 'Run `npx playwright install chromium` in the backend project, or disable Lighthouse checks using LIGHTHOUSE_ENABLED=false.',
        evidence: context.lighthouse?.evidence || { reason: 'performance_unavailable' },
        developerDetails: context.lighthouse?.developerDetails,
        reason: context.lighthouse?.evidence?.reason || context.lighthouse?.code || 'performance_unavailable',
        source: 'lighthouse',
        severity: 'medium',
        confidence: 'high'
      });
    }
    const perfScore = context.lighthouse?.scores?.performance;
    if (id === 'perf-lcp') { const value = lcpMs(context); return value == null ? unavailable('performance_unavailable', 'lighthouse') : value <= 2500 ? result('pass', 'LCP is good.', 'No action needed.', { value }, { source: 'lighthouse' }) : value <= 4000 ? result('warn', 'LCP needs improvement.', 'Improve server response, image loading, and render path.', { value }, { source: 'lighthouse' }) : result('fail', 'LCP is poor.', 'Prioritize LCP element optimization.', { value }, { source: 'lighthouse', impact: 'high' }); }
    if (id === 'perf-cls') { const value = Number(metricValue(context, 'cumulativeLayoutShift') || 0); return value <= 0.1 ? result('pass', 'CLS is good.', 'No action needed.', { value }, { source: 'lighthouse' }) : value <= 0.25 ? result('warn', 'CLS needs improvement.', 'Reserve media/ad dimensions and avoid layout shifts.', { value }, { source: 'lighthouse' }) : result('fail', 'CLS is poor.', 'Fix unstable layout elements.', { value }, { source: 'lighthouse' }); }
    if (id === 'perf-fcp') return perfScore >= 0.9 ? result('pass', 'FCP performance is strong.', 'No action needed.', { score: perfScore }, { source: 'lighthouse' }) : result('warn', 'FCP could be improved.', 'Reduce render-blocking resources and server delay.', { score: perfScore }, { source: 'lighthouse' });
    if (id.includes('dom-size')) return $('*').length < 1500 ? result('pass', 'DOM size is reasonable.', 'No action needed.', { value: $('*').length }) : result('warn', 'DOM size is large.', 'Reduce unnecessary markup and nested components.', { value: $('*').length });
    if (id.includes('preconnect')) return $('link[rel="preconnect"]').length ? result('pass', 'Preconnect hints found.', 'No action needed.', { count: $('link[rel="preconnect"]').length }) : result('info', 'No preconnect hints found.', 'Add preconnect for critical third-party origins when useful.', {});
    if (id.includes('render-blocking')) return context.lighthouse?.opportunities?.renderBlockingResources?.score === 1 ? result('pass', 'No significant render-blocking issue reported.', 'No action needed.', context.lighthouse.opportunities.renderBlockingResources, { source: 'lighthouse' }) : result('warn', 'Render-blocking resources may delay rendering.', 'Inline critical CSS and defer non-critical scripts.', context.lighthouse?.opportunities?.renderBlockingResources || {}, { source: 'lighthouse' });
    if (id.includes('response-time') || id.includes('ttfb')) return context.timing?.responseMs < 800 ? result('pass', 'Server response time is acceptable.', 'No action needed.', { value: context.timing?.responseMs }, { source: 'headers' }) : result('warn', 'Server response time is high.', 'Optimize hosting, caching, and backend response paths.', { value: context.timing?.responseMs }, { source: 'headers' });
    if (id.includes('page-weight')) return Number(context.headers['content-length'] || 0) < 1500000 ? result('pass', 'HTML response size is acceptable.', 'No action needed.', { value: context.headers['content-length'] || 'not provided' }, { source: 'headers' }) : result('warn', 'Page response appears heavy.', 'Compress and reduce transferred bytes.', { value: context.headers['content-length'] }, { source: 'headers' });
    return result('info', 'Performance rule recorded with available metrics.', 'Review Lighthouse opportunities for this item.', { lighthouseAvailable: context.lighthouse?.available }, { source: 'lighthouse' });
  }

  if (category === 'links') {
    if (id.includes('internal-links-present')) return links.some((link) => link.internal) ? result('pass', 'Internal links are present.', 'No action needed.', { count: links.filter((l) => l.internal).length }) : result('warn', 'No internal links found.', 'Add contextual internal links to related pages.', { count: 0 });
    if (id.includes('external-links')) return result('info', 'External link count recorded.', 'Review external links for quality and relevance.', { count: links.filter((l) => !l.internal && /^https?:/.test(l.url || '')).length });
    if (id.includes('nofollow')) return result('info', 'nofollow usage recorded.', 'Use sponsored/ugc/nofollow where appropriate.', { count: links.filter((l) => /nofollow/i.test(l.rel)).length });
    if (id.includes('anchor-text')) return links.some((l) => !l.text && /^https?:/.test(l.url || '')) ? result('warn', 'Some links have empty anchor text.', 'Add descriptive anchor text.', { count: links.filter((l) => !l.text).length }) : result('pass', 'Anchor text is present for links.', 'No action needed.', {});
    if (id.includes('invalid-href')) return links.some((l) => !l.url && !/^#|mailto:|tel:/.test(l.raw)) ? result('fail', 'Invalid href values found.', 'Fix malformed href attributes.', { values: links.filter((l) => !l.url).slice(0, 10).map((l) => l.raw) }) : result('pass', 'No invalid href values detected.', 'No action needed.', {});
    if (id.includes('localhost-links')) return links.some((l) => /localhost|127\.0\.0\.1/.test(l.raw)) ? result('fail', 'Localhost links found.', 'Replace development links with production URLs.', { values: links.filter((l) => /localhost|127\.0\.0\.1/.test(l.raw)).map((l) => l.raw) }) : result('pass', 'No localhost links found.', 'No action needed.', {});
    if (id.includes('local-file-links')) return links.some((l) => /^file:/i.test(l.raw)) ? result('fail', 'Local file links found.', 'Remove file:// links from production HTML.', { values: links.filter((l) => /^file:/i.test(l.raw)).map((l) => l.raw) }) : result('pass', 'No file:// links found.', 'No action needed.', {});
    if (id.includes('whitespace-href')) return links.some((l) => /\s/.test(l.raw.trim())) ? result('warn', 'Some href values contain whitespace.', 'Encode or remove whitespace in URLs.', { values: links.filter((l) => /\s/.test(l.raw.trim())).map((l) => l.raw) }) : result('pass', 'No whitespace href values found.', 'No action needed.', {});
    if (id.includes('excessive-total-links')) return links.length > 150 ? result('warn', 'Page has a high number of links.', 'Keep links purposeful and navigable.', { count: links.length }) : result('pass', 'Total link count is reasonable.', 'No action needed.', { count: links.length });
    if (id.includes('broken') || id.includes('redirect') || id.includes('orphan') || id.includes('dead-end') || id.includes('depth')) return context.crawlPages?.length > 1 ? result('info', 'Crawl-derived link rule evaluated with crawl context.', 'Review crawl data for affected URLs.', { crawlPages: context.crawlPages.length }, { source: 'crawler' }) : unavailable('requires_crawl_mode', 'crawler');
  }

  if (category === 'images') {
    if (id.includes('alt-present')) return images.some((img) => img.alt === undefined) ? result('fail', 'Images missing alt attributes.', 'Add alt text for informative images and empty alt text for decorative images.', imageEvidence(images, (img) => img.alt === undefined)) : result('pass', 'All images include alt attributes.', 'No action needed.', { count: images.length });
    if (id.includes('alt-quality')) return images.some((img) => /image|photo|picture/i.test(img.alt || '')) ? result('warn', 'Some alt text appears generic.', 'Write descriptive alt text tied to the image purpose.', imageEvidence(images, (img) => /image|photo|picture/i.test(img.alt || ''))) : result('pass', 'No obviously generic alt text found.', 'No action needed.', {});
    if (id.includes('dimensions')) return images.some((img) => !img.width || !img.height) ? result('warn', 'Some images lack width or height attributes.', 'Set dimensions to reduce layout shift.', imageEvidence(images, (img) => !img.width || !img.height)) : result('pass', 'Image dimensions are present.', 'No action needed.', {});
    if (id.includes('lazy-loading')) return images.some((img) => img.loading !== 'lazy') ? result('warn', 'Some images are not lazy loaded.', 'Lazy-load below-the-fold images.', imageEvidence(images, (img) => img.loading !== 'lazy')) : result('pass', 'Images use lazy loading.', 'No action needed.', {});
    if (id.includes('modern-format')) return images.some((img) => !/\.(webp|avif|svg)(\?|$)/i.test(imageLink(img))) ? result('warn', 'Some images may not use modern formats.', 'Serve WebP or AVIF where appropriate.', imageEvidence(images, (img) => !/\.(webp|avif|svg)(\?|$)/i.test(imageLink(img)))) : result('pass', 'Images appear to use modern formats.', 'No action needed.', {});
    if (id.includes('responsive-srcset')) return images.some((img) => !img.srcset) ? result('warn', 'Some images lack srcset.', 'Use responsive image srcset for varying viewport sizes.', imageEvidence(images, (img) => !img.srcset)) : result('pass', 'Images include responsive srcset attributes.', 'No action needed.', {});
    if (id.includes('broken') || id.includes('size')) return unavailable('requires_crawl_mode', 'crawler');
  }

  if (category === 'security') {
    if (id === 'security-https') return url.startsWith('https://') ? result('pass', 'Page uses HTTPS.', 'No action needed.', { value: url }, { source: 'headers' }) : result('fail', 'Page does not use HTTPS.', 'Serve the site over HTTPS.', { value: url }, { source: 'headers', impact: 'high' });
    if (id.includes('hsts')) return hasHeader(context, 'strict-transport-security') ? result('pass', 'HSTS header is present.', 'No action needed.', { value: context.headers['strict-transport-security'] }, { source: 'headers' }) : result('warn', 'HSTS header is missing.', 'Add Strict-Transport-Security after HTTPS is stable.', {}, { source: 'headers' });
    if (id.includes('csp')) return hasHeader(context, 'content-security-policy') ? result('pass', 'Content-Security-Policy header is present.', 'No action needed.', { value: context.headers['content-security-policy'] }, { source: 'headers' }) : result('warn', 'CSP header is missing.', 'Add a Content-Security-Policy to reduce injection risk.', {}, { source: 'headers' });
    if (id.includes('x-frame')) return hasHeader(context, 'x-frame-options') ? result('pass', 'X-Frame-Options header is present.', 'No action needed.', { value: context.headers['x-frame-options'] }, { source: 'headers' }) : result('warn', 'X-Frame-Options header is missing.', 'Add X-Frame-Options or frame-ancestors CSP.', {}, { source: 'headers' });
    if (id.includes('x-content')) return hasHeader(context, 'x-content-type-options') ? result('pass', 'X-Content-Type-Options header is present.', 'No action needed.', { value: context.headers['x-content-type-options'] }, { source: 'headers' }) : result('warn', 'X-Content-Type-Options header is missing.', 'Set X-Content-Type-Options: nosniff.', {}, { source: 'headers' });
    if (id.includes('mixed-content') || id.includes('protocol-relative')) return /http:\/\//i.test(context.html) && url.startsWith('https://') ? result('fail', 'Insecure HTTP resources are referenced from HTTPS.', 'Use HTTPS URLs for all resources.', {}, { source: 'html' }) : result('pass', 'No obvious insecure resource references found.', 'No action needed.', {});
    if (id.includes('leaked-secrets')) return /(api[_-]?key|secret|token)\s*[:=]\s*['"][A-Za-z0-9_-]{16,}/i.test(context.html) ? result('fail', 'Potential secret-like value found in HTML.', 'Remove secrets from client-visible code.', {}, { impact: 'high' }) : result('pass', 'No obvious secret patterns found in HTML.', 'No action needed.', {});
    if (id.includes('ssl') || id.includes('tls')) return createNotAvailable({
      message: 'SSL certificate and TLS protocol checks are not available in this audit context.',
      recommendation: 'Use a dedicated TLS scanner or enable server-side certificate inspection for this rule.',
      evidence: { reason: 'external_tls_check_required' },
      reason: 'external_tls_check_required',
      source: 'headers',
      confidence: 'high'
    });
  }

  if (category === 'technical-seo') {
    if (id.includes('robots-txt-exists')) return context.robotsTxt?.exists ? result('pass', 'robots.txt exists.', 'No action needed.', { url: context.robotsTxt.url }, { source: 'robots' }) : result('warn', 'robots.txt was not found.', 'Add robots.txt at the site root.', {}, { source: 'robots' });
    if (id.includes('sitemap-exists')) return context.sitemap?.exists ? result('pass', 'sitemap.xml exists.', 'No action needed.', { url: context.sitemap.url }, { source: 'sitemap' }) : result('warn', 'sitemap.xml was not found.', 'Publish an XML sitemap.', {}, { source: 'sitemap' });
    if (id.includes('sitemap-valid')) return context.sitemap?.parseError ? result('fail', 'Sitemap XML could not be parsed.', 'Fix sitemap XML syntax.', { error: context.sitemap.parseError }, { source: 'sitemap' }) : result('pass', 'No sitemap parse errors detected.', 'No action needed.', {}, { source: 'sitemap' });
    if (id.includes('content-type')) return /text\/html/i.test(context.headers['content-type'] || '') ? result('pass', 'Content-Type is HTML.', 'No action needed.', { value: context.headers['content-type'] }, { source: 'headers' }) : result('warn', 'Content-Type is missing or not text/html.', 'Serve HTML pages with text/html content type.', { value: context.headers['content-type'] }, { source: 'headers' });
  }

  if (category === 'structured-data') {
    if (id.includes('schema-present')) return context.schema.types.length || context.schema.microdataTypes.length ? result('pass', 'Structured data is present.', 'No action needed.', { types: context.schema.types }) : result('warn', 'No structured data detected.', 'Add relevant Schema.org JSON-LD.', {});
    if (id.includes('schema-valid')) return context.schema.errors.length ? result('fail', 'JSON-LD parse errors found.', 'Fix invalid JSON-LD syntax.', { errors: context.schema.errors }) : result('pass', 'JSON-LD parses successfully.', 'No action needed.', {});
    if (id.includes('type-exists')) return context.schema.types.length ? result('pass', 'Schema @type values found.', 'No action needed.', { types: context.schema.types }) : result('warn', 'No Schema.org @type found.', 'Add @type to JSON-LD entities.', {});
    if (id.includes('product') && !context.applicability?.hasProductSignals) return skipped('requires_page_type_product', 'html', 'Product schema is not applicable because this page does not appear to be a product page.');
    if (id.includes('article') && !context.applicability?.hasArticleSignals) return skipped('requires_page_type_article', 'html', 'Article schema is not applicable because this page does not appear to be an article.');
    if (id.includes('faq') && !context.applicability?.hasFaq) return skipped('requires_faq_content', 'html', 'FAQ schema is not applicable because FAQ content was not detected.');
    if (id.includes('localbusiness') && !context.applicability?.hasLocalSignals) return skipped('requires_page_type_local_business', 'html', 'LocalBusiness schema is not applicable because local business signals were not detected.');
    if (id.includes('review') && !context.applicability?.hasReviews) return skipped('requires_reviews', 'html', 'Review schema is not applicable because reviews or ratings were not detected.');
    if (id.includes('videoobject') && !context.applicability?.hasVideo) return skipped('requires_video', 'html', 'VideoObject schema is not applicable because video content was not detected.');
    if (id.includes('breadcrumb') && new URL(url).pathname === '/') return skipped('not_applicable_homepage', 'html', 'Breadcrumb schema is optional on the homepage.');
    const wanted = id.split('-').slice(1).join('').toLowerCase();
    return context.schema.types.map((x) => String(x).toLowerCase()).some((x) => wanted.includes(x) || x.includes(wanted)) ? result('pass', 'Matching schema type detected.', 'No action needed.', { types: context.schema.types }) : result('info', 'Schema type was not detected on this page.', 'Add this schema type only when it matches the page purpose.', { types: context.schema.types });
  }

  if (category === 'content') {
    if (id.includes('word-count')) return context.wordCount >= 300 ? result('pass', 'Word count is adequate.', 'No action needed.', { value: context.wordCount }) : result('warn', 'Page may have thin content.', 'Expand the page with useful original content.', { value: context.wordCount });
    if (id.includes('reading-level')) return result('info', 'Readability score recorded.', 'Use clear language for the target audience.', { value: context.readability });
    if (id.includes('heading-hierarchy')) return context.headingWarnings?.length ? result('warn', 'Heading hierarchy warnings found.', 'Use headings in a logical nested order.', { warnings: context.headingWarnings }) : result('pass', 'Heading hierarchy looks consistent.', 'No action needed.', {});
    if (id.includes('heading-uniqueness')) return context.headingWarnings?.some((w) => /Duplicate/.test(w)) ? result('warn', 'Duplicate headings detected.', 'Make headings unique where possible.', { warnings: context.headingWarnings }) : result('pass', 'No duplicate heading warning detected.', 'No action needed.', {});
    if (id.includes('title-same-as-h1')) return context.meta.title && headings.h1?.[0] && context.meta.title.trim() === headings.h1[0].trim() ? result('warn', 'Title is identical to H1.', 'Differentiate title and H1 while keeping them aligned.', { title: context.meta.title, h1: headings.h1[0] }) : result('pass', 'Title and H1 are not exact duplicates.', 'No action needed.', {});
  }

  if (category === 'social') {
    const key = id.replace('social-', '').replace('twitter-card', 'twitter:card').replace('og-', 'og:');
    if (id.includes('og-url-canonical-match')) return context.social.metaTags['og:url'] && canonical(context) && context.social.metaTags['og:url'] !== canonical(context) ? result('warn', 'og:url differs from canonical.', 'Align og:url with canonical when appropriate.', { ogUrl: context.social.metaTags['og:url'], canonical: canonical(context) }) : result('pass', 'og:url does not conflict with canonical.', 'No action needed.', {});
    if (id.includes('og-image-dimensions')) return createNotAvailable({
      message: 'Open Graph image dimensions could not be verified from HTML alone.',
      recommendation: 'Fetch the image or provide width/height metadata to validate social image dimensions.',
      evidence: { image: context.social.metaTags['og:image'] || 'not found', reason: 'requires_external_validation' },
      reason: 'requires_external_validation',
      source: 'html',
      confidence: 'high'
    });
    if (id.includes('social-share-buttons') || id.includes('social-profile-links')) return result('info', 'Social presence rule is informational.', 'Add social links/buttons when useful for the business.', {});
    if (key === 'twitter:title') return context.social.metaTags[key] || context.social.metaTags['og:title'] || context.meta.title ? result('pass', 'Twitter title has an explicit value or a reliable fallback.', 'No action needed.', { value: context.social.metaTags[key] || context.social.metaTags['og:title'] || context.meta.title }) : result('warn', 'Twitter title is missing and no fallback title was found.', 'Add twitter:title or og:title.', { key });
    if (key === 'twitter:description') return context.social.metaTags[key] || context.social.metaTags['og:description'] || context.meta.description ? result('pass', 'Twitter description has an explicit value or a reliable fallback.', 'No action needed.', { value: context.social.metaTags[key] || context.social.metaTags['og:description'] || context.meta.description }) : result('warn', 'Twitter description is missing and no fallback description was found.', 'Add twitter:description or og:description.', { key });
    if (key === 'twitter:image') return context.social.metaTags[key] || context.social.metaTags['og:image'] ? result('pass', 'Twitter image has an explicit value or Open Graph fallback.', 'No action needed.', { value: context.social.metaTags[key] || context.social.metaTags['og:image'] }) : result('warn', 'Twitter image is missing and no Open Graph fallback was found.', 'Add twitter:image or og:image.', { key });
    return context.social.metaTags[key] ? result('pass', `${key} is present.`, 'No action needed.', { value: context.social.metaTags[key] }) : result('warn', `${key} is missing.`, `Add ${key} for better social previews.`, { key });
  }

  if (category === 'mobile' || category === 'accessibility') {
    if (lighthouseUnavailable(context) && /(contrast|touch|font-size)/.test(id)) return createNotAvailable({
      message: context.lighthouse?.message || 'Lighthouse-powered mobile/accessibility data is unavailable.',
      recommendation: context.lighthouse?.recommendation || 'Enable Lighthouse and install browser dependencies to evaluate this rule.',
      evidence: context.lighthouse?.evidence || { reason: 'performance_unavailable' },
      developerDetails: context.lighthouse?.developerDetails,
      reason: context.lighthouse?.evidence?.reason || context.lighthouse?.code || 'performance_unavailable',
      source: 'lighthouse',
      severity: 'info',
      confidence: 'high'
    });
    if (category === 'mobile' && id.includes('viewport-width')) return /width\s*=\s*device-width/i.test(context.meta.viewport || '') ? result('pass', 'Viewport uses width=device-width.', 'No action needed.', { value: context.meta.viewport }) : result('fail', 'Viewport does not use width=device-width.', 'Use width=device-width for responsive mobile rendering.', { value: context.meta.viewport });
    if (category === 'mobile' && (id.includes('horizontal-scroll') || id.includes('interstitials'))) return context.renderedDom ? result('info', 'Rendered mobile check needs visual validation.', 'Review rendered mobile output.', {}, { source: 'rendered-dom' }) : createNotAvailable({
      message: 'This mobile rule requires rendered browser data.',
      recommendation: 'Enable Lighthouse or rendered DOM checks to evaluate this rule.',
      evidence: { reason: 'requires_rendered_dom' },
      reason: 'requires_rendered_dom',
      source: 'rendered-dom',
      confidence: 'high'
    });
    if (id.includes('multiple-viewport')) return $('meta[name="viewport"]').length > 1 ? result('warn', 'Multiple viewport tags found.', 'Keep one viewport meta tag.', { count: $('meta[name="viewport"]').length }) : result('pass', 'Only one viewport tag found.', 'No action needed.', { count: $('meta[name="viewport"]').length });
    if (id.includes('zoom-disabled')) return /user-scalable\s*=\s*no/i.test(context.meta.viewport || '') ? result('fail', 'Viewport disables zoom.', 'Allow users to zoom on mobile.', { value: context.meta.viewport }) : result('pass', 'Viewport does not disable zoom.', 'No action needed.', { value: context.meta.viewport });
    if (id.includes('form-labels')) return $('input, textarea, select').filter((_, el) => !$(el).attr('aria-label') && !$(`label[for="${$(el).attr('id')}"]`).length).length ? result('warn', 'Some form controls may lack labels.', 'Associate labels or aria-labels with controls.', {}) : result('pass', 'Form controls appear labeled.', 'No action needed.', {});
    if (id.includes('link-text')) return links.some((l) => /^click here|read more$/i.test(l.text)) ? result('warn', 'Generic link text found.', 'Use descriptive link text.', {}) : result('pass', 'No generic link text detected.', 'No action needed.', {});
  }

  if (category === 'internationalization') {
    if (id.includes('html-lang')) return context.meta.lang ? result('pass', 'HTML lang attribute exists.', 'No action needed.', { value: context.meta.lang }) : result('fail', 'HTML lang attribute is missing.', 'Set a valid lang attribute on html.', {});
    if (id.includes('hreflang-tags')) {
      if (context.hreflang.length) return result('pass', 'hreflang tags found.', 'No action needed.', { count: context.hreflang.length });
      return context.applicability?.isMultilingual ? result('warn', 'Multilingual signals were detected but no hreflang tags were found.', 'Add hreflang annotations for localized alternates.', {}) : skipped('requires_multilingual_site', 'html', 'hreflang is not applicable because this appears to be a single-language page.');
    }
    if (id.includes('hreflang')) return context.hreflang.length ? result('info', 'hreflang rule recorded from page tags.', 'Validate alternate URLs during a broader crawl.', { values: context.hreflang }, { source: 'html' }) : skipped('requires_hreflang_tags', 'html', 'This hreflang validation rule only applies when hreflang tags exist.');
  }

  if (category === 'html-validation') {
    if (id.includes('missing-doctype')) return /^<!doctype html>/i.test(context.html.trim()) ? result('pass', 'HTML doctype exists.', 'No action needed.', {}) : result('warn', 'HTML doctype is missing.', 'Add <!doctype html>.', {});
    if (id.includes('missing-charset')) return $('meta[charset]').length || /charset=/i.test(context.headers['content-type'] || '') ? result('pass', 'Charset declaration found.', 'No action needed.', {}) : result('warn', 'Charset declaration missing.', 'Add UTF-8 charset metadata.', {});
    if (id.includes('multiple-titles')) return $('title').length > 1 ? result('fail', 'Multiple title tags found.', 'Keep one title tag in the head.', { count: $('title').length }) : result('pass', 'Single title tag found.', 'No action needed.', { count: $('title').length });
    if (id.includes('multiple-descriptions')) return $('meta[name="description"]').length > 1 ? result('warn', 'Multiple meta descriptions found.', 'Keep one meta description.', { count: $('meta[name="description"]').length }) : result('pass', 'No duplicate meta description tags found.', 'No action needed.', { count: $('meta[name="description"]').length });
    if (id.includes('lorem-ipsum')) return /lorem ipsum/i.test(text) ? result('fail', 'Placeholder lorem ipsum text found.', 'Replace placeholder content with final copy.', {}) : result('pass', 'No lorem ipsum text found.', 'No action needed.', {});
  }

  if (category === 'url-structure') {
    if (id.includes('uppercase')) return /[A-Z]/.test(parsedUrl.pathname) ? result('warn', 'URL path contains uppercase letters.', 'Use lowercase URL paths.', { value: parsedUrl.pathname }) : result('pass', 'URL path is lowercase.', 'No action needed.', { value: parsedUrl.pathname });
    if (id.includes('underscores')) return parsedUrl.pathname.includes('_') ? result('warn', 'URL contains underscores.', 'Use hyphens instead of underscores.', { value: parsedUrl.pathname }) : result('pass', 'No underscores in URL path.', 'No action needed.', {});
    if (id.includes('spaces')) return /%20|\s/.test(parsedUrl.href) ? result('fail', 'URL contains spaces.', 'Use clean encoded slugs without spaces.', { value: parsedUrl.href }) : result('pass', 'No spaces in URL.', 'No action needed.', {});
    if (id.includes('length')) return parsedUrl.href.length > 115 ? result('warn', 'URL is long.', 'Shorten the URL slug and parameters.', { value: parsedUrl.href.length }) : result('pass', 'URL length is reasonable.', 'No action needed.', { value: parsedUrl.href.length });
    if (id.includes('tracking-params')) return /utm_|fbclid|gclid/i.test(parsedUrl.search) ? result('warn', 'Tracking parameters are present.', 'Canonicalize clean URLs and avoid indexing tracked variants.', { value: parsedUrl.search }) : result('pass', 'No tracking parameters in audited URL.', 'No action needed.', {});
    if (id.includes('session-ids')) return /sid=|session/i.test(parsedUrl.search) ? result('fail', 'Session identifier appears in URL.', 'Do not expose session IDs in indexable URLs.', { value: parsedUrl.search }) : result('pass', 'No session ID parameter detected.', 'No action needed.', {});
  }

  if (category === 'eeat' || category === 'ai-geo-readiness' || category === 'legal-compliance') {
    if (id.includes('cookie-consent')) {
      const consent = detectCookieConsent(context);
      const trackers = detectTrackingScripts(context);
      if (consent.detected) return result('pass', 'Cookie consent mechanism detected.', 'No action needed.', { providers: consent.providers, genericSignal: consent.generic, trackingScripts: trackers }, { source: 'html' });
      if (!trackers.length) return result('pass', 'No tracking scripts were detected, so cookie consent is not required by this audit.', 'No action needed.', { trackingScripts: [] }, { source: 'html' });
      return result('warn', 'Tracking scripts were detected but no cookie consent mechanism was found.', 'Add a cookie consent mechanism before loading non-essential tracking scripts.', { trackingScripts: trackers }, { source: 'html', impact: 'medium', difficulty: 'medium' });
    }
    if (category === 'ai-geo-readiness' && id.includes('semantic-html')) return $('main, article, section, header, nav, footer').length ? result('pass', 'Semantic HTML landmarks or sections are present.', 'No action needed.', { count: $('main, article, section, header, nav, footer').length }) : result('warn', 'Semantic HTML structure is limited.', 'Use semantic elements such as main, article, section, nav, header, and footer.', {});
    if (category === 'ai-geo-readiness' && id.includes('content-structure')) return Object.values(headings).flat().length && context.wordCount > 100 ? result('pass', 'Content has headings and readable body text.', 'No action needed.', { headings: Object.values(headings).flat().length, wordCount: context.wordCount }) : result('warn', 'Content structure is limited.', 'Use descriptive headings and enough body copy to clarify the page topic.', { headings: Object.values(headings).flat().length, wordCount: context.wordCount });
    if (category === 'ai-geo-readiness' && id.includes('schema-drift')) return context.schema.types.length ? result('info', 'Schema types are available for AI/GEO review.', 'Ensure schema matches the visible page content.', { types: context.schema.types }) : result('info', 'No schema types available for schema drift review.', 'Add schema only when it accurately describes visible content.', {});
    if (id.includes('affiliate-disclosure') && !context.applicability?.hasAffiliate) return skipped('requires_affiliate_content', 'html', 'Affiliate disclosure is not applicable because affiliate content was not detected.');
    if ((id.includes('author-byline') || id.includes('author-expertise')) && !context.applicability?.hasArticleSignals && !context.applicability?.isYMYL) return skipped('requires_page_type_article', 'html', 'Author checks are not applicable because this page does not appear to be article or YMYL content.');
    if ((id.includes('disclaimers') || id.includes('ymyl')) && !context.applicability?.isYMYL) return id.includes('ymyl') ? result('info', 'No strong YMYL signals detected.', 'No action needed unless this page covers sensitive health, finance, legal, or safety topics.', {}) : skipped('requires_ymyl', 'html', 'Disclaimer checks are not applicable because YMYL content was not detected.');
    if (id.includes('physical-address') && !context.applicability?.hasLocalSignals && !context.applicability?.isYMYL) return skipped('requires_page_type_local_business', 'html', 'Physical address checks are not applicable unless local business or YMYL signals exist.');
    if (id.includes('editorial-policy') && context.pageType !== 'article') return skipped('requires_publisher_or_blog', 'html', 'Editorial policy checks are not applicable unless this is a publisher, blog, or news page.');
    if (category === 'ai-geo-readiness' && id.includes('bot-access')) return context.robotsTxt?.exists ? result('info', 'robots.txt is available for AI bot access review.', 'Confirm AI bot access aligns with your content strategy.', { robotsUrl: context.robotsTxt.url }, { source: 'robots' }) : createNotAvailable({
      message: 'AI bot access could not be evaluated because robots.txt was unavailable.',
      recommendation: 'Publish robots.txt or retry when it is reachable.',
      evidence: { reason: 'robots_unavailable' },
      reason: 'robots_unavailable',
      source: 'robots'
    });
    if (category === 'ai-geo-readiness' && id.includes('llms')) return result('info', 'llms.txt is informational and was not fetched in this run.', 'Consider adding llms.txt if it fits your AI discovery strategy.', {});
    if (id.includes('privacy-policy')) return /privacy/i.test(text) || links.some((l) => /privacy/i.test(l.text + l.raw)) ? result('pass', 'Privacy policy signal found.', 'No action needed.', {}) : result('warn', 'Privacy policy signal not found.', 'Add a visible privacy policy link.', {});
    if (id.includes('terms')) return /terms/i.test(text) || links.some((l) => /terms/i.test(l.text + l.raw)) ? result('pass', 'Terms signal found.', 'No action needed.', {}) : result('warn', 'Terms of service signal not found.', 'Add terms where appropriate.', {});
    if (id.includes('contact')) return /contact/i.test(text) || links.some((l) => /contact/i.test(l.text + l.raw)) ? result('pass', 'Contact signal found.', 'No action needed.', {}) : result('warn', 'Contact information signal not found.', 'Add a contact page or contact details.', {});
    if (id.includes('about')) return /about/i.test(text) || links.some((l) => /about/i.test(l.text + l.raw)) ? result('pass', 'About page signal found.', 'No action needed.', {}) : result('warn', 'About page signal not found.', 'Add an About page for trust.', {});
  }

  if (category === 'redirects') {
    if (id.includes('meta-refresh')) return $('meta[http-equiv="refresh"]').length ? result('warn', 'Meta refresh redirect detected.', 'Use server-side 301/302 redirects instead.', {}) : result('pass', 'No meta refresh redirect found.', 'No action needed.', {});
    if (id.includes('javascript-redirect')) return /location\.(href|replace)|window\.location/i.test(context.html) ? result('warn', 'JavaScript redirect pattern found.', 'Prefer server-side redirects for SEO-critical redirects.', {}) : result('pass', 'No obvious JavaScript redirect found.', 'No action needed.', {});
    return unavailable('requires_crawl_mode', 'crawler');
  }

  if (category === 'crawlability') {
    const sitemapUrls = context.sitemapUrls || context.sitemap?.urls || context.sitemap?.validUrls || [];
    const hasSitemap = Boolean(context.sitemap?.exists);
    const hasRobots = Boolean(context.robotsTxt?.exists);
    const crawlPages = context.crawlPages || [];
    const requiresFullCrawl = ['orphan', 'pagination-sequence', 'pagination-loop', 'canonical-redirect', 'canonical-chain'].some((token) => id.includes(token));

    if (id.includes('schema-noindex-conflict')) {
      const hasSchema = (context.schema?.types || []).length > 0 || (context.schema?.microdataTypes || []).length > 0;
      const noindex = /noindex/i.test(context.meta?.robots || '');
      return hasSchema && noindex ? result('warn', 'Structured data is present on a noindex page.', 'Confirm this page should be noindex or remove schema from non-indexable pages.', { schemaTypes: context.schema.types, robots: context.meta.robots }, { source: 'html' }) : result('pass', 'No schema and noindex conflict detected on the audited page.', 'No action needed.', { schemaTypes: context.schema?.types || [], robots: context.meta?.robots || 'not set' }, { source: 'html' });
    }
    if (id.includes('sitemap-domain')) {
      if (!hasSitemap) return unavailable('sitemap_unavailable', 'sitemap');
      const bad = sitemapUrls.filter((item) => {
        try { return new URL(item).origin !== new URL(context.finalUrl || context.url).origin; } catch { return true; }
      });
      return bad.length ? result('warn', 'Sitemap contains URLs from another domain or invalid URLs.', 'Keep sitemap URLs on the audited domain.', { count: bad.length, examples: bad.slice(0, 5) }, { source: 'sitemap' }) : result('pass', 'Sitemap URLs match the audited domain.', 'No action needed.', { count: sitemapUrls.length }, { source: 'sitemap' });
    }
    if (id.includes('sitemap-url-limit')) {
      if (!hasSitemap) return unavailable('sitemap_unavailable', 'sitemap');
      return sitemapUrls.length > 50000 ? result('fail', 'Sitemap exceeds the 50,000 URL limit.', 'Split large sitemaps into sitemap index files.', { count: sitemapUrls.length }, { source: 'sitemap' }) : result('pass', 'Sitemap URL count is within limits.', 'No action needed.', { count: sitemapUrls.length }, { source: 'sitemap' });
    }
    if (id.includes('sitemap-size-limit')) {
      if (!hasSitemap) return unavailable('sitemap_unavailable', 'sitemap');
      const bytes = context.sitemap?.contentLength || context.sitemap?.content?.length || 0;
      return bytes > 50 * 1024 * 1024 ? result('fail', 'Sitemap exceeds the 50MB size limit.', 'Compress or split the sitemap.', { bytes }, { source: 'sitemap' }) : result('pass', 'Sitemap size appears within limits.', 'No action needed.', { bytes: bytes || 'not provided' }, { source: 'sitemap' });
    }
    if (id.includes('sitemap-duplicate-urls')) {
      if (!hasSitemap) return unavailable('sitemap_unavailable', 'sitemap');
      const unique = new Set(sitemapUrls);
      return unique.size !== sitemapUrls.length ? result('warn', 'Sitemap contains duplicate URLs.', 'Remove duplicate URLs from sitemap.xml.', { total: sitemapUrls.length, unique: unique.size }, { source: 'sitemap' }) : result('pass', 'No duplicate sitemap URLs detected.', 'No action needed.', { count: sitemapUrls.length }, { source: 'sitemap' });
    }
    if (id.includes('sitemap-in-robots') || id.includes('sitemap-in-robotstxt')) {
      if (!hasRobots) return unavailable('robots_unavailable', 'robots');
      return /sitemap:/i.test(context.robotsTxt?.content || '') ? result('pass', 'robots.txt references a sitemap.', 'No action needed.', { robotsUrl: context.robotsTxt.url }, { source: 'robots' }) : result('warn', 'robots.txt does not reference a sitemap.', 'Add a Sitemap directive to robots.txt.', { robotsUrl: context.robotsTxt.url }, { source: 'robots' });
    }
    if (id.includes('crawl-delay')) {
      if (!hasRobots) return unavailable('robots_unavailable', 'robots');
      return /crawl-delay\s*:/i.test(context.robotsTxt?.content || '') ? result('info', 'robots.txt contains Crawl-delay.', 'Confirm crawl-delay is intentional for target crawlers.', {}, { source: 'robots' }) : result('pass', 'No crawl-delay directive found.', 'No action needed.', {}, { source: 'robots' });
    }
    if (id.includes('indexability-conflict')) {
      const noindex = /noindex/i.test(context.meta?.robots || '');
      const canonicalUrl = canonical(context);
      return noindex && canonicalUrl ? result('warn', 'Page has noindex and canonical directives together.', 'Confirm the intended indexability and canonicalization behavior.', { robots: context.meta.robots, canonical: canonicalUrl }, { source: 'html' }) : result('pass', 'No indexability conflict detected on the audited page.', 'No action needed.', { robots: context.meta?.robots || 'not set', canonical: canonicalUrl || 'not set' }, { source: 'html' });
    }
    if (id.includes('noindex-in-sitemap')) {
      if (!hasSitemap) return unavailable('sitemap_unavailable', 'sitemap');
      if (!context.crawlMode || !crawlPages.length) return unavailable('requires_crawl_mode', 'crawler');
      const noindexInSitemap = (context.noindexPages || []).filter((pageUrl) => sitemapUrls.includes(pageUrl));
      return noindexInSitemap.length ? result('warn', 'Sitemap includes noindex pages.', 'Remove noindex URLs from sitemap.xml.', { examples: noindexInSitemap.slice(0, 5) }, { source: 'crawler' }) : result('pass', 'No noindex crawled pages were found in the sitemap.', 'No action needed.', {}, { source: 'crawler' });
    }
    if (id.includes('pagination-canonical') || id.includes('pagination-broken') || id.includes('pagination-noindex')) {
      const pagination = context.paginationLinks || [];
      if (!pagination.length) return skipped('not_applicable_no_pagination', 'html', 'Pagination checks are not applicable because pagination links were not detected.');
      return result('info', 'Pagination links were detected and recorded.', 'Review pagination canonicals during full crawl validation.', { pagination }, { source: 'crawler' });
    }
    if (id.includes('blocked-resources')) {
      if (!hasRobots) return unavailable('robots_unavailable', 'robots');
      return result('info', 'Blocked resource checks require resource-level robots validation.', 'Run a rendered crawl to verify blocked CSS/JS resources.', {}, { source: 'robots' });
    }
    if (requiresFullCrawl || id.includes('sitemap-orphan-urls')) {
      if (!context.crawlMode || crawlPages.length < 2) return unavailable('requires_crawl_mode', 'crawler');
      return result('info', 'Full crawl data is available for this crawlability rule.', 'Review crawl graph evidence for this rule.', { pagesCrawled: crawlPages.length }, { source: 'crawler' });
    }
    return context.crawlMode && crawlPages.length ? result('info', 'Crawlability context is available.', 'Review crawl evidence for affected URLs.', { pagesCrawled: crawlPages.length }, { source: 'crawler' }) : createNotAvailable({
      message: 'Crawlability requires site crawl mode. Enable crawl mode to audit sitemap conflicts, orphan pages, pagination, and indexability signals.',
      recommendation: 'Run the audit with crawlMode=true to evaluate this rule.',
      evidence: { reason: 'requires_crawl_mode' },
      reason: 'requires_crawl_mode',
      source: 'crawler'
    });
  }
  if (category === 'javascript-rendering') {
    if (['js-initial-html-title', 'js-initial-html-description', 'js-initial-html-h1', 'js-initial-html-canonical'].includes(id)) {
      if (id.includes('title')) return context.meta.title ? result('pass', 'Initial HTML contains a title tag.', 'No action needed.', { value: context.meta.title }) : result('warn', 'Initial HTML is missing a title tag.', 'Ensure SEO-critical tags are present in source HTML or reliably rendered.', {});
      if (id.includes('description')) return context.meta.description ? result('pass', 'Initial HTML contains a meta description.', 'No action needed.', { value: context.meta.description }) : result('warn', 'Initial HTML is missing a meta description.', 'Include the meta description in source HTML when possible.', {});
      if (id.includes('h1')) return headings.h1?.length ? result('pass', 'Initial HTML contains an H1.', 'No action needed.', { value: headings.h1 }) : result('warn', 'Initial HTML is missing an H1.', 'Include primary content headings in source HTML when possible.', {});
      if (id.includes('canonical')) return canonical(context) ? result('pass', 'Initial HTML contains a canonical tag.', 'No action needed.', { value: canonical(context) }) : result('warn', 'Initial HTML is missing canonical.', 'Include canonical in source HTML when possible.', {});
    }
    if (id.includes('ssr-check')) return context.wordCount > 100 ? result('pass', 'Initial HTML contains meaningful body content.', 'No action needed.', { wordCount: context.wordCount }) : result('warn', 'Initial HTML has limited body content.', 'Render important content in initial HTML where possible.', { wordCount: context.wordCount });
    return context.renderedDom ? result('info', 'Rendered DOM comparison data is available.', 'Review source-vs-rendered differences.', {}, { source: 'rendered-dom' }) : unavailable('rendered_dom_unavailable', 'rendered-dom');
  }

  return result('info', 'Rule recorded with available audit context.', 'Review this rule manually if it is important for the page type.', { ruleId: id });
}

export function makeRules(category, ids, meta = {}) {
  return ids.map((id) => ({
    id,
    name: meta[id]?.name || titleCase(id),
    category,
    severity: meta[id]?.severity || 'medium',
    run: async (context) => runGenericRule({ id, category }, context)
  }));
}
