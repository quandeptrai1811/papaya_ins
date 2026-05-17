export function computeKpis(claims) {
  const total = claims.length;
  if (total === 0) return { total: 0, approvalRate: 0, avgProcessing: 0, totalApproved: 0, avgClaim: 0 };

  const approved = claims.filter(c => c.status === 'APPROVED');
  const approvalRate = ((approved.length / total) * 100).toFixed(1);

  const withProcessing = claims.filter(c => c.processing_days != null);
  const avgProcessing = withProcessing.length
    ? (withProcessing.reduce((s, c) => s + c.processing_days, 0) / withProcessing.length).toFixed(1)
    : 0;

  const totalApproved = claims.reduce((s, c) => s + (c.approved_amount || 0), 0);
  const avgClaim = (claims.reduce((s, c) => s + c.submitted_amount, 0) / total).toFixed(0);

  return { total, approvalRate, avgProcessing, totalApproved, avgClaim };
}
