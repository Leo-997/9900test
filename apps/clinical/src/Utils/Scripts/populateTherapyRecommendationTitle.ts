/* eslint-disable no-console */
import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

const geneVariantTypes = [
  'SNV',
  'CNV',
  'RNA_SEQ',
  'SV',
  'GERMLINE_CNV',
  'GERMLINE_SNV',
  'GERMLINE_SV',
  'METHYLATION_GENE',
] as const;

const curationVariantTypes = [
  ...geneVariantTypes,
  'CYTOGENETICS',
  'METHYLATION',
  'MUTATIONAL_SIG',
  'HTS',
  'HTS_COMBINATION',
  'RNA_CLASSIFIER',
] as const;

const clinicalVariantTypes = [
  ...curationVariantTypes,
  'CYTOGENETICS_CYTOBAND',
  'CYTOGENETICS_ARM',
] as const;

const variantTypes = [
  ...clinicalVariantTypes,
  // for the clinical molecular findings
  'METHYLATION_MGMT',
  'METHYLATION_CLASSIFIER',
] as const;

type VariantType = typeof variantTypes[number];

interface IMolecularAlterationDetail {
  id: string;
  mutationId: string;
  mutationType: VariantType;
  gene: string;
  geneId: string;
  secondaryGene: string;
  secondaryGeneId: string;
  pathway: string;
  pathwayId: string;
  alteration: string;
  curationClassification: string;
  curationTargetable: boolean;
  clinicalReportable: string;
  clinicalTargetable: boolean;
  hidden: boolean;
  frequency: string;
  prognosticFactor: boolean;
  clinicalVersionId: string;
  clinicalNotes: string;
  additionalData?: any;
  clinicalAlteration: string;
  clinicalRnaExpression: 'High' | 'Low';
  summaryOrder?: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type DisruptedTypes =
  | 'No'
  | 'Yes'
  | 'Start'
  | 'End'
  | 'Both'
  | 'Unknown';

type SvType = 'INS' | 'DEL' | 'INV' | 'BND' | 'DUP' | 'DISRUPTION' | 'SGL' | 'INF';

interface IClinicalSVVariant {
  startGene: string,
  endGene: string,
  markDisrupted: DisruptedTypes,
  svType: SvType,
}

interface ITherapyRecommendation {
  id: string,
  therapyId: string,
  clinicalVersionId: string,
  molAlterationGroupId: string,
  tier: string,
}

interface ITherapyDrug {
  externalDrugClassId: string,
  externalDrugVersionId: string | null,
}

interface IFetchTherapyDrug {
  className: string,
  drugName: string | null,
}

interface ITherapy {
  id: string;
  chemotherapy: boolean;
  radiotherapy: boolean;
  drugs: IFetchTherapyDrug[];
}

interface IFetchTherapyRecommendation extends ITherapyRecommendation {
  therapy: ITherapy,
  targets: IMolecularAlterationDetail[],
}

function getClinicalSVGenes(sv: IClinicalSVVariant): string {
  let svGene = `${sv.startGene}::${sv.endGene}`;
  if (sv.markDisrupted === 'Start' || sv.svType === 'DISRUPTION' || sv.markDisrupted === 'Yes') {
    svGene = sv.startGene.toString();
  }
  if (sv.markDisrupted === 'End' && sv.svType !== 'DISRUPTION') {
    svGene = sv.endGene.toString();
  }
  return svGene;
}

const getGeneOrNonGene = (
  alteration: IMolecularAlterationDetail,
): string => {
  try {
    switch (alteration.mutationType) {
      case 'CYTOGENETICS_CYTOBAND':
      case 'CYTOGENETICS_ARM':
        return `${alteration.additionalData?.chromosome}${
          alteration.additionalData?.arm
        }`;
      case 'METHYLATION_MGMT':
        return 'MGMT';

      case 'METHYLATION_CLASSIFIER':
      case 'RNA_CLASSIFIER':
        return `${alteration.additionalData?.classifier || '-'}`;

      case 'MUTATIONAL_SIG':
        return alteration.alteration.replace('nature ', ' ');

      case 'SV':
      case 'GERMLINE_SV':
        if (alteration.additionalData) {
          return getClinicalSVGenes({
            startGene: alteration.additionalData.startGene.toString(),
            endGene: alteration.additionalData.endGene.toString(),
            markDisrupted: alteration.additionalData.markDisrupted as DisruptedTypes,
            svType: alteration.additionalData.svType as SvType,
          });
        }
        return alteration.gene;

      default:
        return alteration.gene;
    }
  } catch {
    return '-';
  }
};

async function hydrateTherapyDrug({
  externalDrugClassId,
  externalDrugVersionId,
}:ITherapyDrug, therapyId: string): Promise<IFetchTherapyDrug> {
  const drug = externalDrugVersionId
    ? await clinicalKnex
      .select('name')
      .from({ v: 'zccdrugs.zcc_drug_version' })
      .leftJoin({ d: 'zccdrugs.zcc_drugs' }, 'd.id', 'v.drug_id')
      .where('v.id', externalDrugVersionId)
      .first()
    : { name: null };
  const drugClass = await clinicalKnex
    .select('name')
    .from('zccdrugs.zcc_drug_class')
    .where('id', externalDrugClassId)
    .first();
  if (drug === undefined) console.log(`Invaild drug version ${externalDrugVersionId} in therapy ${therapyId}`);
  if (drugClass === undefined) console.log(`Invaild class id ${externalDrugClassId} in therapy ${therapyId}`);
  return {
    drugName: drug ? drug.name : 'Unknown Drug',
    className: drugClass ? drugClass.name : 'Unknown Class',
  };
}

async function getTherapyDrugsByTherapyId(therapyId: string): Promise<IFetchTherapyDrug[]> {
  const therapyDrugs = await clinicalKnex
    .select({
      externalDrugVersionId: 'external_drug_version_id',
      externalDrugClassId: 'external_drug_class_id',
    })
    .from<ITherapyDrug>('zcc_clinical_therapy_drugs')
    .where('therapy_id', therapyId);
  return Promise.all(therapyDrugs.map((therapyDrug) => hydrateTherapyDrug(therapyDrug, therapyId)));
}

async function getTherapyById(therapyId: string): Promise<ITherapy> {
  const therapy = clinicalKnex
    .select<ITherapy>({
      chemotherapy: 'chemotherapy',
      radiotherapy: 'radiotherapy',
    })
    .from('zcc_clinical_therapies')
    .where('id', therapyId)
    .first();
  return {
    ...therapy,
    drugs: await getTherapyDrugsByTherapyId(therapyId),
  };
}

async function getMolecularAlterations(
  clinicalVersionId: string,
  molAlterationGroupId: string,
): Promise<IMolecularAlterationDetail[]> {
  const resp = await clinicalKnex.select({
    id: 'alt.id',
    mutationId: 'alt.mutation_id',
    mutationType: 'alt.mutation_type',
    gene: 'alt.gene',
    geneId: 'alt.gene_id',
    secondaryGene: 'alt.secondary_gene',
    secondaryGeneId: 'alt.secondary_gene_id',
    pathway: 'alt.pathway',
    pathwayId: 'alt.pathway_id',
    alteration: 'alt.alteration',
    curationClassification: 'alt.curation_classification',
    curationTargetable: 'alt.curation_targetable',
    clinicalReportable: 'alt.clinical_reportable',
    clinicalTargetable: 'alt.clinical_targetable',
    hidden: 'alt.is_hidden',
    frequency: 'alt.frequency',
    prognosticFactor: 'alt.prognostic_factor',
    clinicalVersionId: 'alt.clinical_version_id',
    clinicalNotes: 'alt.clinical_notes',
    additionalData: 'alt.additional_data',
    clinicalAlteration: 'alt.clinical_alteration',
    clinicalRnaExpression: 'alt.clinical_rna_expression',
    summaryOrder: 'alt.summary_order',
    description: 'alt.description',
    createdAt: 'alt.created_at',
    updatedAt: 'alt.updated_at',
  })
    .from<IMolecularAlterationDetail>({ alt: 'zcc_clinical_mol_alterations' })
    .where('alt.clinical_version_id', clinicalVersionId)
    .andWhere('group.mol_alteration_id', molAlterationGroupId)
    .leftJoin(
      { group: 'zcc_clinical_mol_alterations_group' },
      'alt.id',
      'group.mol_alteration_id',
    )
    .innerJoin(
      { version: 'zcc_clinical_versions' },
      'alt.clinical_version_id',
      'version.id',
    )
    .groupBy('alt.id');

  return resp;
}

async function hydrateTherapyRecommendation(
  rec: ITherapyRecommendation,
): Promise<IFetchTherapyRecommendation> {
  return {
    ...rec,
    therapy: await getTherapyById(rec.therapyId),
    targets: await getMolecularAlterations(rec.clinicalVersionId, rec.molAlterationGroupId),
  };
}

async function getTherapyRecommendations(): Promise<IFetchTherapyRecommendation[]> {
  const recs = await clinicalKnex
    .select({
      id: 'id',
      therapyId: 'therapy_id',
      clinicalVersionId: 'clinical_version_id',
      molAlterationGroupId: 'mol_alteration_group_id',
      tier: 'tier',
    })
    .from<ITherapyRecommendation>('zcc_clinical_recommendations')
    .whereNull('deleted_at')
    .andWhere('type', 'THERAPY')
    .andWhere(function custom() {
      this
        .whereNull('title')
        .orWhere('title', '');
    });

  return Promise.all(recs.map((rec) => hydrateTherapyRecommendation(rec)));
}

function getTitle({
  therapy,
  targets,
  tier,
}: IFetchTherapyRecommendation): string {
  const drugsAndTherapyDetails = therapy.drugs.map(
    ({ drugName, className }) => {
      let drug = '';
      if (drugName && className) drug = `${drugName} (${className})`;
      if (drugName && !className) drug = drugName;
      if (!drugName && className) drug = className;
      return drug;
    },
  );
  if (therapy.chemotherapy) drugsAndTherapyDetails.push('Chemotherapy');
  if (therapy.radiotherapy) drugsAndTherapyDetails.push('Radiotherapy');
  let prefillTitle = drugsAndTherapyDetails.join(' + ');
  const alterations = targets.map((target) => getGeneOrNonGene(target));
  if (alterations.length > 0) {
    prefillTitle += `${drugsAndTherapyDetails.length > 0 ? ' for ' : ''}${alterations.join(', ')} alteration${alterations.length > 1 ? 's' : ''}`;
  }
  if (tier) {
    prefillTitle += tier === 'No tier' ? ` (${tier})` : ` (Tier ${tier})`;
  }
  return prefillTitle;
}

async function populateTherapyRecommendationDescription(): Promise<void> {
  console.log('running zcc_clinical_recommendation.description update script...');

  const therapyRecs = await getTherapyRecommendations();
  try {
    const count = await Promise.all(therapyRecs.map((therapyRec) => clinicalKnex
      .update({ title: getTitle(therapyRec) })
      .where('id', therapyRec.id)
      .from('zcc_clinical_recommendations')));

    therapyRecs.map((therapyRec) => getTitle(therapyRec));

    console.log(`Successfully updated ${count.reduce((s, c) => s + c)} row(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating zcc_clinical_recommendation.description column:', error);
    process.exit(1);
  }
}

populateTherapyRecommendationDescription();
