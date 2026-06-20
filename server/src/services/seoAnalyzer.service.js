import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import { readabilityScore, tokenize } from '../utils/textSimilarity.js';
import { sameOrigin } from '../utils/normalizeUrl.js';

function absoluteUrl(base, value) {
  try {
    return new URL(value, base).toString().split('#')[0];
  } catch {
    return null;
  }
}

function issue(title, description, severity, category, affectedUrl, recommendation, difficulty = 'easy') {
  return { title, description, severity, category, affectedUrl, recommendation, estimatedImpact: severity === 'critical' || severity === 'high' ? 'High' : 'Moderate', difficulty };
}

export function analyzeHtml({ url, html, statusCode, baseUrl }) {
  const $ = cheerio.load(html || '');
  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  const viewport = $('meta[name="viewport"]').attr('content') || '';
  const lang = $('html').attr('lang') || '';
  const h1 = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h2 = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h3 = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const words = tokenize(bodyText);
  const keywordCandidates = tokenize(`${title} ${h1.join(' ')}`).slice(0, 8);
  const keywordDensity = keywordCandidates.map((keyword) => ({
    keyword,
    density: Number(((words.filter((w) => w === keyword).length / Math.max(words.length, 1)) * 100).toFixed(2))
  }));

  const allLinks = $('a[href]').map((_, el) => absoluteUrl(url, $(el).attr('href'))).get().filter(Boolean);
  const internalLinks = [...new Set(allLinks.filter((link) => sameOrigin(link, baseUrl)))];
  const externalLinks = [...new Set(allLinks.filter((link) => !sameOrigin(link, baseUrl) && /^https?:/.test(link)))];
  const nofollowLinks = $('a[rel*="nofollow"]').map((_, el) => absoluteUrl(url, $(el).attr('href'))).get().filter(Boolean);
  const images = $('img').map((_, el) => ({
    src: absoluteUrl(url, $(el).attr('src')),
    alt: $(el).attr('alt'),
    loading: $(el).attr('loading'),
    width: $(el).attr('width'),
    height: $(el).attr('height')
  })).get().filter((img) => img.src);

  const jsonLd = [];
  const schemaTypes = [];
  const jsonLdErrors = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      jsonLd.push(parsed);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach((item) => {
        if (item['@type']) schemaTypes.push(item['@type']);
        if (item['@graph']) item['@graph'].forEach((node) => node['@type'] && schemaTypes.push(node['@type']));
      });
    } catch (error) {
      jsonLdErrors.push(error.message);
    }
  });

  const microdataTypes = $('[itemscope][itemtype]').map((_, el) => $(el).attr('itemtype')).get();
  const ogTags = $('meta[property^="og:"]').length;
  const twitterTags = $('meta[name^="twitter:"]').length;
  const hreflang = $('link[rel="alternate"][hreflang]').map((_, el) => ({
    lang: $(el).attr('hreflang'),
    href: absoluteUrl(url, $(el).attr('href')),
    valid: Boolean($(el).attr('hreflang') && absoluteUrl(url, $(el).attr('href')))
  })).get();

  const pageIssues = [];
  if (!title) pageIssues.push(issue('Missing title tag', 'The page has no HTML title.', 'high', 'onPage', url, 'Add a unique, descriptive title between 30 and 60 characters.'));
  if (title && (title.length < 30 || title.length > 60)) pageIssues.push(issue('Title length outside recommended range', `Title is ${title.length} characters.`, 'medium', 'onPage', url, 'Rewrite the title to fit the main query and page purpose within 30 to 60 characters.'));
  if (!metaDescription) pageIssues.push(issue('Missing meta description', 'Search snippets may be generated automatically.', 'medium', 'onPage', url, 'Add a clear meta description between 120 and 160 characters.'));
  if (metaDescription && (metaDescription.length < 120 || metaDescription.length > 160)) pageIssues.push(issue('Meta description length outside recommended range', `Description is ${metaDescription.length} characters.`, 'low', 'onPage', url, 'Edit the description so it summarizes the page in 120 to 160 characters.'));
  if (h1.length !== 1) pageIssues.push(issue('H1 count needs attention', `Found ${h1.length} H1 headings.`, 'medium', 'onPage', url, 'Use one primary H1 that clearly states the page topic.'));
  if (!canonical) pageIssues.push(issue('Missing canonical link', 'Canonical tags help consolidate duplicate or near-duplicate pages.', 'medium', 'technical', url, 'Add a self-referencing canonical URL unless another canonical target is intentional.'));
  if (!viewport) pageIssues.push(issue('Missing viewport meta tag', 'Mobile browsers may render the page poorly.', 'high', 'mobile', url, 'Add a responsive viewport meta tag.'));
  if (words.length < 300) pageIssues.push(issue('Thin content', `Detected about ${words.length} meaningful words.`, 'medium', 'content', url, 'Expand the page with useful, original content that satisfies the visitor intent.', 'medium'));
  if (!lang) pageIssues.push(issue('Missing html lang attribute', 'Language metadata improves accessibility and localization.', 'low', 'technical', url, 'Set a valid lang attribute on the html element.'));
  if (!ogTags) pageIssues.push(issue('Missing Open Graph tags', 'Shared links may not render rich previews.', 'low', 'structured', url, 'Add og:title, og:description, og:image, and og:url tags.'));
  if (!twitterTags) pageIssues.push(issue('Missing Twitter card tags', 'Social previews may be incomplete.', 'low', 'structured', url, 'Add twitter:card and related Twitter metadata.'));
  if (!jsonLd.length && !microdataTypes.length) pageIssues.push(issue('No structured data detected', 'Schema markup can clarify page entities and rich-result eligibility.', 'low', 'structured', url, 'Add relevant JSON-LD schema such as Organization, WebSite, Article, Product, FAQPage, or BreadcrumbList.', 'medium'));
  if (images.filter((img) => img.alt === undefined).length) pageIssues.push(issue('Images missing alt text', `${images.filter((img) => img.alt === undefined).length} images have no alt attribute.`, 'medium', 'onPage', url, 'Add concise alt text for informative images and empty alt text for decorative images.'));

  const cssResources = $('link[rel="stylesheet"]').map((_, el) => absoluteUrl(url, $(el).attr('href'))).get().filter(Boolean);
  const jsResources = $('script[src]').map((_, el) => absoluteUrl(url, $(el).attr('src'))).get().filter(Boolean);
  const mixedContent = [...images.map((i) => i.src), ...cssResources, ...jsResources].filter((asset) => asset?.startsWith('http://') && url.startsWith('https://'));
  if (mixedContent.length) pageIssues.push(issue('Mixed content detected', `${mixedContent.length} insecure assets are loaded on an HTTPS page.`, 'high', 'technical', url, 'Serve all images, scripts, and stylesheets over HTTPS.', 'medium'));

  return {
    page: {
      url,
      statusCode,
      title,
      titleLength: title.length,
      metaDescription,
      metaDescriptionLength: metaDescription.length,
      canonical,
      robotsMeta,
      viewport,
      h1,
      h2,
      h3,
      wordCount: words.length,
      readability: readabilityScore(bodyText),
      internalLinks,
      externalLinks,
      nofollowLinks,
      images: {
        total: images.length,
        missingAlt: images.filter((img) => img.alt === undefined).length,
        emptyAlt: images.filter((img) => img.alt === '').length,
        missingDimensions: images.filter((img) => !img.width || !img.height).length,
        notLazyLoaded: images.filter((img) => img.loading !== 'lazy').length,
        largeImages: []
      },
      resources: { cssCount: cssResources.length, jsCount: jsResources.length, failed: [] },
      structuredData: { jsonLdCount: jsonLd.length, schemaTypes: [...new Set(schemaTypes.flat())], microdataTypes, jsonLdErrors },
      socialTags: { openGraphCount: ogTags, twitterCount: twitterTags },
      hreflang,
      bodyText,
      contentHash: crypto.createHash('sha1').update(bodyText).digest('hex')
    },
    issues: pageIssues,
    discoveredLinks: internalLinks
  };
}
