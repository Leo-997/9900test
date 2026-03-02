import { cnvCNTypeOptions, cytoCNTypeOptions } from '../../constants/options';
import { IGermlineCNV, ISomaticCNV } from '../../types/CNV.types';
import {
  IParsedCytogeneticsData,
  ISampleCytoband,
} from '../../types/Cytogenetics.types';
import {
  IMethylationData,
  IMethylationGeneData,
} from '../../types/Methylation.types';
import { ISignatureData } from '../../types/MutationalSignatures.types';
import { IRNAClassifierTable, ISomaticRna } from '../../types/RNAseq.types';
import { IReportableGermlineSNV, ISomaticSnv } from '../../types/SNV.types';
import { IGermlineSV, ISomaticSV } from '../../types/SV.types';
import getCNVCopyNumber from '../functions/getCNVCopyNumber';
import { getCytobandFormat } from '../functions/getCytobandFormat';
import { getGermlineZygosity } from '../functions/getGermlineZygosity';
import { getCurationSVGenes } from '../functions/getSVGenes';
import { mapToReadingFrame } from '../functions/inframeUtils';
import { toFixed } from '../math/toFixed';
import { toFixedNoRounding } from '../math/toFixedNoRounding';

export function getSomaticSnvSummary(snv: ISomaticSnv): string {
  const dnaVaf = snv.altad && snv.depth ? snv.altad / snv.depth : undefined;

  return `${snv.hgvs}.${dnaVaf ? ` VAF ${toFixed(dnaVaf * 100, 2)}%` : ''} - ${snv.zygosity}. ${
    snv.pathclass ? `${snv.pathclass}. ` : ''
  }${
    !(snv.rnaVafNo === undefined || snv.rnaVafNo === null)
      ? `RNA VAF ${toFixed(snv.rnaVafNo * 100, 2)}%.`
      : ''
  }
  ${
  !(snv.rnaAltad === undefined || snv.rnaAltad === null)
    ? ` (${snv.rnaAltad}/${snv.rnaDepth})`
    : ''
}
  ${
  !(snv.rnaImpact === undefined || snv.rnaImpact === null)
    ? ` ${snv.rnaImpact}`
    : ''
}`;
}

export function getFusionSummary(sv: ISomaticSV | IGermlineSV): string {
  const vaf = sv.startAf && sv.endAf ? `(VAF: ${toFixed((sv.startAf + sv.endAf) / 2, 2)})` : '';

  let displayedType = '';

  if (sv.markDisrupted && sv.markDisrupted !== 'No') {
    if (sv.markDisrupted === 'Yes') {
      displayedType = `Type: ${sv.svType} (disrupted).`;
    } else {
      const plural = sv.markDisrupted === 'Both' ? 's' : '';
      displayedType = `Type: ${sv.svType} (${sv.markDisrupted.toLowerCase()} gene${plural} disrupted).`;
    }
  } else if (sv.svType) {
    displayedType = `Type: ${sv.svType}.`;
  }
  return `${getCurationSVGenes(sv)} ${vaf} - ${
    displayedType
  } ${
    sv.pathclass ? `Pathclass: ${sv.pathclass}.` : ''
  } ${
    sv.inframe ? `${mapToReadingFrame(sv.inframe)}.` : ''
  }`;
}

export function getCnvSummary(cnv: ISomaticCNV, isRnaSeq: boolean): string | undefined {
  function getCopies(x: number): string {
    if (x === 1) {
      return '1 copy';
    }

    return `${toFixed(x, 2)} copies`;
  }

  const cn = getCNVCopyNumber(cnv);

  const fcText = cnv.fc ? toFixed(cnv.fc, 2) : '-';
  const zScoreText = cnv.fc ? toFixed(cnv.rnaZScore, 2) : '-';
  const rnaText = isRnaSeq ? `[FC: ${fcText}, z-score: ${zScoreText}]` : '(no RNA-seq performed)';
  const cnType = cnvCNTypeOptions.find((o) => o.value === cnv.cnType)?.name;
  return `${cnv.gene} ${cnType} (${getCopies(cn)}) ${rnaText}`;
}

export function getCytobandSummary(
  cyto: IParsedCytogeneticsData,
  cytobands: ISampleCytoband[],
): string[][] {
  const pCnType = cytoCNTypeOptions.find((o) => o.value === cyto.p.cnType)?.name;
  const qCnType = cytoCNTypeOptions.find((o) => o.value === cyto.q.cnType)?.name;
  const summaryStrings: string[][] = [];
  if (cyto.p.classification) {
    summaryStrings.push([
      `${cyto.chr}p`,
      `${pCnType}`,
      `(${toFixed(Math.max(cyto.p.avgCN, 0), 2)})`,
      `${cyto.p.classification}`,
    ]);
  }
  if (cyto.q.classification) {
    summaryStrings.push([
      `${cyto.chr}q`,
      `${qCnType}`,
      `(${toFixed(Math.max(cyto.q.avgCN, 0), 2)})`,
      `${cyto.q.classification}`,
    ]);
  }
  for (const c of cytobands) {
    const cnType = cytoCNTypeOptions.find((o) => o.value === c.cnType)?.name;
    if (c.classification) {
      summaryStrings.push([
        `${getCytobandFormat(c.cytoband)}`,
        `${cnType || ''}`,
        `(${toFixed(Math.max(c.customCn ?? c.avgCN as number, 0), 2)})`,
        `${c.classification}`,
      ]);
    }
  }
  return summaryStrings;
}

export function getRNASummary(rna: ISomaticRna): string {
  const foldChange = Number.isNaN(parseFloat(rna.foldChange))
    ? '-'
    : toFixed(parseFloat(rna.foldChange), 2);
  const meanZScore = Number.isNaN(parseFloat(rna.meanZScore))
    ? '-'
    : toFixed(parseFloat(rna.meanZScore), 2);
  return `${rna.gene} (FC ${foldChange}; z-score ${meanZScore})`;
}

function formatString(text: string): string {
  if (!text) return '';
  const spacedText = text.replace(/_/g, ' ');
  return spacedText.charAt(0).toUpperCase() + spacedText.slice(1);
}

export function getRNAClassifierSummary(rna: IRNAClassifierTable): string {
  const classifier = formatString(rna.classifier);
  const label = rna.predictionLabel || rna.prediction;
  const prediction = label.replace(/_/g, ' ');

  return `${classifier} prediction: ${prediction} (${rna.score})`;
}

export function getMethylationSummary(data: {
  meth?: IMethylationData[];
  genes?: IMethylationGeneData[];
}): string[] {
  const interpretationString: string[] = [];
  data.meth?.forEach((m) => {
    const score = !m.score
      ? '-'
      : toFixedNoRounding(m.score, 2);
    interpretationString.push(`${m.classifierName} version ${m.version}`);
    interpretationString.push(`${m.interpretation}: ${m.groupName} (${score})`);
  });

  data.genes?.forEach((g) => {
    interpretationString.push(`${g.gene} promoter ${g.status}`);
  });

  return [...interpretationString];
}

export function getGermlineSnvSummary(snv: IReportableGermlineSNV): string {
  const dnaVaf = snv.altad && snv.depth ? snv.altad / snv.depth : undefined;
  return `${snv.hgvs}.${dnaVaf ? ` VAF ${toFixed(dnaVaf * 100, 2)}` : ''} ${
    getGermlineZygosity(snv)
  }. ${snv.pathclass || ''}`;
}

export function getGermlineCnvSummary(cnv: IGermlineCNV): string {
  return `${cnv.gene} (${cnv.averageCN}) ${cnv.cnType}`;
}

export function getMutSigSummary(mutSig: ISignatureData): string {
  return `${mutSig.signature}: ${toFixed(mutSig.contribution * 100, 2)}%`;
}
