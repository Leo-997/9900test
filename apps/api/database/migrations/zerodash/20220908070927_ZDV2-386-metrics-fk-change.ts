import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('zcc_seq_metrics', (table) => {
      table.dropForeign(['sample_id'], 'zcc_seq_metrics_sample_id_foreign');
    })
    .then(() => {
      return knex.schema.alterTable('zcc_seq_metrics', (table) => {
        table
          .foreign('sample_id')
          .references('zcc_sample.sample_id')
          .onDelete('RESTRICT')
          .onUpdate('CASCADE');
      });
    });
}

export async function down(knex: Knex): Promise<void> {}
