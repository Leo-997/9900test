import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_assay', (table) => {
    table.string('assay_type', 75).after('assay_name').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
}
