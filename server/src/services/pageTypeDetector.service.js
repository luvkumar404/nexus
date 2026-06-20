export function detectPageType(context) {
  const url = new URL(context.finalUrl || context.url);
  const path = url.pathname.toLowerCase();
  const text = (context.text || '').toLowerCase();
  const schemaTypes = (context.schema?.types || []).map((type) => String(type).toLowerCase());
  const has = (pattern) => pattern.test(`${path} ${text}`);

  if (path === '/' || path === '') return 'homepage';
  if (has(/contact|support|get in touch/)) return 'contact';
  if (has(/about|our story|who we are/)) return 'about';
  if (has(/privacy|terms|cookie|legal/)) return 'legal';
  if (schemaTypes.some((type) => type.includes('product')) || has(/add to cart|buy now|\$\d+|price/)) return 'product';
  if (has(/cart|checkout|shop|store|ecommerce|category\/|collections\//)) return 'ecommerce';
  if (schemaTypes.some((type) => type.includes('article') || type.includes('blogposting') || type.includes('newsarticle')) || has(/author|published|updated on|blog|article|news/)) return 'article';
  if (has(/localbusiness|address|directions|opening hours|open now/) || schemaTypes.some((type) => type.includes('localbusiness'))) return 'local_business';
  if (has(/landing|signup|book a demo|get started|request quote/)) return 'landing_page';
  return 'unknown';
}

export function detectApplicabilitySignals(context) {
  const url = new URL(context.finalUrl || context.url);
  const text = (context.text || '').toLowerCase();
  const path = url.pathname.toLowerCase();
  const schemaTypes = (context.schema?.types || []).map((type) => String(type).toLowerCase());
  const hasHreflang = (context.hreflang || []).length > 0;
  const multilingualPath = /(^|\/)(en|fr|es|de|hi|it|pt|ja|ko|zh|ar|nl|pl|ru)(\/|$)/i.test(path);
  const languageSwitcher = /select language|change language|language switcher|\/en\/|\/fr\/|\/es\/|\/hi\//i.test(context.html || '');
  const sitemapAlternates = (context.sitemap?.urls || []).some((item) => /\/(en|fr|es|de|hi|it|pt|ja|ko|zh|ar)\//i.test(item));
  return {
    isMultilingual: hasHreflang || multilingualPath || languageSwitcher || sitemapAlternates,
    hasHreflang,
    hasFaq: /faq|frequently asked questions/i.test(text) || schemaTypes.includes('faqpage'),
    hasReviews: /review|rating|stars/i.test(text) || schemaTypes.includes('review'),
    hasVideo: context.$('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0 || schemaTypes.includes('videoobject'),
    hasAffiliate: /affiliate|sponsored|commission/i.test(text) || context.links?.some((link) => /affiliate|ref=|tag=/.test(link.raw)),
    isYMYL: /medical|health|finance|loan|insurance|legal|tax|investment|bank/i.test(text),
    hasLocalSignals: /address|phone|directions|hours|near me/i.test(text) || schemaTypes.some((type) => type.includes('localbusiness')),
    hasArticleSignals: schemaTypes.some((type) => type.includes('article') || type.includes('blogposting') || type.includes('newsarticle')) || /author|published|updated on/i.test(text),
    hasProductSignals: schemaTypes.some((type) => type.includes('product')) || /add to cart|buy now|price|\$\d+/i.test(text)
  };
}
