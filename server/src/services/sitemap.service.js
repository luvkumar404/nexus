import { parseStringPromise } from 'xml2js';
import { safeRequest } from '../utils/safeRequest.js';

export async function parseSitemap(url) {
  const origin = new URL(url).origin;
  const sitemapUrl = `${origin}/sitemap.xml`;
  const response = await safeRequest(sitemapUrl, { timeout: 10000 });
  if (response.status !== 200) return { exists: false, url: sitemapUrl, urls: [], validUrls: [], contentLength: 0 };
  try {
    const parsed = await parseStringPromise(response.data);
    const urls = (parsed.urlset?.url || []).map((entry) => entry.loc?.[0]).filter(Boolean);
    return { exists: true, url: sitemapUrl, urls, validUrls: urls.slice(0, 50), contentLength: String(response.data || '').length };
  } catch (error) {
    return { exists: true, url: sitemapUrl, urls: [], validUrls: [], contentLength: String(response.data || '').length, parseError: error.message };
  }
}
