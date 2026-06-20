export function toAbsoluteUrl(base, value) {
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

export function classifyLinks($, url) {
  const origin = new URL(url).origin;
  return $('a[href]').map((_, el) => {
    const raw = $(el).attr('href') || '';
    const absolute = toAbsoluteUrl(url, raw);
    return {
      raw,
      url: absolute,
      text: $(el).text().replace(/\s+/g, ' ').trim(),
      rel: $(el).attr('rel') || '',
      internal: absolute ? absolute.startsWith(origin) : false
    };
  }).get();
}
