import { safeRequest } from '../utils/safeRequest.js';

export async function checkLinks(links = [], limit = 60) {
  const unique = [...new Set(links)].slice(0, limit);
  const results = [];
  for (const url of unique) {
    try {
      const response = await safeRequest(url, { method: 'GET', timeout: 7000, maxRedirects: 3 });
      results.push({ url, status: response.status, broken: response.status >= 400, redirect: response.request?.res?.responseUrl !== url });
    } catch (error) {
      results.push({ url, status: 0, broken: true, redirect: false, error: error.message });
    }
  }
  return results;
}
