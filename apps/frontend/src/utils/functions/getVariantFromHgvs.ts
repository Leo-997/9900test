export function getVariantFromHgvs(hgvs?: string): string {
  if (!hgvs) return '-';

  const matches = hgvs.match(
    /(.+)\(.*\):(c\.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+).*/,
  );
  if (matches && matches[1] && matches[2]) return `${matches[1]}: ${matches[2]}`;
  return '-';
}
