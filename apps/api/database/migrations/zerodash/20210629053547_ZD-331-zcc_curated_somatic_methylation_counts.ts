import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_methylation',
    function indexMethId(table) {
      table.index('meth_class_id');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
