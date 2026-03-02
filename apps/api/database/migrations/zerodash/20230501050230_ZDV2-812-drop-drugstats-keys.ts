import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', (table) => {
    table.dropPrimary();
    table.dropForeign(['drug_id']);
    table.dropIndex(['drug_id']);
    table.dropUnique(['sample_id', 'drug_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
