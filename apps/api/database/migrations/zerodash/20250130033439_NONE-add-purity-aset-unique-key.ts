import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_purity', (table) => {
    table.unique(['analysis_set_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
