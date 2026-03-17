import { DisruptedTypes, SvType } from '@/types/SV.types';
import { IMolecularAlterationDetail } from '../../types/MTB/MolecularAlteration.types';
import { getClinicalSVGenes } from './getSVGenes';

export const getGeneOrNonGene = (
  alteration: IMolecularAlterationDetail,
): string => {
  try {
    switch (alteration.mutationType) {
      case 'CYTOGENETICS_CYTOBAND':
      case 'CYTOGENETICS_ARM':
      case 'GERMLINE_CYTO_CYTOBAND':
      case 'GERMLINE_CYTO_ARM':
        return `${alteration.additionalData?.chromosome}${
          alteration.additionalData?.arm
        }`;
      case 'METHYLATION_MGMT':
        return 'MGMT';

      case 'METHYLATION_CLASSIFIER':
      case 'RNA_CLASSIFIER':
        return `${alteration.additionalData?.classifier || '-'}`;

      case 'MUTATIONAL_SIG':
        return alteration.alteration.replace('nature ', ' ');

      case 'SV':
      case 'GERMLINE_SV':
        if (alteration.additionalData) {
          return getClinicalSVGenes({
            startGene: alteration.additionalData.startGene.toString(),
            endGene: alteration.additionalData.endGene.toString(),
            markDisrupted: alteration.additionalData.markDisrupted as DisruptedTypes,
            svType: alteration.additionalData.svType as SvType,
          });
        }
        return alteration.gene;
      case 'TMB':
      case 'IPASS':
        return alteration.description;
      default:
        return alteration.gene;
    }
  } catch (error) {
    return '-';
  }
};
