import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_snv', (table) => {
    table.boolean('vcf_filter_pass').defaultTo(null).after('digest_thread_id');
  });
}

export async function down(knex: Knex): Promise<void> {}
