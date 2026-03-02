import { VariantType } from '../../types/misc.types';

export default function getVariantPriority(variantType: VariantType): number {
  switch (variantType) {
    case 'SNV':
    case 'GERMLINE_SNV':
      return 1;
    case 'SV':
      return 2;
    case 'CNV':
    case 'GERMLINE_CNV':
      return 3;
    case 'CYTOGENETICS':
    case 'CYTOGENETICS_ARM':
    case 'CYTOGENETICS_CYTOBAND':
    case 'GERMLINE_CYTO':
    case 'GERMLINE_CYTO_ARM':
    case 'GERMLINE_CYTO_CYTOBAND':
      return 4;
    case 'RNA_SEQ':
      return 5;
    case 'METHYLATION':
    case 'METHYLATION_CLASSIFIER':
    case 'METHYLATION_GENE':
      return 6;
    case 'METHYLATION_MGMT':
      return 7;
    case 'MUTATIONAL_SIG':
      return 8;
    default:
      return 9;
  }
}
