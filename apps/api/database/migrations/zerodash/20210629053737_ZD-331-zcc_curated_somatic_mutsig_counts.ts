import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_mutsig',
    function indexMethId(table) {
      table.index('signature');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
