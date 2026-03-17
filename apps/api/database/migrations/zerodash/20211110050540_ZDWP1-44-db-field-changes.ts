import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_mutsig', (tbl) => {
    tbl.string('summary_thread_id').nullable().defaultTo(null).alter();
    tbl.string('comment_thread_id').nullable().defaultTo(null).alter();
  });
}

export async function down(knex: Knex): Promise<void> {}
