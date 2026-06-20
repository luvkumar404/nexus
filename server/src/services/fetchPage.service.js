import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { env } from '../config/env.js';
import { assertPublicUrl, getUrlVariants, normalizeUrl } from '../utils/normalizeUrl.js';

const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36';

function uniqueUrlVariants(normalizedUrl) {
  return [...new Set([normalizedUrl, ...getUrlVariants(normalizedUrl)])];
}

function buildCrawlDebug({ inputUrl, normalizedUrl, finalUrl, statusCode, fetchMethod, html }, { logDebug = env.auditDebug } = {}) {
  const $ = cheerio.load(html || '');
  const debug = {
    inputUrl,
    normalizedUrl,
    finalUrl,
    statusCode,
    fetchMethod,
    htmlLength: String(html || '').length,
    pageTitle: $('title').first().text().trim(),
    metaCount: $('meta').length,
    headingCount: $('h1,h2,h3,h4,h5,h6').length,
    h1Count: $('h1').length,
    h2Count: $('h2').length
  };
  if (logDebug) console.log('SEO Crawl Debug:', debug);
  return debug;
}

async function fetchWithPlaywright(url) {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage({
      userAgent: BROWSER_USER_AGENT,
      viewport: { width: 1366, height: 768 },
      ignoreHTTPSErrors: true
    });

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    await page.waitForTimeout(3000);

    const html = await page.content();
    const title = await page.title();

    return {
      inputUrl: url,
      finalUrl: page.url(),
      statusCode: response?.status() || null,
      headers: response?.headers?.() || {},
      html,
      title,
      fetchMethod: 'playwright'
    };
  } finally {
    if (browser) await browser.close();
  }
}

async function fetchWithAxios(url, { timeout = 45000 } = {}) {
  const response = await axios.get(url, {
    timeout,
    maxRedirects: 10,
    validateStatus: (status) => status >= 200 && status < 400,
    responseType: 'text',
    headers: {
      'User-Agent': BROWSER_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Connection: 'keep-alive'
    }
  });

  return {
    inputUrl: url,
    finalUrl: response.request?.res?.responseUrl || url,
    statusCode: response.status,
    headers: response.headers || {},
    html: String(response.data || ''),
    title: null,
    fetchMethod: 'axios'
  };
}

export async function fetchWebsiteHtml(inputUrl, options = {}) {
  const { preferBrowser = true, logDebug = env.auditDebug, timeout = 45000 } = options;
  const startedAt = Date.now();
  const normalizedUrl = normalizeUrl(inputUrl);
  const variants = uniqueUrlVariants(normalizedUrl);
  let lastError = null;

  for (const candidateUrl of variants) {
    let url;
    try {
      url = await assertPublicUrl(candidateUrl);
    } catch (error) {
      lastError = error;
      if (logDebug) console.error(`URL variant rejected for ${candidateUrl}:`, error.message);
      continue;
    }

    if (preferBrowser) {
      try {
        const result = await fetchWithPlaywright(url);
        if (result?.html && result.html.length > 500) {
          const debug = buildCrawlDebug({ ...result, inputUrl, normalizedUrl }, { logDebug });
          return { url: inputUrl, normalizedUrl, timing: { responseMs: Date.now() - startedAt }, debug, ...result };
        }
      } catch (error) {
        lastError = error;
        if (logDebug) console.error(`Playwright failed for ${url}:`, error.message);
      }
    }

    try {
      const result = await fetchWithAxios(url, { timeout });
      if (result?.html && result.html.length > 500) {
        const debug = buildCrawlDebug({ ...result, inputUrl, normalizedUrl }, { logDebug });
        return { url: inputUrl, normalizedUrl, timing: { responseMs: Date.now() - startedAt }, debug, ...result };
      }
      lastError = new Error(`Fetched HTML was too short for ${url}`);
    } catch (error) {
      lastError = error;
      if (logDebug) console.error(`Axios failed for ${url}:`, error.message);
    }
  }

  throw new Error(`Unable to crawl website after trying all URL variants. Last error: ${lastError?.message || 'Unknown error'}`);
}

export async function fetchPage(url, options = {}) {
  return fetchWebsiteHtml(url, options);
}

export function getFetchDebugSummary(page) {
  const $ = cheerio.load(page.html || '');
  return {
    success: true,
    finalUrl: page.finalUrl,
    statusCode: page.statusCode,
    fetchMethod: page.fetchMethod,
    htmlLength: String(page.html || '').length,
    title: page.title || $('title').first().text().trim(),
    metaCount: $('meta').length,
    headingCount: $('h1,h2,h3,h4,h5,h6').length,
    firstH1: $('h1').first().text().replace(/\s+/g, ' ').trim() || null,
    firstH2: $('h2').first().text().replace(/\s+/g, ' ').trim() || null
  };
}
