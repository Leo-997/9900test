import { ClinicalThreadEntityTypes } from '@/types/Comments/ClinicalComments.types';
import { CurationThreadEntityTypes } from '@/types/Comments/CurationComments.types';

const mapEntityType = (type?: CurationThreadEntityTypes | ClinicalThreadEntityTypes): string => {
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

    case 'GERMLINE_CYTO':
    case 'GERMLINE_CYTO_CYTOBAND':
    case 'GERMLINE_CYTO_ARM':
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

    case 'SAMPLE':
      return 'Sample';

    case 'MOLECULAR_REPORT':
      return 'Molecular Report';

    case 'MTB_REPORT':
      return 'MTB Report';

    case 'GERMLINE_REPORT':
      return 'Germline Report';

    case 'PRECLINICAL_REPORT':
      return 'Preclinical Report';

    case 'INTERPRETATION':
      return 'Interpretation';

    case 'SLIDE':
      return 'Slide';

    default:
      return type;
  }
};

export default mapEntityType;
