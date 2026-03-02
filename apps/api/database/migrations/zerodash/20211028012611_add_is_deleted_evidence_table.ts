import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_evidences', (table) => {
    table.boolean('is_deleted').after('citation_id').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {}
