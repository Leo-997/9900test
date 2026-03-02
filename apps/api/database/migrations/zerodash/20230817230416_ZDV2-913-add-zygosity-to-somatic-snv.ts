import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_snv', (table) => {
    table.string('zygosity', 50).nullable().after('panel_vaf');
  });
}

export async function down(knex: Knex): Promise<void> {
}
