import Audit from '../models/Audit.js';
import PageAudit from '../models/PageAudit.js';
import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import RuleResult from '../models/RuleResult.js';
import CategoryResult from '../models/CategoryResult.js';
import { runAudit, buildPreview } from '../services/crawler.service.js';
import { buildAuditPdf } from '../services/pdf.service.js';
import { fetchWebsiteHtml, getFetchDebugSummary } from '../services/fetchPage.service.js';

function normalizeSocialPreview(socialPreview = {}, pageMetrics = {}) {
  const metaTags = socialPreview.metaTags || {};
  const preview = socialPreview.preview || {};
  const previewTitle = preview.title === 'Not found' ? '' : preview.title;
  const previewDescription = preview.description === 'Not found' ? '' : preview.description;
  return {
    ...socialPreview,
    metaTags,
    preview: {
      ...preview,
      title: metaTags['og:title'] || previewTitle || pageMetrics.title || 'Not found',
      description: metaTags['og:description'] || previewDescription || pageMetrics.metaDescription || 'Not found'
    }
  };
}

export async function startAudit(req, res) {
  const project = req.body.projectId ? await Project.findById(req.body.projectId) : null;
  const crawlMode = req.body.crawlMode === undefined ? undefined : Boolean(req.body.crawlMode);
  const maxPages = req.body.maxPages ? Number(req.body.maxPages) : undefined;
  const audit = await Audit.create({
    project: project?._id,
    url: req.normalizedUrl,
    status: 'queued',
    currentStep: 'Queued'
  });
  runAudit({ auditId: audit._id, url: req.normalizedUrl, crawlMode, maxPages });
  res.status(202).json({ auditId: audit._id, status: audit.status });
}

export async function getAudit(req, res) {
  const audit = await Audit.findById(req.params.auditId);
  if (!audit) return res.status(404).json({ message: 'Audit not found' });
  const [pages, issues, ruleResults, categoryResults] = await Promise.all([
    PageAudit.find({ audit: audit._id }).sort({ createdAt: 1 }),
    Issue.find({ audit: audit._id }).sort({ severity: 1, createdAt: 1 }),
    RuleResult.find({ audit: audit._id }).sort({ categoryId: 1, ruleId: 1 }),
    CategoryResult.find({ audit: audit._id }).sort({ weight: -1 })
  ]);
  const { debug, ...auditObject } = audit.toObject();
  const pageMetrics = auditObject.pageMetrics || {};
  const fallbackPageMetrics = {
    title: pageMetrics.title || pages[0]?.title || '',
    metaDescription: pageMetrics.metaDescription || pages[0]?.metaDescription || ''
  };
  res.json({
    ...auditObject,
    url: auditObject.url,
    finalUrl: auditObject.finalUrl,
    statusCode: auditObject.statusCode,
    fetchMethod: auditObject.fetchMethod,
    overallScore: auditObject.overallScore,
    grade: auditObject.grade,
    createdAt: auditObject.createdAt,
    summary: auditObject.summary,
    categories: auditObject.categories || [],
    headingStructure: auditObject.headingStructure || {},
    socialPreview: normalizeSocialPreview(auditObject.socialPreview, fallbackPageMetrics),
    pageMetrics,
    scoreImprovementPlan: auditObject.scoreImprovementPlan || [],
    audit: process.env.NODE_ENV === 'production' ? auditObject : { ...auditObject, debug },
    debug: process.env.NODE_ENV === 'production' ? undefined : debug,
    pages,
    issues,
    ruleResults,
    categoryResults
  });
}

export async function getProjectAudits(req, res) {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(await Audit.find({ project: project._id }).sort({ createdAt: -1 }));
}

export async function deleteAudit(req, res) {
  const audit = await Audit.findByIdAndDelete(req.params.auditId);
  if (!audit) return res.status(404).json({ message: 'Audit not found' });
  await Promise.all([
    PageAudit.deleteMany({ audit: audit._id }),
    Issue.deleteMany({ audit: audit._id }),
    RuleResult.deleteMany({ audit: audit._id }),
    CategoryResult.deleteMany({ audit: audit._id })
  ]);
  res.json({ message: 'Audit deleted' });
}

export async function getAuditPdf(req, res) {
  const audit = await Audit.findById(req.params.auditId);
  if (!audit) return res.status(404).json({ message: 'Audit not found' });
  const buffer = await buildAuditPdf(audit);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="nexus-seo-audit-${audit._id}.pdf"`);
  res.send(buffer);
}

export async function preview(req, res) {
  try {
    res.json(await buildPreview(req.normalizedUrl));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to crawl website',
      error: error.message,
      suggestion: 'Check if the URL is valid, reachable from the server, or blocked by the target website.'
    });
  }
}

export async function status(req, res) {
  const audit = await Audit.findById(req.params.auditId).select('status progress currentStep error');
  if (!audit) return res.status(404).json({ message: 'Audit not found' });
  res.json(audit);
}

export async function debugCrawl(req, res) {
  try {
    const page = await fetchWebsiteHtml(req.query.url);
    res.json(getFetchDebugSummary(page));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to crawl website',
      error: error.message,
      suggestion: 'Check if the URL is valid, reachable from the server, or blocked by the target website.'
    });
  }
}
