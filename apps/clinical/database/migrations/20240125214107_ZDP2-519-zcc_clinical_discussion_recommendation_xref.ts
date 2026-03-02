import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_discussion_recommendation_xref', (table) => {
    table.string('parent_recommendation_id');
    table.string('child_recommendation_id');
    table.smallint('order');

    table.primary(['parent_recommendation_id', 'child_recommendation_id']);

    table
      .foreign('parent_recommendation_id', 'parent_recommendation_id_foreign')
      .references('id')
      .inTable('zcc_clinical_recommendations')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .foreign('child_recommendation_id', 'child_recommendation_id_foreign')
      .references('id')
      .inTable('zcc_clinical_recommendations')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
