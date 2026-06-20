export function extractSchema($) {
  const jsonLd = [];
  const errors = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      jsonLd.push(JSON.parse($(el).contents().text()));
    } catch (error) {
      errors.push(error.message);
    }
  });
  const types = [];
  for (const item of jsonLd.flat()) {
    if (item?.['@type']) types.push(item['@type']);
    if (Array.isArray(item?.['@graph'])) item['@graph'].forEach((node) => node?.['@type'] && types.push(node['@type']));
  }
  return {
    jsonLd,
    errors,
    types: [...new Set(types.flat())],
    microdataTypes: $('[itemscope][itemtype]').map((_, el) => $(el).attr('itemtype')).get()
  };
}
