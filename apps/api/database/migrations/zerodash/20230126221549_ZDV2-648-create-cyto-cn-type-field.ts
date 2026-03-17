import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_cytobandcnv',
    (table) => {
      table.string('cn_type', 25).after('avecopynumber');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
