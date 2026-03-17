import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.enu('biosample_status', ['normal', 'tumour', 'donor', 'liqbiopsy']).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.enu('biosample_status', ['normal', 'tumour', 'donor']).alter();
  });
}
