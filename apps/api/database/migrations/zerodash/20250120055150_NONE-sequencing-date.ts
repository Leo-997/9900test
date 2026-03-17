import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.date('sequencing_date').nullable().after('processing_date');
  });
}

export async function down(knex: Knex): Promise<void> {
}
