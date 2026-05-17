export function filterData(claims, filters) {
  const { dateFrom, dateTo, claimType, insurer, country, status } = filters;
  return claims.filter(c => {
    if (dateFrom && c.submitted_date < dateFrom) return false;
    if (dateTo && c.submitted_date > dateTo) return false;
    if (claimType && c.claim_type !== claimType) return false;
    if (insurer && c.insurer !== insurer) return false;
    if (country && c.country !== country) return false;
    if (status && c.status !== status) return false;
    return true;
  });
}
