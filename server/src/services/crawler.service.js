import Audit from '../models/Audit.js';
import PageAudit from '../models/PageAudit.js';
import Issue from '../models/Issue.js';
import Recommendation from '../models/Recommendation.js';
import RuleResult from '../models/RuleResult.js';
import CategoryResult from '../models/CategoryResult.js';
import { fetchPage } from './fetchPage.service.js';
import { parseHtml } from './htmlParser.service.js';
import { runLighthouseAudit } from './lighthouse.service.js';
import { runRulesEngine } from './rulesEngine.service.js';
import { getBacklinkAnalysis } from './backlink.service.js';
import { getSearchConsoleSnapshot } from './searchConsole.service.js';
import { getRobots } from './robots.service.js';
import { parseSitemap } from './sitemap.service.js';
import { buildIssuesFromRuleResults } from './issueBuilder.service.js';
import { mapAuditError } from '../utils/auditErrorMapper.js';
import { buildScoreImprovementPlan } from './scoreImprovement.service.js';
import { crawlSite } from './siteCrawler.service.js';
import { env } from '../config/env.js';

async function updateProgress(auditId, progress, currentStep) {
  await Audit.findByIdAndUpdate(auditId, { progress, currentStep, status: 'running' });
}

export async function runAudit({ auditId, url, crawlMode, maxPages }) {
  try {
    await updateProgress(auditId, 8, 'Fetching page');
    const page = await fetchPage(url, { preferBrowser: true });
    await updateProgress(auditId, 22, 'Loading robots.txt and sitemap');
    const [robots, sitemap] = await Promise.all([getRobots(url), parseSitemap(url)]);
    const crawlEnabled = crawlMode === undefined ? env.auditCrawlEnabled : Boolean(crawlMode);
    await updateProgress(auditId, 35, crawlEnabled ? 'Crawling internal pages' : 'Skipping site crawl');
    const crawlContext = await crawlSite(page.finalUrl || url, { enabled: crawlEnabled, maxPages, seedPage: page });
    await updateProgress(auditId, 45, 'Running Lighthouse');
    const performance = await runLighthouseAudit(url);
    await updateProgress(auditId, 65, 'Parsing HTML and building rule context');
    const context = parseHtml({ ...page, robotsTxt: robots, sitemap, lighthouse: performance });
    Object.assign(context, crawlContext, {
      crawlMode: crawlEnabled,
      sitemapUrls: sitemap.urls || sitemap.validUrls || []
    });
    await updateProgress(auditId, 78, 'Running 251-rule audit engine');
    const auditResult = await runRulesEngine(context);
    await RuleResult.deleteMany({ audit: auditId });
    await CategoryResult.deleteMany({ audit: auditId });
    await RuleResult.insertMany(auditResult.categories.flatMap((category) => category.rules.map((rule) => ({ audit: auditId, ...rule }))));
    await CategoryResult.insertMany(auditResult.categories.map(({ rules, ...category }) => ({ audit: auditId, ...category })));

    const failedRules = auditResult.categories.flatMap((category) => category.rules).filter((rule) => ['fail', 'warn'].includes(rule.status));
    await Issue.deleteMany({ audit: auditId });
    await Recommendation.deleteMany({ audit: auditId });
    const issueDocs = await Issue.insertMany(buildIssuesFromRuleResults(auditId, failedRules).slice(0, 80));
    await Recommendation.insertMany(issueDocs.slice(0, 25).map((item, index) => ({ audit: auditId, issue: item._id, title: item.title, body: item.recommendation, priority: 25 - index, category: item.category })));

    const backlinkAnalysis = await getBacklinkAnalysis(url);
    const searchConsole = await getSearchConsoleSnapshot(url);
    const scoreImprovementPlan = buildScoreImprovementPlan(auditResult.categories);
    await Audit.findByIdAndUpdate(auditId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Completed',
      finalUrl: context.finalUrl,
      statusCode: context.statusCode,
      fetchMethod: context.fetchMethod,
      overallScore: auditResult.overallScore,
      grade: auditResult.grade,
      summary: auditResult.summary,
      categories: auditResult.categories,
      headingStructure: context.headings,
      socialPreview: context.social,
      pageMetrics: context.pageMetrics,
      scoreImprovementPlan,
      scores: {
        overall: auditResult.overallScore,
        ...Object.fromEntries(auditResult.categories.map((category) => [category.id, category.score]))
      },
      performance,
      crawl: {
        robots: { exists: robots.exists, url: robots.url },
        sitemap,
        pagesQueued: 1,
        crawlMode: crawlEnabled,
        pagesCrawled: crawlContext.crawlPages.length,
        headingWarnings: context.headingWarnings
      },
      backlinkAnalysis,
      searchConsole,
      debug: context.debug,
      completedAt: new Date()
    });
    await PageAudit.deleteMany({ audit: auditId });
    await PageAudit.create({
      audit: auditId,
      url: context.finalUrl,
      statusCode: context.statusCode,
      title: context.pageMetrics.title,
      titleLength: context.pageMetrics.title.length,
      metaDescription: context.pageMetrics.metaDescription,
      metaDescriptionLength: context.pageMetrics.metaDescription.length,
      canonical: context.pageMetrics.canonical,
      robotsMeta: context.meta.robots,
      viewport: context.meta.viewport,
      h1: context.headings.h1,
      h2: context.headings.h2,
      h3: context.headings.h3,
      wordCount: context.pageMetrics.wordCount,
      readability: context.readability,
      internalLinks: context.links.filter((link) => link.internal).map((link) => link.url),
      externalLinks: context.links.filter((link) => !link.internal).map((link) => link.url),
      images: {
        total: context.images.length,
        missingAlt: context.images.filter((image) => image.alt === undefined).length,
        emptyAlt: context.images.filter((image) => image.alt === '').length,
        missingDimensions: context.images.filter((image) => !image.width || !image.height).length,
        notLazyLoaded: context.images.filter((image) => image.loading !== 'lazy').length,
        largeImages: []
      },
      resources: { cssCount: context.resources.stylesheets.length, jsCount: context.resources.scripts.length, failed: [] },
      structuredData: context.schema,
      socialTags: context.social.metaTags,
      hreflang: context.hreflang
    });
  } catch (error) {
    const mapped = mapAuditError(error);
    await Audit.findByIdAndUpdate(auditId, {
      status: 'failed',
      currentStep: 'Failed',
      error: mapped.message,
      crawl: { error: mapped.evidence }
    });
  }
}

export async function buildPreview(url) {
  const [page, robots, sitemap] = await Promise.all([fetchPage(url), getRobots(url), parseSitemap(url)]);
  const context = parseHtml({ ...page, robotsTxt: robots, sitemap, lighthouse: { available: false, reason: 'Preview mode does not run Lighthouse.' } });
  return {
    url: context.url,
    finalUrl: context.finalUrl,
    statusCode: context.statusCode,
    fetchMethod: context.fetchMethod,
    debug: context.debug,
    title: context.meta.title,
    metaDescription: context.meta.description,
    internalLinks: context.links.filter((link) => link.internal).slice(0, 20),
    externalLinks: context.links.filter((link) => !link.internal).slice(0, 20),
    pageMetrics: context.pageMetrics
  };
}
