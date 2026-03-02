import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.dropColumn('mtb_date');
  });
}

export async function down(knex: Knex): Promise<void> {
}
