import { IGermlineSnv } from 'Models/Curation/GermlineSnv/CuratedSampleGermlineSnv.model';
import md5ToUUID from 'Utilities/transformers/md5ToUUID.util';
import md5 = require('md5');

export default function mapToGermlineSNV(
  biosampleId: string,
  header: string[],
  line: string[],
): IGermlineSnv {
  const CPRA = [
    line[header.indexOf('Chr')],
    line[header.indexOf('Pos')],
    line[header.indexOf('Ref')],
    line[header.indexOf('Alt')],
  ];
  const variantString = CPRA.join('|');
  const utf8 = Buffer.from(variantString, 'utf-8');
  const hash = md5(utf8);

  const getNumberCol = (colName: string): number => {
    const value = parseFloat(line[header.indexOf(colName)]);
    return !Number.isNaN(value) ? value : null;
  };

  return {
    variantId: md5ToUUID(hash),
    biosampleId,
    geneId: 0,
    gene: line[header.indexOf('Gene')],
    hgvs: line[header.indexOf('HGVS')],
    chr: line[header.indexOf('Chr')],
    pos: getNumberCol('Pos'),
    snvRef: line[header.indexOf('Ref')],
    alt: line[header.indexOf('Alt')],
    pathclass: null,
    platforms: 'W',
    sampleCount: 0,
    cancerTypes: 0,
    geneLists: '',
    cosmicId: line[header.indexOf('COSMIC Coding ID')],
    pecan: null,
    classification: null,
    reportable: null,
    targetable: null,
    altad: getNumberCol(`AD VAF ${biosampleId}`),
    depth: getNumberCol(`DP VAF ${biosampleId}`),
    genotype: line[header.indexOf(`GT ${biosampleId}`)],
    consequence: line[header.indexOf('Impact')],
    phenotype: null, // from database
    researchCandidate: null, // from database
    impact: line[header.indexOf('Impact Severity')],
    gnomadAFGenomePopmax: getNumberCol('gnomad_af'), // gnomad_col,
    mgrbAC: getNumberCol('mgrb_ac'),
    mgrbAN: getNumberCol('MGRB AN'),
    failed: line[header.indexOf('Filter')] !== 'PASS',
    heliumScore: 0,
    heliumReason: '',
    reportedCount: 0,
    targetableCount: 0,
  };
}
