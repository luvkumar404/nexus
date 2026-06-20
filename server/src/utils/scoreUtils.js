export function statusToScore(status) {
  if (status === 'pass') return 100;
  if (status === 'warn') return 50;
  if (status === 'fail') return 0;
  return null;
}

export function gradeFromScore(score = 0) {
  if (score >= 90) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  return score >= 25 ? 'D' : 'F';
}

export function labelFromScore(score) {
  if (score == null) return 'Not Available';
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}
