export const getSlideNameMapper = (
  entityId?: string,
  slideTitle?: string,
): string => {
  switch (entityId) {
    case 'CLINICAL_INFORMATION':
      return 'Clinical Information';
    case 'DISCUSSION':
      return 'Discussion';
    case 'MOLECULAR_FINDINGS':
      return 'Molecular Findings';
    case 'OVERVIEW':
      return 'Slides Overview';
    case 'SAMPLE':
      return 'Sample';
    default:
      return slideTitle || 'Untitled slide';
  }
};
