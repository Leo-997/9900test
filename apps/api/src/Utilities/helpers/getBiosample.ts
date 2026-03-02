import knex from 'knex';
import { IBiosample } from 'Models/Analysis/Biosamples.model';
import { VariantType } from 'Models/Misc/VariantType.model';
import { knexConnectionConfig } from '../../../knexfile';

const zdKnex = knex(knexConnectionConfig);

export function getTumourBiosample(
  biosamples: IBiosample[],
): IBiosample | IBiosample[] {
  const wgsTumour = biosamples.filter(
    (biosample) => (
      biosample.sampleType === 'wgs'
      && biosample.biosampleStatus === 'tumour'
      && biosample.biosampleType === 'dna'
    ),
  );

  const panelTumour = biosamples.filter(
    (biosample) => (
      biosample.sampleType === 'panel'
      && biosample.biosampleStatus === 'tumour'
      && biosample.biosampleType === 'dna'
    ),
  );

  if ((wgsTumour.length + panelTumour.length) > 1) {
    return [
      ...wgsTumour,
      ...panelTumour,
    ];
  }

  return wgsTumour[0] || panelTumour[0];
}

export function getGermlineBiosample(
  biosamples: IBiosample[],
): IBiosample | IBiosample[] {
  const wgsNormal = biosamples.filter(
    (biosample) => (
      biosample.sampleType === 'wgs'
      && biosample.biosampleStatus === 'normal'
      && biosample.biosampleType === 'dna'
    ),
  );

  const panelNormal = biosamples.filter(
    (biosample) => (
      biosample.sampleType === 'panel'
      && biosample.biosampleStatus === 'normal'
      && biosample.biosampleType === 'dna'
    ),
  );

  if ((wgsNormal.length + panelNormal.length) > 1) {
    return [
      ...wgsNormal,
      ...panelNormal,
    ];
  }

  return wgsNormal[0] || panelNormal[0];
}

export function getRnaBiosample(
  biosamples: IBiosample[],
): IBiosample | IBiosample[] {
  const rna = biosamples.filter(
    (biosample) => (
      biosample.sampleType === 'rnaseq'
      && biosample.biosampleType === 'rna'
    ),
  );

  const panelRNA = biosamples.filter(
    (biosample) => (
      biosample.sampleType === 'panel'
      && biosample.biosampleType === 'rna'
    ),
  );

  if ((rna.length + panelRNA.length) > 1) {
    return [
      ...rna,
      ...panelRNA,
    ];
  }

  return rna[0] || panelRNA[0];
}

export function getMethBiosample(
  biosamples: IBiosample[],
): IBiosample | IBiosample[] {
  const methBiosamples = biosamples.filter(
    (biosample) => biosample.sampleType === 'methylation',
  );

  if (methBiosamples.length > 1) {
    return methBiosamples;
  }

  return methBiosamples[0];
}

export function getHtsBiosample(
  biosamples: IBiosample[],
): IBiosample | IBiosample[] {
  const htsBiosamples = biosamples.filter(
    (biosample) => biosample.sampleType === 'hts',
  );

  if (htsBiosamples.length > 1) {
    return htsBiosamples;
  }

  return htsBiosamples[0];
}

export async function getBiosample(
  variantType: VariantType,
  analysisSetId: string,
  biosamples: IBiosample[],
  variantId: string,
  additionalCondition?: Record<string, unknown>,
): Promise<IBiosample> {
  const entityTypeBiosampleMap: Record<VariantType, IBiosample | IBiosample[]> = {
    SNV: getTumourBiosample(biosamples),
    CNV: getTumourBiosample(biosamples),
    SV: getTumourBiosample(biosamples),
    GERMLINE_CNV: getGermlineBiosample(biosamples),
    GERMLINE_SNV: getGermlineBiosample(biosamples),
    GERMLINE_SV: getGermlineBiosample(biosamples),
    RNA_SEQ: getRnaBiosample(biosamples),
    RNA_CLASSIFIER: getRnaBiosample(biosamples),
    CYTOGENETICS: getTumourBiosample(biosamples),
    GERMLINE_CYTO: getGermlineBiosample(biosamples),
    METHYLATION: getMethBiosample(biosamples),
    MUTATIONAL_SIG: getTumourBiosample(biosamples),
    HTS: getHtsBiosample(biosamples),
    HTS_COMBINATION: getHtsBiosample(biosamples),
  };

  const tablesMap: Record<VariantType, string> = {
    SNV: 'zcc_curated_sample_somatic_snv',
    CNV: 'zcc_curated_sample_somatic_cnv',
    SV: 'zcc_curated_sample_somatic_sv',
    GERMLINE_CNV: 'zcc_curated_sample_germline_cnv',
    GERMLINE_SNV: 'zcc_curated_sample_germline_snv',
    GERMLINE_SV: 'zcc_curated_sample_germline_sv',
    RNA_SEQ: 'zcc_curated_sample_somatic_rnaseq',
    RNA_CLASSIFIER: 'zcc_curated_sample_somatic_rnaseq_classification',
    CYTOGENETICS: 'zcc_curated_sample_somatic_armcnv',
    GERMLINE_CYTO: 'zcc_curated_sample_germline_armcnv',
    METHYLATION: 'zcc_curated_sample_somatic_methylation',
    MUTATIONAL_SIG: 'zcc_curated_sample_somatic_mutsig',
    HTS: 'zcc_hts_drugstats',
    HTS_COMBINATION: 'zcc_hts_drug_combinations',
  };

  const variantIdMap: Record<VariantType, string> = {
    SNV: 'variant_id',
    CNV: 'gene_id',
    SV: 'variant_id',
    GERMLINE_CNV: 'gene_id',
    GERMLINE_SNV: 'variant_id',
    GERMLINE_SV: 'variant_id',
    RNA_SEQ: 'gene_id',
    RNA_CLASSIFIER: '',
    CYTOGENETICS: 'concat(chr, \'-\', arm)',
    GERMLINE_CYTO: 'concat(chr, \'-\', arm)',
    METHYLATION: 'meth_group_id',
    MUTATIONAL_SIG: 'signature',
    HTS: 'screen_id',
    HTS_COMBINATION: 'id',
  };

  const biosample = entityTypeBiosampleMap[variantType];
  if (!biosample) {
    console.error(`[ERROR]: No ${variantType} biosample found for: ${analysisSetId}`);
    return undefined;
  }

  if (biosample instanceof Array) {
    // check if we can work out which one it should be
    const table = tablesMap[variantType];
    const variantIdCol = variantIdMap[variantType];

    // check if there is results for only 1 biosample
    const biosampleIds = await zdKnex
      .distinct('biosample_id')
      .from(table)
      .whereIn('biosample_id', biosamples.map((b) => b.biosampleId));

    if (biosampleIds.length === 1) {
      return biosamples.find((b) => b.biosampleId === biosampleIds[0].biosample_id);
    }

    for (const b of biosample) {
      // eslint-disable-next-line no-await-in-loop
      const record = await zdKnex
        .select('*')
        .from(table)
        .where({
          ...additionalCondition,
          biosample_id: b.biosampleId,
        })
        .whereRaw(`${variantIdCol} = '${variantId}'`)
        .first();
      if (record) {
        return b;
      }
    }
    console.error(`[ERROR]: Ambigiuous ${variantType} biosamples found between: ${
      biosample.map((b) => b.biosampleId).join(', ')
    } for ${analysisSetId} and ${variantId}`);
    return undefined;
  }

  return biosample;
}
