import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table
      .foreign('mol_alteration_group_id')
      .references('group_id')
      .inTable('zcc_clinical_mol_alterations_group')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('clinical_diagnosis_recommendation_id', 'diagnosis_rec_foreign')
      .references('id')
      .inTable('zcc_clinical_diagnosis_recommendations')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('therapy_id')
      .references('id')
      .inTable('zcc_clinical_therapies')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('clinical_version_id')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
