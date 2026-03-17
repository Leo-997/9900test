import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.dropColumns('show_in_discussion', 'discussion_order', 'discussion_note', 'is_accepted');
    table.boolean('in_report').defaultTo(null).after('slide_order');
    table.renameColumn('recommendation', 'type');
  });
}

export async function down(knex: Knex): Promise<void> {
}
