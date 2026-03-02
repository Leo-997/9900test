import { corePalette } from '@/themes/colours';
import { VariantType } from '../../types/misc.types';

export const getColourByMutationType = (
  mutationType: VariantType,
): string => {
  switch (mutationType) {
    case 'GERMLINE_CNV':
    case 'GERMLINE_SNV':
    case 'GERMLINE_SV':
    case 'GERMLINE_CYTO_ARM':
    case 'GERMLINE_CYTO_CYTOBAND':
      return corePalette.orange100;

    case 'METHYLATION':
    case 'METHYLATION_MGMT':
    case 'METHYLATION_CLASSIFIER':
      return corePalette.turquoise100;

    case 'CYTOGENETICS':
    case 'CYTOGENETICS_CYTOBAND':
    case 'CYTOGENETICS_ARM':
      return corePalette.purple100;

    case 'MUTATIONAL_SIG':
      return corePalette.violet100;
    default:
      return corePalette.white;
  }
};
