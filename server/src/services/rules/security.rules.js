import { makeRules } from './ruleFactory.js';

export const securityRules = makeRules('security', [
  'security-https',
  'security-http-to-https-redirect',
  'security-hsts',
  'security-csp',
  'security-x-frame-options',
  'security-x-content-type-options',
  'security-external-link-security',
  'security-form-https',
  'security-mixed-content',
  'security-permissions-policy',
  'security-referrer-policy',
  'security-leaked-secrets-detection',
  'security-password-over-http',
  'security-protocol-relative-urls',
  'security-ssl-expiry',
  'security-tls-protocol'
]);
