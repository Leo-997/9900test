export function getProteinChangeFromHgvs(hgvs?: string): string {
  if (!hgvs) return '-';

  const matches = hgvs.match(
    /(.+)\(p\.(.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\)/,
  );
  if (matches && matches[2]) return matches[2];
  return '-';
}
