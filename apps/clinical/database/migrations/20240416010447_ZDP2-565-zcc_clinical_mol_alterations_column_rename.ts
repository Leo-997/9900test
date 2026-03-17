import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations', async (table) => {
    table.string('prognostic_factor').after('high_relapse_risk');
  })
    .then(() => (
      knex
        .update({
          prognostic_factor: knex.raw('high_relapse_risk'),
        })
        .from('zcc_clinical_mol_alterations')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_mol_alterations', (table) => {
        table.dropColumn('high_relapse_risk');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
