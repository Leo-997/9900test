import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

async function correctExternalTrialId(): Promise<void> {
  await clinicalKnex
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .update({ mutation_id: clinicalKnex.raw('alteration') })
    .from('zcc_clinical_mol_alterations')
    .whereIn('mutation_type', ['CYTOGENETICS_CYTOBAND', 'GERMLINE_CYTO_CYTOBAND']);

  await clinicalKnex
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .update({ mutation_id: clinicalKnex.raw('gene_id') })
    .from('zcc_clinical_mol_alterations')
    .whereIn('mutation_type', ['CNV', 'GERMLINE_CNV']);

  await clinicalKnex
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .update({ mutation_id: clinicalKnex.raw('REGEXP_SUBSTR(mutation_id, "(chr[0-9MXY]{1,2})-(p|q)")') })
    .from('zcc_clinical_mol_alterations')
    .whereIn('mutation_type', ['GERMLINE_CYTO_ARM', 'CYTOGENETICS_ARM']);

  process.exit(0);
}

correctExternalTrialId();
