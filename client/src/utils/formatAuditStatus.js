export function formatAuditStatus(score) {
  if (score == null || score === 'NA') return 'Not Available';
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}
