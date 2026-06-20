import axios from 'axios';
import { assertPublicUrl } from './normalizeUrl.js';

export async function safeRequest(url, options = {}) {
  const publicUrl = await assertPublicUrl(url);
  return axios.request({
    url: publicUrl,
    method: options.method || 'GET',
    timeout: options.timeout || 12000,
    maxRedirects: options.maxRedirects ?? 5,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Connection: 'keep-alive',
      ...options.headers
    },
    validateStatus: () => true,
    responseType: options.responseType || 'text'
  });
}
