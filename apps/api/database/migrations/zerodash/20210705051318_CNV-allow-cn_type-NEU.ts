import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex('zcc_curated_sample_somatic_cnv').whereNull('cn_type').update({
    cn_type: 'NEU',
  });
}

export async function down(knex: Knex): Promise<void> {}
