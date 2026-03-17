import { ISNV } from 'Models/Curation/SNV/SNV.model';
import md5ToUUID from 'Utilities/transformers/md5ToUUID.util';
import md5 = require('md5');

export default function mapToSNV(
  geneId: number,
  header: string[],
  line: string[],
): ISNV {
  const CPRA = [
    line[header.indexOf('Chr')],
    line[header.indexOf('Pos')],
    line[header.indexOf('Ref')],
    line[header.indexOf('Alt')],
  ];
  const variantString = CPRA.join('|');
  const utf8 = Buffer.from(variantString, 'utf-8');
  const hash = md5(utf8);

  return {
    variant_id: md5ToUUID(hash),
    gene_id: geneId,
    chr: line[header.indexOf('Chr')],
    pos: line[header.indexOf('Pos')],
    ref: line[header.indexOf('Ref')],
    alt: line[header.indexOf('Alt')],
    transcript: line[header.indexOf('Transcript')],
    exon: line[header.indexOf('Exon')],
    consequence: line[header.indexOf('Impact')],
    hgvs: line[header.indexOf('HGVS')],
    hotspot: line[header.indexOf('')],
  };
}
