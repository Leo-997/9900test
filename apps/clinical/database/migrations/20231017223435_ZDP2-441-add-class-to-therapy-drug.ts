import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_therapy_drugs', (table) => {
    table.string('drug_id').alter();
    table.uuid('drug_class_id').notNullable().after('therapy_id');

    table.foreign('drug_class_id')
      .references('id')
      .inTable('zcc_clinical_drug_class')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
