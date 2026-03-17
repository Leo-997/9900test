export function getCytobandFormat(cytoband: string): string {
  const parts = cytoband.split(';');
  if (parts.length > 1) {
    return `${parts[0]} - ${parts[parts.length - 1]}`;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return cytoband;
}
