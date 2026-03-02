import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', async (table) => {
    table.boolean('is_germline_only').defaultTo('false').after('expedite');
  });
}

export async function down(knex: Knex): Promise<void> {
}
