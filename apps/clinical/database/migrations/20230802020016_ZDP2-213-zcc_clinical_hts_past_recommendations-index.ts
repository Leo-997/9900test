import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_hts_past_recommendations', (table) => {
    table
      .foreign('hts_addendum_id')
      .references('id')
      .inTable('zcc_clinical_addendum')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('recommendation_id')
      .references('id')
      .inTable('zcc_clinical_recommendations')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
