import { VariantType } from '../../types/misc.types';

const mapMutationType = (type?: VariantType): string => {
  if (type === undefined) return '-';

  switch (type) {
    case 'RNA_SEQ':
      return 'RNA Expression';
    case 'RNA_CLASSIFIER':
      return 'RNA Classifier';

    case 'CYTOGENETICS':
    case 'CYTOGENETICS_CYTOBAND':
    case 'CYTOGENETICS_ARM':
      return 'Cytogenetics';

    case 'GERMLINE_CYTO_ARM':
    case 'GERMLINE_CYTO_CYTOBAND':
      return 'Germline Cytogenetics';

    case 'SV':
      return 'Fusion';

    case 'SNV':
      return 'Somatic SNV';

    case 'CNV':
      return 'Somatic CNV';

    case 'GERMLINE_SNV':
      return 'Germline SNV';

    case 'GERMLINE_CNV':
      return 'Germline CNV';

    case 'GERMLINE_SV':
      return 'Germline SV';

    case 'METHYLATION':
    case 'METHYLATION_MGMT':
    case 'METHYLATION_GENE':
    case 'METHYLATION_CLASSIFIER':
      return 'Methylation';

    case 'MUTATIONAL_SIG':
      return 'Mutational Signature';
    default:
      return type;
  }
};

export default mapMutationType;
