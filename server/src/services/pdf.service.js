import PDFDocument from 'pdfkit';
import RuleResult from '../models/RuleResult.js';

function printable(value, fallback = 'Not available') {
  if (value === null || value === undefined || value === '') return fallback;
  return typeof value === 'string' ? value : String(value);
}

function headingText(values) {
  if (Array.isArray(values)) return values.map((value) => printable(value, '')).filter(Boolean).join(' | ') || 'Not found';
  return printable(values, 'Not found');
}

export async function buildAuditPdf(audit) {
  const rules = await RuleResult.find({ audit: audit._id }).sort({ categoryId: 1, ruleId: 1 });
  const failing = rules.filter((rule) => ['fail', 'warn'].includes(rule.status));
  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const done = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  doc.fontSize(22).text('Nexus SEO Auditor', { align: 'left' });
  doc.moveDown(0.5).fontSize(14).text(`SEO Audit Report: ${audit.url}`);
  doc.fontSize(10).fillColor('#555').text(`Final URL: ${audit.finalUrl || audit.url}`);
  doc.text(`Audit date: ${new Date(audit.createdAt).toLocaleString()}`).fillColor('#000');
  doc.moveDown();
  doc.fontSize(18).text(`Overall SEO Score: ${audit.overallScore ?? audit.scores?.overall ?? 0}/100`);
  doc.fontSize(13).text(`Grade: ${audit.grade || 'Not available'}`);
  doc.moveDown().fontSize(14).text('Summary');
  doc.fontSize(10).text(`Rules: ${audit.summary?.totalRules || 0} | Passed: ${audit.summary?.passed || 0} | Warnings: ${audit.summary?.warnings || 0} | Failed: ${audit.summary?.failed || 0} | Not available: ${audit.summary?.notAvailable || 0}`);
  doc.moveDown().fontSize(14).text('Category Scores');
  (audit.categories || []).forEach((category) => {
    doc.fontSize(9).text(`${printable(category.name, 'Uncategorized')}: ${category.score ?? 'n/a'}/100 (${category.passed ?? 0} pass, ${category.warnings ?? 0} warn, ${category.failed ?? 0} fail)`);
  });
  doc.moveDown().fontSize(14).text('Top Priority Issues');
  failing.slice(0, 10).forEach((item, index) => {
    doc.fontSize(10).text(`${index + 1}. [${printable(item.severity, item.status || 'issue').toUpperCase()}] ${printable(item.ruleName, item.ruleId || 'Unnamed rule')}`);
    doc.fontSize(9).fillColor('#555').text(`${printable(item.affectedUrl, audit.url)} - ${printable(item.recommendation, '')}`).fillColor('#000');
  });
  if (audit.scoreImprovementPlan?.length) {
    doc.addPage().fontSize(14).text('Score Improvement Plan');
    audit.scoreImprovementPlan.forEach((item) => {
      doc.fontSize(10).text(`${item.categoryName}: current ${item.currentScore ?? 'NA'}, target ${item.targetScore ?? 'NA'}, expected ${item.expectedScoreImpact}`);
      item.topFixes?.forEach((fix) => doc.fontSize(8).fillColor('#555').text(`- ${fix.title}: ${fix.recommendation}`).fillColor('#000'));
      doc.moveDown(0.5);
    });
  }
  doc.addPage().fontSize(14).text('Heading Structure');
  Object.entries(audit.headingStructure || {}).forEach(([level, values]) => doc.fontSize(9).text(`${level.toUpperCase()}: ${headingText(values)}`));
  doc.moveDown().fontSize(14).text('Social Preview');
  doc.fontSize(9).text(JSON.stringify(audit.socialPreview || {}, null, 2));
  doc.addPage().fontSize(14).text('Rule Result Appendix');
  rules.forEach((rule) => {
    doc.fontSize(8).text(`${printable(rule.ruleId, 'rule')} [${printable(rule.status, 'unknown')}] ${printable(rule.ruleName, 'Unnamed rule')}: ${printable(rule.message, '')}`);
  });
  doc.end();
  return done;
}
