/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import { GeneListsClient } from 'Clients/GeneLists/GeneLists.client';
import knex, { Knex } from 'knex';
import { ICreateGeneListBody } from 'Models/GeneLists/GeneLists.model';
import { knexConnectionConfig } from '../../../knexfile';



const reportsKnex = knex(knexConnectionConfig);
const zdKnex = knex({
  ...knexConnectionConfig,
  connection: {
    ...knexConnectionConfig.connection as Knex.MySql2ConnectionConfig,
    database: 'zcczerodashhg38',
  },
});

async function migrateGeneLists(): Promise<void> {
  const geneListsClient = new GeneListsClient(reportsKnex);

  const geneLists: Record<string, Omit<ICreateGeneListBody, 'geneIds'>> = {
    'CNS Somatic Fast Track Gene List Version 1.2': {
      name: 'CNS Somatic Fast Track Gene List',
      type: 'somatic',
      version: '1.2',
      genePanel: 'CNS',
      isHighRisk: false,
    },
    'Neuroblastoma Somatic Fast Track Gene List Version 1.2': {
      name: 'Neuroblastoma Somatic Fast Track Gene List',
      type: 'somatic',
      version: '1.2',
      genePanel: 'Neuroblastoma',
      isHighRisk: false,
    },
    'Sarcoma Somatic Fast Track Gene List Version 1.2': {
      name: 'Sarcoma Somatic Fast Track Gene List',
      type: 'somatic',
      version: '1.2',
      genePanel: 'Sarcoma',
      isHighRisk: false,
    },
    'Thyroid Tumour Somatic Fast Track Gene List Version 1.0': {
      name: 'Thyroid Tumour Somatic Fast Track Gene List',
      type: 'somatic',
      version: '1.0',
      genePanel: 'Thyroid tumour',
      isHighRisk: false,
    },
    'Hepatoblastoma/Hepatocellular Carcinoma Somatic Fast Track Gene List Version 1.0': {
      name: 'Hepatoblastoma/Hepatocellular Carcinoma Somatic Fast Track Gene List',
      type: 'somatic',
      version: '1.0',
      genePanel: 'Hepatoblastoma and Hepatocellular Carcinoma',
      isHighRisk: false,
    },
    'Wilms Tumour Somatic Fast Track Gene List Version 2.0': {
      name: 'Wilms Tumour Somatic Fast Track Gene List',
      type: 'somatic',
      version: '2.0',
      genePanel: 'Wilms tumour',
      isHighRisk: false,
    },
    'Leukaemia & Lymphoma Somatic Fast Track Gene List Version 1.3': {
      name: 'Leukaemia & Lymphoma Somatic Fast Track Gene List',
      type: 'somatic',
      version: '1.3',
      genePanel: 'Leukaemia and lymphoma',
      isHighRisk: false,
    },
    'CNS high priority germline gene list version 1.4': {
      name: 'CNS high priority germline gene list',
      type: 'germline',
      version: '1.4',
      genePanel: 'CNS',
      isHighRisk: false,
    },
    'Neuroblastoma high priority germline gene list version 1.0': {
      name: 'Neuroblastoma high priority germline gene list',
      type: 'germline',
      version: '1.0',
      genePanel: 'Neuroblastoma',
      isHighRisk: false,
    },
    'Sarcoma high priority germline gene list version 1.0': {
      name: 'Sarcoma high priority germline gene list',
      type: 'germline',
      version: '1.0',
      genePanel: 'Sarcoma',
      isHighRisk: false,
    },
    'Thyroid Tumour high priority germline gene list version 1.1': {
      name: 'Thyroid Tumour high priority germline gene list',
      type: 'germline',
      version: '1.1',
      genePanel: 'Thyroid tumour',
      isHighRisk: false,
    },
    'Hepatoblastoma/Hepatocellular Carcinoma high priority germline gene list version 1.0': {
      name: 'Hepatoblastoma/Hepatocellular Carcinoma high priority germline gene list',
      type: 'germline',
      version: '1.0',
      genePanel: 'Hepatoblastoma and Hepatocellular Carcinoma',
      isHighRisk: false,
    },
    'Wilms Tumour high priority germline gene list version 2.0': {
      name: 'Wilms Tumour high priority germline gene list',
      type: 'germline',
      version: '2.0',
      genePanel: 'Wilms tumour',
      isHighRisk: false,
    },
    'High Risk Somatic Genes': {
      name: 'High Risk Somatic Genes',
      type: 'somatic',
      version: '1.0',
      genePanel: 'No panel',
      isHighRisk: true,
    },
    'High Risk Germline Genes': {
      name: 'High Risk Germline Genes',
      type: 'germline',
      version: '1.0',
      genePanel: 'No panel',
      isHighRisk: true,
    },
    'AVM Genes': {
      name: 'AVM Genes',
      type: 'other',
      version: '1.0',
      isHighRisk: false,
    },
    'RNA Expression Genes': {
      name: 'RNA Expression Genes',
      type: 'rna',
      version: '1.0',
      isHighRisk: false,
    },
    'IPASS genes': {
      name: 'IPASS genes',
      type: 'other',
      version: '1.0',
      isHighRisk: false,
    },
  };

  await Promise.all(Object.entries(geneLists).map(async ([key, value]) => {
    const geneIds = await zdKnex
      .select('gene_id')
      .from('zcc_list_contains_gene')
      .where({ list_id: zdKnex.select('list_id').from('zcc_gene_lists').where('list_name', key) })
      .pluck('gene_id');

    await geneListsClient.createGeneList({
      ...value,
      geneIds,
    });
  }));

  process.exit(0);
}

migrateGeneLists();
