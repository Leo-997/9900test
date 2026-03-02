import { IGermlineCNV, ISomaticCNV } from '../../types/CNV.types';
import { IGermlineSNV, IReportableGermlineSNV, ISomaticSnv } from '../../types/SNV.types';
import { IParsedCytogeneticsData } from '../../types/Cytogenetics.types';
import { ISomaticRna } from '../../types/RNAseq.types';
import { IGermlineSV, ISomaticSV } from '../../types/SV.types';
import { IMethylationGeneData } from '../../types/Methylation.types';

type GeneVariants =
  | ISomaticSnv
  | ISomaticCNV
  | ISomaticSV
  | IGermlineSNV
  | IReportableGermlineSNV
  | IGermlineCNV
  | IGermlineSV
  | ISomaticRna
  | IMethylationGeneData;
type ChromVariants = IParsedCytogeneticsData;

export const filterGene = (filter: string | undefined) => (variant: GeneVariants): boolean => {
  if (!filter) {
    return true;
  }

  if ('gene' in variant) {
    if (variant.gene) {
      return variant.gene.toLowerCase() === filter.toLowerCase();
    }
    return false;
  }
  if ('startGene' in variant) {
    const sv: ISomaticSV | IGermlineSV = variant;
    return (
      sv.startGene?.gene?.toLowerCase() === filter.toLowerCase()
        || sv.endGene?.gene?.toLowerCase() === filter.toLowerCase()
    );
  }

  return false;
};

export const filterChromosome = (
  filter: string | undefined,
) => (variant: ChromVariants): boolean => {
  const chromConvert = (chr: string): string => chr
    .toLowerCase()
    .replace('chromosome', '')
    .replace('chrom', '')
    .replace('chr', '')
    .replace(/ /g, '');

  if (filter) {
    return chromConvert(variant.chr) === chromConvert(filter);
  }
  return true;
};
