import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('zcc_sample', (table) => {
      table.dropColumn('amber_tumor_baf');
    })
    .alterTable('zcc_seq_metrics', (table) => {
      table.dropColumn('amber_tumor_baf');
    });
}


export async function down(knex: Knex): Promise<void> {
}

