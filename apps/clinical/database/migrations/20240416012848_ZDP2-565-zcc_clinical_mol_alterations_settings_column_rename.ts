import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_settings', async (table) => {
    table.string('show_prognostic_factor').after('show_high_relapse_risk');
  })
    .then(() => (
      knex
        .update({
          show_prognostic_factor: knex.raw('show_high_relapse_risk'),
        })
        .from('zcc_clinical_mol_alterations_settings')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_mol_alterations_settings', (table) => {
        table.dropColumn('show_high_relapse_risk');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
