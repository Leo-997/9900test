import { SVVariants, IClinicalSVVariant } from '../../types/SV.types';

export function getCurationSVGenes(sv: SVVariants): string {
  const genes = [sv.startGene.gene];
  if (sv.svType !== 'DISRUPTION') {
    genes.push(sv.endGene.gene);
  }
  return genes.join('::');
}

export function getClinicalSVGenes(sv: IClinicalSVVariant): string {
  let svGene = `${sv.startGene}::${sv.endGene}`;
  if (sv.markDisrupted === 'Start' || sv.svType === 'DISRUPTION' || sv.markDisrupted === 'Yes') {
    svGene = sv.startGene.toString();
  }
  if (sv.markDisrupted === 'End' && sv.svType !== 'DISRUPTION') {
    svGene = sv.endGene.toString();
  }
  return svGene;
}
