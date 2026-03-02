import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_therapy_drugs', (table) => {
    table.string('drug_tier', 10).defaultTo(null).after('drug_class_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
