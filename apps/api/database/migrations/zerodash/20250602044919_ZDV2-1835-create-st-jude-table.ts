import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq_classification', (table) => {
    table
      .enum('classifier', [
        'allsorts',
        'tallsorts',
        'reviewed_subtype',
        'reviewed_genetic_subtype',
        'risk_group'])
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
