import { CATEGORY_WEIGHTS } from '../config/categoryWeights.config.js';

const EFFORT = { easy: '5-30 minutes', medium: '1-4 hours', hard: '1-3 days' };
const PRIORITY = { critical: 'high', high: 'high', medium: 'medium', low: 'low', info: 'low' };

const categoryGuidance = {
  'core-seo': { impact: 'Search engines may understand, index, or present this page less accurately.', expected: 'A valid, unique, indexable-page SEO signal that matches the visible page.', steps: ['Review the detected HTML signal and the audited final URL.', 'Update the page template or page-level metadata with the expected value.', 'Ensure only one authoritative value is emitted in the document head.', 'Deploy the change and inspect the rendered HTML.'] },
  performance: { impact: 'Slow or unstable rendering can reduce usability and Core Web Vitals performance.', expected: 'Meet the rule threshold shown by the audit and remove the detected rendering bottleneck.', steps: ['Identify the measured resource or rendering stage in the evidence.', 'Optimize the responsible asset, server path, or layout behavior.', 'Test the change on a production-like mobile connection.', 'Compare the same metric before and after deployment.'] },
  links: { impact: 'Users and crawlers may be sent to invalid, unclear, or inefficient destinations.', expected: 'Every affected link should resolve to the intended absolute destination and use descriptive link text.', steps: ['Inspect each affected link from the audit evidence.', 'Replace its destination or markup with the correct reachable URL.', 'Remove the link if no valid destination exists.', 'Re-crawl the page and verify the destination response.'] },
  images: { impact: 'Affected images may be inaccessible, unclear to search engines, or unnecessarily slow.', expected: 'Each affected image should be accessible, appropriately described, sized, and efficiently delivered.', steps: ['Review each affected image listed by the audit.', 'Update its HTML attributes and source asset for this rule.', 'Preserve intrinsic dimensions and visual quality.', 'Reload the page and verify the image markup and network response.'] },
  security: { impact: 'The detected configuration can weaken transport or browser security protections.', expected: 'Serve the page over HTTPS with the relevant browser security control configured correctly.', steps: ['Confirm the detected response header or insecure resource in the evidence.', 'Apply the required header or URL change at the web server/CDN.', 'Deploy first with a scope appropriate for the site.', 'Inspect the production response headers and browser console.'] },
  'technical-seo': { impact: 'Crawlers may receive an invalid response or inconsistent technical directive.', expected: 'Return a crawlable, standards-compliant response with consistent site directives.', steps: ['Inspect the detected response, robots, sitemap, or URL evidence.', 'Correct the responsible server or site-generation configuration.', 'Remove conflicting directives and invalid entries.', 'Fetch the affected URL again as a crawler.'] },
  crawlability: { impact: 'Search crawlers may waste crawl budget or fail to discover and index intended URLs.', expected: 'Crawl, sitemap, robots, canonical, and indexability signals should agree for each affected URL.', steps: ['Compare the affected URL across crawl, sitemap, robots, and canonical evidence.', 'Choose the intended indexable URL and remove conflicting signals.', 'Update internal links and discovery files to reference that URL.', 'Run a site crawl and validate the resulting status and directives.'] },
  'structured-data': { impact: 'Invalid or incomplete structured data can prevent eligible rich-result interpretation.', expected: 'Valid JSON-LD whose type and required properties match visible page content.', steps: ['Select the schema type that accurately represents the visible page.', 'Add or correct the properties identified by the evidence.', 'Keep structured values consistent with visible content.', 'Validate the deployed URL with a structured-data testing tool.'] },
  content: { impact: 'The detected content pattern can reduce clarity, relevance, or search-result quality.', expected: 'Clear, unique, well-structured content appropriate to the page purpose and audience.', steps: ['Review the exact content or heading evidence.', 'Rewrite only the affected text or structure.', 'Keep the result accurate, unique, and useful to readers.', 'Re-run the content and HTML checks.'] },
  'javascript-rendering': { impact: 'Search crawlers may not receive important content or metadata in the initial HTML.', expected: 'SEO-critical content and tags should be present in server-rendered initial HTML.', steps: ['Compare initial HTML with the rendered page for the affected item.', 'Move the critical output into SSR, SSG, or the server template.', 'Avoid depending on delayed client-side requests for this signal.', 'Fetch the raw HTML again and confirm the value is present.'] },
  accessibility: { impact: 'The detected markup may prevent keyboard, screen-reader, or low-vision users from using the page.', expected: 'Semantic, perceivable, operable markup that satisfies the audited accessibility condition.', steps: ['Locate each affected element from the evidence.', 'Correct its semantic HTML, label, name, contrast, or interaction behavior.', 'Test with keyboard navigation and an accessibility tree.', 'Re-run the accessibility audit.'] },
  social: { impact: 'Shared links may display incomplete or inconsistent social previews.', expected: 'Complete Open Graph and Twitter metadata using absolute URLs and page-specific content.', steps: ['Add the missing metadata in the document head.', 'Use the canonical URL and an absolute, crawlable preview image URL.', 'Keep title and description consistent with the page.', 'Refresh the URL in social preview debuggers.'] },
  eeat: { impact: 'Users and evaluators may have insufficient signals to assess the source and trustworthiness of the content.', expected: 'Visible, accurate authorship, ownership, contact, and policy information appropriate to the page.', steps: ['Confirm which trust signal is absent from the detected page.', 'Add a visible link or page containing accurate first-party information.', 'Connect relevant author or organization details to the content.', 'Re-crawl and confirm the signal is discoverable.'] },
  'url-structure': { impact: 'An inconsistent or complex URL can reduce usability and create duplicate crawl paths.', expected: 'A short, stable, lowercase HTTPS URL with words separated by hyphens and no session identifiers.', steps: ['Define the clean replacement URL for the affected path.', 'Add a single permanent redirect from the old URL.', 'Update canonical tags, internal links, and sitemap entries.', 'Verify the redirect and final canonical URL.'] },
  redirects: { impact: 'Client-side, chained, or incorrect redirects can delay users and weaken crawler signals.', expected: 'A single server-side redirect to the final canonical HTTPS URL when a redirect is required.', steps: ['Trace the detected redirect from source to final URL.', 'Configure the source at the server or CDN.', 'Remove intermediate and client-side redirects.', 'Verify one redirect hop and the final 200 response.'] },
  mobile: { impact: 'Mobile users may be unable to read, zoom, or interact with the page reliably.', expected: 'A responsive viewport and layout with accessible sizing and interaction behavior.', steps: ['Reproduce the detected condition at a mobile viewport.', 'Correct the viewport, responsive CSS, or affected control.', 'Test zoom and interaction on narrow screens.', 'Re-run the mobile audit.'] },
  internationalization: { impact: 'Search engines may show the wrong language or regional URL to users.', expected: 'Valid language declarations and reciprocal absolute hreflang alternates for localized pages.', steps: ['Confirm the language and regional audience for each affected URL.', 'Add valid lang or hreflang values using standard codes.', 'Make hreflang annotations reciprocal and include a self-reference.', 'Crawl all alternates and verify they return indexable responses.'] },
  'html-validation': { impact: 'Invalid document structure can cause inconsistent parsing by browsers and crawlers.', expected: 'Standards-compliant HTML with one valid head structure and correctly nested elements.', steps: ['Locate the markup implicated by the evidence.', 'Correct the invalid, duplicate, or misplaced element.', 'Validate the final rendered document.', 'Re-run the audit against the deployed HTML.'] },
  'ai-geo-readiness': { impact: 'Machines may have difficulty identifying the page topic, entities, and authoritative source.', expected: 'Clear semantic structure and factual entity signals that agree with visible content.', steps: ['Review the detected semantic or entity evidence.', 'Add descriptive headings, semantic sections, and attributable facts.', 'Use structured data only where it matches visible content.', 'Re-crawl and verify the information is present in HTML.'] },
  'legal-compliance': { impact: 'The automated check found a potential transparency or consent gap; this is not legal advice.', expected: 'Visible policies and consent behavior appropriate to the site, data processing, and applicable jurisdiction.', steps: ['Confirm the detected site behavior and whether the requirement applies.', 'Have the policy or consent design reviewed by qualified counsel.', 'Implement clear, accessible controls and policy links.', 'Test that consent choices affect non-essential processing as intended.'] }
};

const exact = {
  'core-title-present': { expected: 'One unique, descriptive <title> of approximately 30-60 characters.', solution: 'Add a page-specific title in the HTML head.', code: '<title>Primary Page Topic | Brand</title>' },
  'core-description-present': { expected: 'One relevant meta description approximately 120-160 characters long.', solution: 'Add a unique meta description inside the page head.', code: '<meta name="description" content="A concise, accurate summary of this page.">' },
  'core-h1-present': { expected: 'One visible H1 that describes the primary page topic.', solution: 'Add one descriptive H1 based on the page title and visible topic.', code: ({ topic }) => `<h1>${topic || 'Primary Page Topic'}</h1>` },
  'core-canonical-present': { expected: 'One absolute canonical URL matching the preferred final URL.', solution: 'Add a self-referencing canonical tag using the audited final URL.', code: ({ safeUrl }) => `<link rel="canonical" href="${safeUrl}">` },
  'core-viewport-present': { expected: 'A responsive viewport declaration.', solution: 'Add the standard responsive viewport tag to the document head.', code: '<meta name="viewport" content="width=device-width, initial-scale=1">' },
  'images-alt-present': { expected: 'Informative images have concise contextual alt text; decorative images use alt="".', solution: 'Add accurate alt attributes to the affected images based on their purpose.', code: '<img src="/image.webp" alt="Concise description of the image">' },
  'images-modern-format': { expected: 'Photographic images delivered as AVIF or WebP with a supported fallback.', solution: 'Convert the affected assets and serve responsive modern formats.', code: '<picture>\n  <source srcset="image.avif" type="image/avif">\n  <source srcset="image.webp" type="image/webp">\n  <img src="image.jpg" alt="..." width="800" height="450" loading="lazy">\n</picture>' },
  'security-hsts': { expected: 'Strict-Transport-Security on HTTPS responses after HTTPS is fully deployed.', solution: 'Configure HSTS at the origin or CDN.', code: 'Strict-Transport-Security: max-age=31536000; includeSubDomains' },
  'security-csp': { expected: 'A tested Content-Security-Policy restricting resource origins.', solution: 'Start with a report-only policy, resolve violations, then enforce it.', code: "Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'" },
  'security-x-content-type-options': { expected: 'X-Content-Type-Options set to nosniff.', solution: 'Add the nosniff response header at the server or CDN.', code: 'X-Content-Type-Options: nosniff' },
  'security-x-frame-options': { expected: 'Framing restricted with CSP frame-ancestors and/or X-Frame-Options.', solution: 'Restrict which sites may frame the page.', code: "Content-Security-Policy: frame-ancestors 'self'\nX-Frame-Options: SAMEORIGIN" },
  'technical-robots-txt-exists': { expected: 'A reachable /robots.txt returning a valid text response.', solution: 'Publish robots.txt at the site root and include only intentional crawl directives.', code: 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml' },
  'technical-sitemap-exists': { expected: 'A reachable XML sitemap containing canonical, indexable URLs.', solution: 'Generate and publish an XML sitemap, then reference it from robots.txt.', code: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n</urlset>' },
  'content-heading-hierarchy': { expected: 'A logical hierarchy that does not skip heading levels.', solution: 'Reorder the detected headings into a semantic outline.', code: '<h1>Page topic</h1>\n  <h2>Main section</h2>\n    <h3>Subsection</h3>\n  <h2>Next section</h2>' },
  'international-html-lang': { expected: 'A valid BCP 47 language code on the html element.', solution: 'Set the document language to the primary language of the page.', code: '<html lang="en">' },
  'html-missing-doctype': { expected: 'An HTML5 doctype as the first document declaration.', solution: 'Add the HTML5 doctype before the html element.', code: '<!doctype html>' }
};

function scalarEvidence(evidence) {
  if (evidence == null) return null;
  if (Object.hasOwn(evidence, 'value')) return evidence.value;
  for (const key of ['count', 'score', 'bytes', 'wordCount', 'canonical', 'robots', 'key']) if (Object.hasOwn(evidence, key)) return evidence[key];
  return Object.keys(evidence).length ? evidence : null;
}

function absolute(value, baseUrl) {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (!/^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(value)) return value;
  try { return new URL(value, baseUrl).href; } catch { return value; }
}

function affectedItems(evidence = {}, affectedUrl) {
  const values = [];
  const collect = (input, key = '') => {
    if (input == null) return;
    if (Array.isArray(input)) return input.slice(0, 25).forEach((item) => collect(item, key));
    if (typeof input === 'object') {
      const preferred = input.url || input.src || input.href || input.selector;
      if (preferred) values.push(typeof input.statusCode === 'number' ? `${absolute(preferred, affectedUrl)} (HTTP ${input.statusCode})` : absolute(preferred, affectedUrl));
      else Object.entries(input).forEach(([childKey, item]) => { if (['images', 'values', 'examples', 'items', 'resources', 'links', 'warnings', 'selectors'].includes(childKey)) collect(item, childKey); });
      return;
    }
    if (['images', 'values', 'examples', 'items', 'resources', 'links', 'warnings', 'selectors'].includes(key)) values.push(absolute(String(input), affectedUrl));
  };
  collect(evidence);
  if (!values.length && affectedUrl) values.push(affectedUrl);
  return [...new Set(values.filter(Boolean))];
}

function schemaCode(ruleId, url) {
  const raw = ruleId.replace('schema-', '');
  const types = { breadcrumblist: 'BreadcrumbList', faqpage: 'FAQPage', localbusiness: 'LocalBusiness', organization: 'Organization', product: 'Product', review: 'Review', videoobject: 'VideoObject', article: 'Article', 'website-searchaction': 'WebSite' };
  const type = types[raw] || 'WebPage';
  return JSON.stringify({ '@context': 'https://schema.org', '@type': type, url, name: 'Use the visible page name and add properties required for this type' }, null, 2);
}

function inferredCode(rule, url) {
  if (rule.categoryId === 'structured-data') return `<script type="application/ld+json">\n${schemaCode(rule.ruleId, url)}\n</script>`;
  if (rule.categoryId === 'social') {
    return `<meta property="og:title" content="Page title">\n<meta property="og:description" content="Page description">\n<meta property="og:url" content="${url}">\n<meta property="og:type" content="website">\n<meta property="og:image" content="${new URL('/social-image.jpg', url).href}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Page title">\n<meta name="twitter:description" content="Page description">\n<meta name="twitter:image" content="${new URL('/social-image.jpg', url).href}">`;
  }
  if (rule.ruleId.includes('lazy-loading')) return '<img src="image.webp" alt="..." width="800" height="450" loading="lazy">';
  if (rule.ruleId.includes('dimensions')) return '<img src="image.webp" alt="..." width="800" height="450">';
  if (rule.ruleId.includes('hreflang')) return `<link rel="alternate" hreflang="en" href="${url}">\n<link rel="alternate" hreflang="x-default" href="${url}">`;
  return null;
}

function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function generateRecommendation(rule, context = {}) {
  if (!['fail', 'warn'].includes(rule.status)) return null;
  const category = CATEGORY_WEIGHTS[rule.categoryId]?.name || rule.categoryId;
  const guidance = categoryGuidance[rule.categoryId] || categoryGuidance['technical-seo'];
  const override = exact[rule.ruleId] || {};
  const url = rule.affectedUrl || '';
  const safeUrl = escapeHtml(url);
  const topic = escapeHtml((context.meta?.title || '').trim().slice(0, 120));
  const code = typeof override.code === 'function' ? override.code({ url, safeUrl, topic, evidence: rule.evidence }) : override.code || inferredCode(rule, url);
  const evidenceAvailable = rule.evidence && Object.keys(rule.evidence).some((key) => !['reason'].includes(key));
  const fallback = 'Unable to determine an exact fix from the available audit data.';
  return {
    ruleId: rule.ruleId,
    status: rule.status === 'fail' ? 'failed' : 'warning',
    title: rule.message || rule.ruleName,
    category,
    priority: PRIORITY[rule.severity] || (rule.status === 'fail' ? 'high' : 'medium'),
    impact: guidance.impact,
    detectedValue: scalarEvidence(rule.evidence || {}),
    expectedValue: override.expected || (rule.recommendation && !/^review (this rule|if relevant)/i.test(rule.recommendation) ? rule.recommendation : guidance.expected),
    affectedItems: affectedItems(rule.evidence, url),
    explanation: evidenceAvailable ? `${rule.message} The detected audit evidence is shown below.` : `${rule.message} ${fallback}`,
    solution: evidenceAvailable ? (override.solution || rule.recommendation || fallback) : fallback,
    steps: evidenceAvailable ? guidance.steps : ['Collect the data required by this rule.', 'Re-run the audit before making a targeted change.', 'Apply a fix only after confirming the affected item.', 'Verify the confirmed condition no longer occurs.'],
    codeExample: code,
    verification: `Re-run the audit for ${url || 'the affected page'} and confirm “${rule.ruleName}” passes; also inspect the relevant HTML, response, or resource directly.`,
    estimatedEffort: EFFORT[rule.difficulty] || EFFORT.easy,
    automatedCheckDisclaimer: rule.categoryId === 'legal-compliance' ? 'This is an automated check, not legal advice.' : undefined
  };
}

export function attachRecommendations(ruleResults = []) {
  return ruleResults.map((rule) => ({ ...rule, solution: rule.solution || generateRecommendation(rule) }));
}
