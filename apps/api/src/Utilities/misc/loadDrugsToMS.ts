/* eslint-disable no-console */
import { v4 as uuidv4 } from 'uuid';
import { knex } from 'knex';
import { IDrug, IDrugDetails } from 'Models/Curation/HTS/Drugs.model';
import { IPathway } from 'Models/Curation/Pathways/Pathways.model';
import { knexConnectionConfig } from '../../../knexfile';

type AliasSources = 'CCI' | 'PMC' | 'COMPASS_LIB'

interface IAlias {
  id: string;
  alias: string;
  source?: AliasSources;
  sourceId?: string;
  drugId: string;
}

interface IDrugPathway {
  drugId: string;
  pathway: string;
}

interface IDrugMSInput extends IDrug {
  uuid: string;
}

const zdKnex = knex(knexConnectionConfig);
const drugsKnex = knex({
  ...knexConnectionConfig,
  connection: {
    ...knexConnectionConfig.connection,
    database: 'zccdrugs',
  },
});

async function getDrugs(): Promise<IDrug[]> {
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
    });
}

async function getFirstScreenDrugs(): Promise<number[]> {
  return zdKnex('zcc_hts_drugstats')
    .distinct({
      drugId: 'drug_id',
    })
    .pluck('drug_id');
}

async function getAdditionalDrugs(): Promise<number[]> {
  return zdKnex('zcc_drugs')
    .distinct({
      drugId: 'drug_id',
    })
    .whereNotIn('drug_id', await getFirstScreenDrugs())
    .pluck('drug_id');
}

async function getScreenDetails(ids: number[]): Promise<IDrugDetails[]> {
  return zdKnex({ a: 'zcc_drug_details' })
    .select({
      internalId: 'a.internal_id',
      drugId: 'a.drug_id',
      drugName: 'b.drug_name',
      screen: 'a.screen',
      dosePk: 'a.dose_pk',
      doseSchedule: 'a.dose_schedule',
      dosePaediatric: 'a.dose_paediatric',
      doseTolerance: 'a.dose_tolerance',
      cmaxNgMl: 'a.cmax_ng_ml',
      cmaxUM: 'a.cmax_uM',
      cssNgMl: 'a.css_ng_ml',
      cssUM: 'a.css_uM',
      cssPeak: 'a.css_peak',
      maxResponse: 'a.max_response',
      tumorType: 'a.tumor_type',
      crpcUM: 'a.crpc_uM',
      crpcNM: 'a.crpc_nM',
      bbb: 'a.bbb',
      fda: 'a.fda',
      tga: 'a.tga',
      paedCancerTrial: 'a.paed_cancer_trial',
      includeReason: 'a.include_reason',
      comment: 'a.comment',
      createdAt: 'a.created_at',
      updatedAt: 'a.updated_at',
      createdBy: 'a.created_by',
      updatedBy: 'a.updated_by',
    })
    .innerJoin({ b: 'zcc_drugs' }, 'a.drug_id', 'b.drug_id')
    .whereIn('a.drug_id', ids);
}

function convertToBoolean(value: string): boolean | null {
  if (value === null) return null;

  return value.toLowerCase().startsWith('y');
}

async function loadDrugScreen(drugDetails: IDrugDetails[], screenName: string): Promise<number[]> {
  return drugsKnex('zcc_drug_screening')
    .insert(drugDetails.map((d) => ({
      id: uuidv4(),
      drug_id: drugsKnex('zcc_drugs')
        .select('id')
        .where('name', d.drugName)
        .first(),
      screen: screenName,
      target: d.target,
      mol_weight: d.molWeight,
      dose_pk: d.dosePk,
      dose_schedule: d.doseSchedule,
      dose_paediatric: convertToBoolean(d.dosePaediatric),
      dose_tolerance: d.doseTolerance,
      cmax_ng_ml: d.cmaxNgMl,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      cmax_uM: d.cmaxUM,
      css_ng_ml: d.cssNgMl,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      css_uM: d.cssUM,
      css_peak: d.cssPeak,
      max_response: d.maxResponse,
      tumour_type: d.tumorType,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      crpc_uM: d.crpcUM,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      crpc_nM: d.crpcNM,
      paed_cancer_trial: d.paedCancerTrial,
      include_reason: d.includeReason,
      notes: d.comment,
      blood_brain_barrier: convertToBoolean(d.bbb),
      fda_approved: convertToBoolean(d.fda),
      tga_approved: convertToBoolean(d.tga),
    })));
}

async function getPathways(): Promise<IPathway[]> {
  return zdKnex<IPathway>('zcc_pathways')
    .select({
      id: 'pathway_id',
      name: 'pathway_name',
      createdAt: 'created_at',
      updateAt: 'updated_at',
      createdBy: 'created_by',
      updateBy: 'updated_by',
    });
}

async function loadMSPathways(pathways: string[]): Promise<number[]> {
  return drugsKnex('zcc_pathway')
    .insert(pathways.map((pathway) => ({
      id: uuidv4(),
      name: pathway.trim(),
    })))
    .onConflict(['name'])
    .ignore();
}

function getAliases(drug: IDrug, drugId: string): IAlias[] {
  const aliases: IAlias[] = [];

  drug.synonyms
    ?.replace(/,/, ';')
    .split(';')
    .map((synonym) => synonym.trim())
    .forEach((synonym) => {
      aliases.push({
        id: uuidv4(),
        alias: synonym,
        drugId,
      });
    });

  if (drug.drugnameCci) {
    aliases.push({
      id: uuidv4(),
      alias: drug.drugnameCci,
      source: 'CCI',
      sourceId: drug.cciDrugId,
      drugId,
    });
  }

  if (drug.drugnamePmc) {
    aliases.push({
      id: uuidv4(),
      alias: drug.drugnamePmc,
      source: 'PMC',
      drugId,
    });
  }

  if (drug.drugnameCompasslib) {
    aliases.push({
      id: uuidv4(),
      alias: drug.drugnameCompasslib,
      source: 'COMPASS_LIB',
      drugId,
    });
  }

  return aliases;
}

function getPathwaysFromDrug(drug: IDrug, drugId: string): IDrugPathway[] {
  const pathwayNames = drug
    .drugPathwayclass
    .split(';')
    .map((p) => p.trim());
  return pathwayNames.map((pathway) => ({
    drugId,
    pathway,
  }));
}

async function loadMSDrugTable(drugs: IDrug[]): Promise<number[]> {
  // prepare the input
  const drugInputs: IDrugMSInput[] = [];
  const aliases: IAlias[] = [];
  const drugPathways: IDrugPathway[] = [];
  for (const drug of drugs) {
    const drugId = uuidv4();
    drugInputs.push({
      uuid: drugId,
      ...drug,
    });
    aliases.push(...getAliases(drug, drugId));
    drugPathways.push(...getPathwaysFromDrug(drug, drugId));
  }

  await loadMSPathways(drugPathways.map(({ pathway }) => pathway));

  // insert the drugs in a single transaction in case of error
  return drugsKnex.transaction(
    (trx) => trx('zcc_drugs')
      .insert(drugInputs.map((drug) => ({
        id: drug.uuid,
        internal_id: drug.cciDrugId.trim(),
        name: drug.drugName.trim(),
        has_paediatric_dose: null, // no where to get this from
        company: drug.company,
        category: drug.category,
        type: drug.drugType,
        class: drug.drugClass,
        prodrug: drug.prodrug,
        notes: drug.comments,
      })))
      .then(
        () => trx('zcc_drug_aliases').insert(aliases.map((alias) => ({
          id: alias.id,
          alias: alias.alias,
          drug_id: alias.drugId,
          source: alias.source,
          source_drug_id: alias.sourceId,
        })))
          .then(
            () => trx('zcc_drug_pathway_xref')
              .insert(drugPathways.map((drugPathway) => ({
                drug_id: drugPathway.drugId,
                pathway_id: drugsKnex('zcc_pathway')
                  .select('id')
                  .where('name', drugPathway.pathway)
                  .first(),
              }))),
          ),
      ),
  );
}

async function loadDrugsData(): Promise<void> {
  console.log('Fetching drugs...');
  const drugs = await getDrugs();
  console.log('Fetching pathways...');
  const pathways = await getPathways();
  console.log('Loading pathways...');
  await loadMSPathways(pathways.map((p) => p.name));
  console.log('Loading drugs...');
  await loadMSDrugTable(drugs);
  console.log('Fetching drug details...');
  const ids = await getFirstScreenDrugs();
  const screenDetails = await getScreenDetails(ids);
  const screenTargetMolWeight = screenDetails.map((screenDrug) => {
    const drug = drugs.find((d) => d.drugId === screenDrug.drugId);
    return {
      ...screenDrug,
      target: drug.drugTarget,
      molWeight: drug.molWeight,
    };
  });
  console.log('loading drug screen...');
  await loadDrugScreen(screenTargetMolWeight, 'standard_126');
  console.log('Fetching additional drug details...');
  const additionalIds = await getAdditionalDrugs();
  const additionalScreenDetails = await getScreenDetails(additionalIds);
  const addScreenTargetMolWeight = additionalScreenDetails.map((screenDrug) => {
    const drug = drugs.find((d) => d.drugId === screenDrug.drugId);
    return {
      ...screenDrug,
      target: drug.drugTarget,
      molWeight: drug.molWeight,
    };
  });
  console.log('Loading additioanl drug screen...');
  await loadDrugScreen(addScreenTargetMolWeight, 'other');
  process.exit(0);
}

loadDrugsData();
