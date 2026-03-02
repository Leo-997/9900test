export function getCytobandRange(range: 'start' | 'end', cytoband: string): string {
  const parts = cytoband.split(';');
  if (range === 'start') {
    return parts[0];
  }
  if (range === 'end' && parts.length > 1) {
    return parts[parts.length - 1];
  }
  return '';
}
