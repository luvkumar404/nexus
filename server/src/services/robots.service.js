import robotsParser from 'robots-parser';
import { safeRequest } from '../utils/safeRequest.js';

export async function getRobots(url) {
  const origin = new URL(url).origin;
  const robotsUrl = `${origin}/robots.txt`;
  const response = await safeRequest(robotsUrl, { timeout: 8000 });
  if (response.status !== 200) {
    return { exists: false, url: robotsUrl, parser: null, content: '', blockedImportantPages: [] };
  }
  const parser = robotsParser(robotsUrl, response.data);
  return { exists: true, url: robotsUrl, parser, content: response.data, blockedImportantPages: [] };
}

export function canCrawl(robots, url) {
  if (!robots?.parser) return true;
  return robots.parser.isAllowed(url, 'NexusSEOAuditor') !== false;
}
