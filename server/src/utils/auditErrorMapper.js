export function mapAuditError(error) {
  const raw = typeof error === 'string' ? error : error?.message || '';
  const lower = raw.toLowerCase();

  if (lower.includes('unable to crawl website after trying all url variants')) {
    return {
      code: 'CRAWL_FAILED',
      message: 'Unable to crawl website',
      recommendation: 'Check if the URL is valid, reachable from the server, or blocked by the target website.',
      evidence: { reason: 'CRAWL_FAILED', detail: raw }
    };
  }
  if (/executable doesn't exist|playwright install|browser.*missing|chromium.*not found/i.test(raw)) {
    return {
      code: 'PLAYWRIGHT_BROWSER_MISSING',
      message: 'Performance audit is unavailable because the browser dependency is missing.',
      recommendation: 'Run `npx playwright install chromium` in the backend project, or disable Lighthouse checks using LIGHTHOUSE_ENABLED=false.',
      evidence: { reason: 'PLAYWRIGHT_BROWSER_MISSING', command: 'npx playwright install chromium' }
    };
  }
  if (lower.includes('timeout') || lower.includes('timed out') || error?.code === 'ETIMEDOUT') {
    return {
      code: 'TIMEOUT',
      message: 'The website did not respond within the allowed time.',
      recommendation: 'Try again later or increase the request timeout for this environment.',
      evidence: { reason: 'TIMEOUT' }
    };
  }
  if (['ENOTFOUND', 'EAI_AGAIN'].includes(error?.code) || lower.includes('could not resolve') || lower.includes('getaddrinfo')) {
    return {
      code: 'DNS_ERROR',
      message: 'The domain could not be resolved.',
      recommendation: 'Check that the domain is valid and publicly reachable.',
      evidence: { reason: 'DNS_ERROR' }
    };
  }
  if (lower.includes('403') || lower.includes('forbidden')) {
    return {
      code: 'REQUEST_BLOCKED',
      message: 'The website blocked the audit request.',
      recommendation: 'Allow the audit user agent or retry from an allowed network.',
      evidence: { reason: 'REQUEST_BLOCKED' }
    };
  }
  if (lower.includes('ssl') || lower.includes('tls') || lower.includes('certificate')) {
    return {
      code: 'SSL_ERROR',
      message: 'The SSL/TLS connection could not be verified.',
      recommendation: 'Check the certificate chain and TLS configuration.',
      evidence: { reason: 'SSL_ERROR' }
    };
  }
  return {
    code: 'UNKNOWN_CHECK_ERROR',
    message: 'This check could not be completed.',
    recommendation: 'Retry the audit or inspect server logs if the issue persists.',
    evidence: { reason: 'UNKNOWN_CHECK_ERROR' }
  };
}
