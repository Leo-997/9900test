import knex, { Knex } from 'knex';
import { IDrug } from 'Models/Curation/HTS/Drugs.model';
import { knexConnectionConfig } from '../../../knexfile';

interface IDrugScreenMap {
  oldDrugId: number;
  screenId: string;
}

const zdKnex = knex(knexConnectionConfig);
const drugsKnex = knex({
  ...knexConnectionConfig,
  connection: {
    ...knexConnectionConfig.connection,
    database: 'zccdrugs',
  },
});

async function getFirstScreenIds(): Promise<number[]> {
  return zdKnex('zcc_hts_drugstats_27apr23')
    .distinct({
      drugId: 'drug_id',
    })
    .pluck('drug_id');
}

async function getFirstScreenSamples(): Promise<string[]> {
  return zdKnex('zcc_hts_drugstats_27apr23')
    .distinct({
      sampleId: 'sample_id',
    })
    .pluck('sample_id');
}

async function getAdditionalDrugs(): Promise<number[]> {
  return zdKnex('zcc_hts_drugstats')
    .distinct({
      drugId: 'drug_id',
    })
    .whereNotIn('sample_id', await getFirstScreenSamples())
    .pluck('drug_id');
}

async function getNewSamples(): Promise<string[]> {
  return zdKnex('zcc_hts_drugstats')
    .distinct({
      sampleId: 'sample_id',
    })
    .whereNotIn('sample_id', await getFirstScreenSamples())
    .pluck('sample_id');
}

async function getDrugsByIds(ids: number[]): Promise<IDrug[]> {
  return zdKnex<IDrug>('zcc_drugs')
    .select({
      drugId: 'drug_id',
      drugName: 'drug_name',
      synonyms: 'synonyms',
      category: 'category',
      company: 'company',
      molWeight: 'mol_weight',
      cciDrugId: 'cci_drug_id',
      drugnameCci: 'drugname_cci',
      drugnamePmc: 'drugname_pmc',
      drugnameCompasslib: 'drugname_compasslib',
      drugTarget: 'drug_target',
      drugPathwayclass: 'drug_pathwayclass',
      drugType: 'drug_type',
      drugClass: 'drug_class',
      cci: 'cci',
      pmc: 'pmc',
      prodrug: 'prodrug',
      combination: 'combination',
      comboType: 'combo_type',
      clinicalTrial: 'clinical_trial',
      comments: 'comments',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      createdBy: 'created_by',
      updatedBy: 'updated_by',
    })
    .whereIn('drug_id', ids);
}

async function getMsScreenIds(drugs: IDrug[], screenName: string): Promise<IDrugScreenMap[]> {
  return drugsKnex({ a: 'zcc_drug_screening' })
    .select({
      screenId: 'a.id',
      internalId: 'b.internal_id',
    })
    .innerJoin({ b: 'zcc_drugs' }, 'a.drug_id', 'b.id')
    .whereIn('b.internal_id', drugs.map((d) => d.cciDrugId))
    .where('a.screen', screenName)
    .then((rows) => rows.map((row) => ({
      oldDrugId: drugs.find((d) => d.cciDrugId === row.internalId)?.drugId,
      screenId: row.screenId,
    })));
}

async function updateDrugHits(
  screenIdMaps: IDrugScreenMap[],
  samples: string[],
): Promise<void> {
  return zdKnex.transaction((trx) => {
    const updates: Knex.QueryBuilder[] = [];
    for (const screen of screenIdMaps) {
      const query = trx('zcc_hts_drugstats')
        .update({
          drug_id: screen.screenId,
        })
        .where('drug_id', screen.oldDrugId.toString())
        .whereIn('sample_id', samples);
      updates.push(
        query,
      );
    }

    Promise.all(updates)
      .then(trx.commit)
      .catch(trx.rollback);
  });
}

async function updateHTSDrugStatsByScreen(
  drugIds: number[],
  samples: string[],
  screenName: string,
): Promise<void> {
  const drugs = await getDrugsByIds(drugIds);
  const screenIds = await getMsScreenIds(drugs, screenName);
  await updateDrugHits(screenIds, samples);
}

async function updateHTSDrugStats(): Promise<void> {
  const firstDrugIds = await getFirstScreenIds();
  const oldSamples = await getFirstScreenSamples();
  const newDrugs = await getAdditionalDrugs();
  const newSamples = await getNewSamples();

  await updateHTSDrugStatsByScreen(firstDrugIds, oldSamples, 'standard_126');
  await updateHTSDrugStatsByScreen(newDrugs, newSamples, 'hts_screen150_v1');

  process.exit(0);
}

updateHTSDrugStats();
