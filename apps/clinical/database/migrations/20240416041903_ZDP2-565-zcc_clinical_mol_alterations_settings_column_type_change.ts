import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_settings', async (table) => {
    table.boolean('show_prognostic_factor').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
