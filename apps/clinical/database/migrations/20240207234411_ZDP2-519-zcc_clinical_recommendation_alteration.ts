import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_recommendation_alteration', (table) => {
    table.string('recommendation_id');
    table.string('mol_alteration_id');

    table.primary(['recommendation_id', 'mol_alteration_id']);

    table
      .foreign('recommendation_id')
      .references('id')
      .inTable('zcc_clinical_recommendations')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table
      .foreign('mol_alteration_id')
      .references('id')
      .inTable('zcc_clinical_mol_alterations')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
