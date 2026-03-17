import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_drug_trials', (table) => {
    table.uuid('therapy_drug_id')
      .after('id')
      .notNullable();

    table.foreign('therapy_drug_id')
      .references('id')
      .inTable('zcc_clinical_therapy_drugs')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.dropForeign(['drug_id']);
    table.dropColumn('drug_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
