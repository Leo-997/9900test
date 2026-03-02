/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import knex, { Knex } from 'knex';

import { filterClassification } from '../query/classification.util';
import { knexConnectionConfig } from '../../../knexfile';



const zdKnex = knex(knexConnectionConfig);

async function updateTableReportables(table: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`Updating reportable in table: ${table}`);

  const query = zdKnex.update({
    reportable: true,
  })
    .from(table)
    .modify(filterClassification, 'classification', true);

  // eslint-disable-next-line no-console
  console.log(`Running query: ${query.toString()}`);

  await query;
}

function getGeneListQuery(listName: string): Knex.QueryBuilder {
  return zdKnex
    .select('a.gene_id')
    .from({ a: 'zcc_list_contains_gene' })
    .innerJoin(
      { b: 'zcc_gene_lists' },
      'a.list_id',
      'b.list_id',
    )
    .where('b.list_name', listName);
}

function getSampleQuery(disease: string): Knex.QueryBuilder {
  return zdKnex
    .select('sample_id')
    .from('zcc_sample')
    .where('gene_panel', disease);
}

function getMatchedNormalQuery(disease: string): Knex.QueryBuilder {
  return zdKnex
    .select('matched_normal_id')
    .from('zcc_sample')
    .where('gene_panel', disease);
}

async function updateSimpleInMolecularReport(
  table: string,
  sampleQuery: Knex.QueryBuilder,
  geneListQuery?: Knex.QueryBuilder,
): Promise<void> {
  const query = zdKnex.update({
    in_molecular_report: true,
  })
    .from(table)
    .whereIn('sample_id', sampleQuery)
    .andWhere('reportable', true)
    .andWhere(function geneListFilter() {
      if (geneListQuery) {
        this.whereIn('gene_id', geneListQuery);
      }
    });

  // eslint-disable-next-line no-console
  console.log(`Running query: ${query.toString()}`);

  await query;
}

async function updateSNVInMolecularReport(
  table: string,
  sampleCol: string,
  sampleQuery: Knex.QueryBuilder,
  geneListQuery?: Knex.QueryBuilder,
): Promise<void> {
  const query = zdKnex.update({
    'a.in_molecular_report': true,
  })
    .from({ a: table })
    .innerJoin({ b: 'zcc_curated_snv' }, 'a.variant_id', 'b.variant_id')
    .whereIn(sampleCol, sampleQuery)
    .andWhere('a.reportable', true)
    .andWhere(function geneListFilter() {
      if (geneListQuery) {
        this.whereIn('b.gene_id', geneListQuery);
      }
    });

  // eslint-disable-next-line no-console
  console.log(`Running query: ${query.toString()}`);

  await query;
}

async function updateSVInMolecularReport(
  table: string,
  sampleQuery: Knex.QueryBuilder,
  geneListQuery?: Knex.QueryBuilder,
): Promise<void> {
  const query = zdKnex.update({
    'a.in_molecular_report': true,
  })
    .from({ a: table })
    .innerJoin({ b: 'zcc_curated_sv' }, 'a.variant_id', 'b.variant_id')
    .whereIn('sample_id', sampleQuery)
    .andWhere('a.reportable', true)
    .andWhere(function geneListFilter() {
      if (geneListQuery) {
        this.whereIn('b.start_gene_id', geneListQuery)
          .orWhereIn('b.end_gene_id', geneListQuery);
      }
    });

  // eslint-disable-next-line no-console
  console.log(`Running query: ${query.toString()}`);

  await query;
}

async function updateReportable(): Promise<void> {
  const allTables = [
    'zcc_curated_sample_somatic_snv',
    'zcc_curated_sample_somatic_cnv',
    'zcc_curated_sample_somatic_sv',
    'zcc_curated_sample_somatic_rnaseq',
    'zcc_curated_sample_somatic_armcnv',
    'zcc_curated_sample_somatic_cytobandcnv',
    'zcc_curated_sample_germline_snv',
    'zcc_curated_sample_germline_cnv',
    'zcc_curated_sample_somatic_methylation',
    'zcc_curated_sample_somatic_mgmtstatus',
    'zcc_curated_sample_methylation_genes',
    'zcc_curated_sample_somatic_mutsig',
  ];

  await Promise.all(allTables.map((table) => updateTableReportables(table)));

  const somaticGeneListMapper = {
    CNS: getGeneListQuery('CNS Somatic Fast Track Gene List Version 1.1'),
    Neuroblastoma: getGeneListQuery('Neuroblastoma Somatic Fast Track Gene List Version 1.1'),
    Sarcoma: getGeneListQuery('Sarcoma Somatic Fast Track Gene List Version 1.0'),
    Thyroid: getGeneListQuery('Thyroid Tumour Somatic Fast Track Gene List Version 1.0'),
    'Hepatoblastoma/HCC': getGeneListQuery('Hepatoblastoma/Hepatocellular Carcinoma Somatic Fast Track Gene List Version 1.0'),
    'Wilms tumour': getGeneListQuery('Wilms Tumour Somatic Fast Track Gene List Version 1.0'),
    ALL: getGeneListQuery('Leukaemia & Lymphoma Somatic Fast Track Gene List Version 1.0'),
    AML: getGeneListQuery('Leukaemia & Lymphoma Somatic Fast Track Gene List Version 1.0'),
    Lymphoma: getGeneListQuery('Leukaemia & Lymphoma Somatic Fast Track Gene List Version 1.0'),
  };

  const germlineGeneListMapper = {
    CNS: getGeneListQuery('CNS high priority germline gene list version 1.2'),
    Neuroblastoma: getGeneListQuery('Neuroblastoma high priority germline gene list version 1.0'),
    Sarcoma: getGeneListQuery('Sarcoma high priority germline gene list version 1.0'),
    Thyroid: getGeneListQuery('Thyroid Tumour high priority germline gene list version 1.0'),
    'Hepatoblastoma/HCC': getGeneListQuery('Hepatoblastoma/Hepatocellular Carcinoma high priority germline gene list version 1.0'),
    'Wilms tumour': getGeneListQuery('Wilms Tumour high priority germline gene list version 1.0'),
  };

  const diseaseSampleMapper = {
    CNS: getSampleQuery('CNS'),
    Neuroblastoma: getSampleQuery('Neuroblastoma'),
    Sarcoma: getSampleQuery('Sarcoma'),
    Thyroid: getSampleQuery('Thyroid'),
    'Hepatoblastoma/HCC': getSampleQuery('Hepatoblastoma/HCC'),
    'Wilms tumour': getSampleQuery('Wilms tumour'),
    'No panel': getSampleQuery('No panel'),
    ALL: getSampleQuery('ALL'),
    AML: getSampleQuery('AML'),
    Lymphoma: getSampleQuery('Lymphoma'),
  };

  const diseaseMatchedNormalMapper = {
    CNS: getMatchedNormalQuery('CNS'),
    Neuroblastoma: getMatchedNormalQuery('Neuroblastoma'),
    Sarcoma: getMatchedNormalQuery('Sarcoma'),
    Thyroid: getMatchedNormalQuery('Thyroid'),
    'Hepatoblastoma/HCC': getMatchedNormalQuery('Hepatoblastoma/HCC'),
    'Wilms tumour': getMatchedNormalQuery('Wilms tumour'),
    'No panel': getMatchedNormalQuery('No panel'),
    ALL: getMatchedNormalQuery('ALL'),
    AML: getMatchedNormalQuery('AML'),
    Lymphoma: getMatchedNormalQuery('Lymphoma'),
  };

  for (const key of Object.keys(diseaseSampleMapper)) {
    // CNV
    await updateSimpleInMolecularReport(
      'zcc_curated_sample_somatic_cnv',
      diseaseSampleMapper[key],
      somaticGeneListMapper[key],
    );
    await updateSimpleInMolecularReport(
      'zcc_curated_sample_germline_cnv',
      diseaseSampleMapper[key],
      germlineGeneListMapper[key],
    );

    // CYTOGENETICS
    await updateSimpleInMolecularReport(
      'zcc_curated_sample_somatic_armcnv',
      diseaseSampleMapper[key],
    );
    await updateSimpleInMolecularReport(
      'zcc_curated_sample_somatic_cytobandcnv',
      diseaseSampleMapper[key],
    );

    // SNV
    await updateSNVInMolecularReport(
      'zcc_curated_sample_somatic_snv',
      'sample_id',
      diseaseSampleMapper[key],
      somaticGeneListMapper[key],
    );
    await updateSNVInMolecularReport(
      'zcc_curated_sample_germline_snv',
      'matched_normal_id',
      diseaseMatchedNormalMapper[key],
      germlineGeneListMapper[key],
    );

    // SV
    await updateSVInMolecularReport(
      'zcc_curated_sample_somatic_sv',
      diseaseSampleMapper[key],
      somaticGeneListMapper[key],
    );
  }

  process.exit(0);
}

updateReportable();
