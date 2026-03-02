import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_therapy_drugs', (table) => {
    table.uuid('external_drug_version_id')
      .after('external_drug_class_id');
  })
    .then(() => (
      knex.update({
        external_drug_version_id: knex
          .select('external_drug_version_id')
          .from('zcc_clinical_drugs')
          .where('id', knex.raw('??', ['therapy.drug_id']))
          .first(),
      })
        .from({ therapy: 'zcc_clinical_therapy_drugs' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_therapy_drugs', (table) => {
        table.dropUnique(['therapy_id', 'drug_id'], 'zcc_clinical_therapy_drugs_therapy_id_drug_id_alt_drug_id_unique');
        table.dropForeign(['drug_id']);
        table.dropColumn('drug_id');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_therapy_drugs', (table) => {
        table.index('external_drug_version_id');
        table.unique(['therapy_id', 'external_drug_version_id'], { indexName: 'zcc_clinical_therapy_drugs_unique' });
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
