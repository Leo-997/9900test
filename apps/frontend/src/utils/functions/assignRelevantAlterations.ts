import { geneAlterationTypes, nonGeneAlterationTypes } from '../../constants/alterations';
import {
  IMolecularAlterationDetail,
} from '../../types/MTB/MolecularAlteration.types';

export interface IGeneAndCytoTypeAlterations {
  sortedGeneTypeAlterations: IMolecularAlterationDetail[];
  sortedCytogeneticsAlterations: IMolecularAlterationDetail[];
}
export interface INonGeneTypeAlterationsObject {
  sortedMethylationAlterations: IMolecularAlterationDetail[];
  sortedMutationalSignature: IMolecularAlterationDetail[];
  sortedRnaClassifierAlterations: IMolecularAlterationDetail[];
}

export interface IRelevantAlterations {
  geneAndCytoAlterations: IMolecularAlterationDetail[];
  nonGeneAlterations: IMolecularAlterationDetail[];
  nonGeneAlterationsObject: INonGeneTypeAlterationsObject;
}

export const assignRelevantTypeAlterations = (
  molAlterations: IMolecularAlterationDetail[],
): IRelevantAlterations => {
  const cytogeneticsAlterations: IMolecularAlterationDetail[] = [];
  const methylationClassifierAlterations: IMolecularAlterationDetail[] = [];
  const methylationMGMTAlterations: IMolecularAlterationDetail[] = [];
  const mutationalSignature: IMolecularAlterationDetail[] = [];
  const rnaClassifierAlterations: IMolecularAlterationDetail[] = [];

  const tempGeneAlterations = molAlterations?.filter(
    ({ mutationType }) => geneAlterationTypes.includes(mutationType),
  );

  const tempNonGeneAlterations = molAlterations?.filter(
    ({ mutationType }) => nonGeneAlterationTypes.includes(mutationType),
  );

  // Assign alterations to relevant buckets
  tempNonGeneAlterations.forEach((item) => {
    switch (item.mutationType) {
      case 'CYTOGENETICS_ARM':
      case 'CYTOGENETICS_CYTOBAND':
      case 'GERMLINE_CYTO_ARM':
      case 'GERMLINE_CYTO_CYTOBAND':
        cytogeneticsAlterations.push(item);
        break;

      case 'METHYLATION_MGMT':
        methylationMGMTAlterations.push(item);
        break;

      case 'METHYLATION_CLASSIFIER':
        methylationClassifierAlterations.push(item);
        break;

      case 'RNA_CLASSIFIER':
        rnaClassifierAlterations.push(item);
        break;

      case 'MUTATIONAL_SIG':
        mutationalSignature.push(item);
        break;
      default:
    }
  });

  const sortedGeneTypeAlterations = tempGeneAlterations.sort(
    (a, b) => a.gene.localeCompare(b.gene),
  );

  // Sort the methylation alterations with MGMT and classifier
  const sortedMethylationAlterations = [
    ...methylationMGMTAlterations.sort((a, b) => a.alteration.localeCompare(b.alteration)),
    ...methylationClassifierAlterations.sort((a, b) => a.alteration.localeCompare(b.alteration)),
  ];

  const sortedRnaClassifierAlterations = rnaClassifierAlterations.sort(
    (a, b) => a.alteration.localeCompare(b.alteration),
  );

  // Sort the cytogenetics alterations
  const sortedCytogeneticsAlterations = cytogeneticsAlterations.sort(
    (a, b) => a.alteration.localeCompare(b.alteration),
  );

  // Sort the mutational signature
  const sortedMutationalSignature = mutationalSignature.sort(
    (a, b) => a.alteration.localeCompare(b.alteration),
  );

  // return with each group's internal item alterations ascending sort order

  const geneAndCytoAlterations = [
    ...sortedGeneTypeAlterations,
    ...sortedCytogeneticsAlterations,
  ];

  const nonGeneAlterations = [
    ...sortedMethylationAlterations,
    ...sortedRnaClassifierAlterations,
    ...sortedMutationalSignature,
  ];

  const nonGeneAlterationsObject = {
    sortedMethylationAlterations,
    sortedMutationalSignature,
    sortedRnaClassifierAlterations,
  };

  return {
    geneAndCytoAlterations,
    nonGeneAlterations,
    nonGeneAlterationsObject,
  };
};
