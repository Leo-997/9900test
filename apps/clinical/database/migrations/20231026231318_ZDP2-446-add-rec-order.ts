import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.smallint('slide_order').after('tier');
    table.smallint('discussion_order').after('show_in_discussion');
  });
}

export async function down(knex: Knex): Promise<void> {
}
