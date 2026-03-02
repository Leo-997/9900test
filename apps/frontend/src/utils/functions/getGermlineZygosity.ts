import { IGermlineSNV, IReportableGermlineSNV, Zygosity } from '../../types/SNV.types';

export function getGermlineZygosity(snv: IGermlineSNV | IReportableGermlineSNV): Zygosity {
  if (!snv.genotype) {
    return 'Not determined';
  }
  const [left, right] = snv.genotype.split('/');
  if (snv.zygosity) return snv.zygosity;
  return left !== right
    ? 'Heterozygous'
    : 'Homozygous';
}
