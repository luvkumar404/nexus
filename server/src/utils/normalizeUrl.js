import dns from 'node:dns/promises';
import net from 'node:net';

const PRIVATE_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    return parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      parts[0] === 169 && parts[1] === 254 ||
      parts[0] === 0;
  }
  if (net.isIPv6(ip)) {
    const value = ip.toLowerCase();
    return value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80');
  }
  return false;
}

export function normalizeUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('URL is required');
  }

  let value = input.trim();

  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only http and https URLs are allowed');
    parsed.hash = '';
    return parsed.href;
  } catch (error) {
    if (error.message === 'Only http and https URLs are allowed') throw error;
    throw new Error('Invalid URL format');
  }
}

export function getUrlVariants(inputUrl) {
  const parsed = new URL(inputUrl);
  const hostname = parsed.hostname.replace(/^www\./, '');

  return [
    `https://${hostname}/`,
    `https://www.${hostname}/`,
    `http://${hostname}/`,
    `http://www.${hostname}/`
  ];
}

export async function assertPublicUrl(rawUrl) {
  const normalized = normalizeUrl(rawUrl);
  const parsed = new URL(normalized);
  const hostname = parsed.hostname.toLowerCase();
  if (PRIVATE_HOSTS.has(hostname) || hostname.endsWith('.local')) throw new Error('Private and local URLs are blocked');
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('Private IP addresses are blocked');
    return normalized;
  }
  const records = await dns.lookup(hostname, { all: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) {
    throw new Error('URL resolves to a private or unavailable address');
  }
  return normalized;
}

export function sameOrigin(a, b) {
  return new URL(a).origin === new URL(b).origin;
}
