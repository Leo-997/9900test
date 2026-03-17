import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_evidences', (table) => {
    table.unique(['external_id', 'sample_id', 'entity_type', 'entity_id'], { indexName: 'zcc_evidences_unique_link' });
  });
}

export async function down(knex: Knex): Promise<void> {
}
