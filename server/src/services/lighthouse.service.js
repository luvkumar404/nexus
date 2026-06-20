import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { env } from '../config/env.js';
import { mapAuditError } from '../utils/auditErrorMapper.js';

function metric(audit, key) {
  const item = audit?.audits?.[key];
  return item ? { value: item.displayValue || item.numericValue, score: item.score } : { value: 'not available', score: null };
}

export async function runLighthouseAudit(url) {
  if (!env.lighthouseEnabled) {
    return {
      available: false,
      code: 'LIGHTHOUSE_DISABLED',
      message: 'Performance audit is disabled in environment settings.',
      recommendation: 'Set LIGHTHOUSE_ENABLED=true to enable Lighthouse checks.',
      evidence: { reason: 'LIGHTHOUSE_DISABLED' }
    };
  }
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--remote-debugging-port=9222'] });
    const result = await lighthouse(url, {
      port: 9222,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false }
    });
    const lhr = result.lhr;
    return {
      available: true,
      scores: {
        performance: lhr.categories.performance.score,
        accessibility: lhr.categories.accessibility.score,
        bestPractices: lhr.categories['best-practices'].score,
        seo: lhr.categories.seo.score
      },
      metrics: {
        firstContentfulPaint: metric(lhr, 'first-contentful-paint'),
        largestContentfulPaint: metric(lhr, 'largest-contentful-paint'),
        cumulativeLayoutShift: metric(lhr, 'cumulative-layout-shift'),
        totalBlockingTime: metric(lhr, 'total-blocking-time'),
        speedIndex: metric(lhr, 'speed-index'),
        interactive: metric(lhr, 'interactive')
      },
      opportunities: {
        renderBlockingResources: metric(lhr, 'render-blocking-resources'),
        imageOptimization: metric(lhr, 'uses-optimized-images'),
        unusedJavascript: metric(lhr, 'unused-javascript'),
        unusedCss: metric(lhr, 'unused-css-rules'),
        tapTargets: metric(lhr, 'tap-targets'),
        fontSize: metric(lhr, 'font-size')
      }
    };
  } catch (error) {
    const mapped = mapAuditError(error);
    return {
      available: false,
      code: mapped.code,
      message: mapped.code === 'UNKNOWN_CHECK_ERROR' ? 'Performance audit is unavailable.' : mapped.message,
      recommendation: mapped.recommendation,
      evidence: mapped.evidence,
      ...(env.auditDebug ? { developerDetails: { rawError: error.message } } : {})
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
