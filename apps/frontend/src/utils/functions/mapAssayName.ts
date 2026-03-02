import { IAssay } from '../../types/Samples/Sample.types';

export function mapAssayName(assay: IAssay): string {
  if (assay.sampleType === 'panel' && !assay.biosampleType) return 'Targeted Panel';
  if (assay.sampleType === 'panel' && assay.biosampleType === 'dna') return 'Targeted DNA Panel';
  if (assay.sampleType === 'panel' && assay.biosampleType === 'rna') return 'Targeted RNA Panel';
  if (assay.sampleType === 'rnaseq') return 'RNA Sequencing';
  if (assay.sampleType === 'methylation') return 'DNA Methylation';
  return assay.sampleType.toUpperCase();
}
