import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', async (table) => {
    table.float('change_ratio').defaultTo(null).after('maximum_effect_mtc');
  });
}

export async function down(knex: Knex): Promise<void> {
}
