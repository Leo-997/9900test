import { ISomaticCNV } from '../../types/CNV.types';

export default function getCNVCopyNumber(cnv: ISomaticCNV): number {
  let cn = 0;
  if (cnv.cnType?.includes('GERMLINE')) {
    cn = cnv.averageCN;
  } else if (cnv.cnType === 'AMP') {
    cn = cnv.maxCn;
  } else if (cnv.cnType?.includes('DEL')) {
    cn = cnv.minCn;
  } else {
    cn = cnv.averageCN;
  }

  return Math.max(0, cn);
}
