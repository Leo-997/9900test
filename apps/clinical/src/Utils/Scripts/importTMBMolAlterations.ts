/* eslint-disable no-console */
import knex from 'knex';
import { v4 as uuid } from 'uuid';
import { knexConnectionConfig } from '../../../knexfile';
import toFixed from '../Maths/toFixed';

const clinicalKnex = knex(knexConnectionConfig);

interface ITumourMutationalBurden {
  somMissenseSnvs: number,
  mutBurdenMb: number,
}

interface IInsertedAlteration {
  molAlterationId: string;
  mutationId: string | number;
  clinicalVersionId: string;
}

const molecularAlterationTable = 'zcc_clinical_mol_alterations';
const clinicalVersionTable = 'zcc_clinical_versions';
const analysisSetTable = 'zcczerodashhg38.zcc_analysis_set';

async function getTMB(analysisSetId: string): Promise<ITumourMutationalBurden> {
  return clinicalKnex
    .select({
      somMissenseSnvs: 'analysis.som_missense_snvs',
      mutBurdenMb: 'analysis.mut_burden_mb',
    })
    .from({ analysis: analysisSetTable })
    .where('analysis_set_id', analysisSetId)
    .first();
}

async function importTMB(
  tumourMutationalBurden: ITumourMutationalBurden,
  clinicalVersionId: string,
): Promise<IInsertedAlteration> {
  const { somMissenseSnvs, mutBurdenMb } = tumourMutationalBurden;
  const strings: string[] = [];
  if (somMissenseSnvs !== null && somMissenseSnvs !== undefined) strings.push(`${somMissenseSnvs} SNVs/exome`);
  if (mutBurdenMb !== null && mutBurdenMb !== undefined) strings.push(`${toFixed(mutBurdenMb, 2)} mut/mb`);
  let tmb = strings.join(' - ') || '-';
  if (tmb === '-') tmb = null;
  const mutationId = mutBurdenMb > 8 || somMissenseSnvs > 100 ? 'TMB_HIGH' : 'TMB_LOW';
  const id = uuid();
  const result = await clinicalKnex
    .insert({
      id,
      mutation_id: mutationId,
      mutation_type: 'TMB',
      additional_data: JSON.stringify({
        somMissenseSnvs,
        mutBurdenMb,
      }),
      alteration: tmb,
      description: tmb,
      clinical_version_id: clinicalVersionId,
      created_at: clinicalKnex.fn.now(),
    })
    .into(molecularAlterationTable);

  if (result && result.length > 0) {
    return {
      molAlterationId: id,
      mutationId,
      clinicalVersionId,
    };
  }

  throw new Error('Incorrect format for the tumour mutational burden.');
}

async function importTMBMolAlterations(): Promise<IInsertedAlteration[]> {
  const clinicalVersions = await clinicalKnex
    .select({
      id: 'v.id',
      analysisSetId: 'v.analysis_set_id',
    })
    .from({ v: clinicalVersionTable })
    .whereNotExists(function isTMB() {
      this.select('*')
        .from({ a: molecularAlterationTable })
        .whereRaw('a.clinical_version_id = v.id')
        .andWhere('a.mutation_type', 'TMB');
    });

  return Promise.all(
    clinicalVersions.map(async ({ id: versionId, analysisSetId }) => {
      const tumourMutationalBurden = await getTMB(analysisSetId);
      if (tumourMutationalBurden) {
        return importTMB(tumourMutationalBurden, versionId);
      }
      return null;
    }),
  ).then((results) => results.filter(Boolean) as IInsertedAlteration[]);
}

async function loadTMBMolAlterations(): Promise<void> {
  console.log('Loading data..');
  try {
    const results = await importTMBMolAlterations();
    console.log(`Inserted ${results.length} TMB Alterations:`, results);
  } catch (error) {
    console.error('Error importing TMB alterations:', error);
  } finally {
    process.exit();
  }
}

loadTMBMolAlterations();
