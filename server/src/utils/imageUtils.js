export function extractImages($, url) {
  return $('img').map((_, el) => {
    const src = $(el).attr('src') || '';
    let absolute = null;
    try { absolute = new URL(src, url).toString(); } catch {}
    return {
      src,
      url: absolute,
      alt: $(el).attr('alt'),
      width: $(el).attr('width'),
      height: $(el).attr('height'),
      loading: $(el).attr('loading'),
      srcset: $(el).attr('srcset')
    };
  }).get();
}
