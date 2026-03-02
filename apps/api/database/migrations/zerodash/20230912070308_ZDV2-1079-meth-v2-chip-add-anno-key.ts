import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_anno', (table) => {
    table.primary(['meth_sample_id', 'probe_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
