export function getPreservationText(preservation: string): string {
  switch (preservation.toLowerCase()) {
    case 'fresh':
      return 'Fresh';
    case 'ffpe_block':
      return 'FFPE Block';
    case 'ffpe_slide':
      return 'FFPE Slide';
    case 'ffpe':
      return 'FFPE';
    case 'snap_frozen':
      return 'Snap Frozen';
    case 'cryopreserved':
      return 'Cryopreserved';
    default:
      return 'Other';
  }
}
