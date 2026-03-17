import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.renameTable('zcc_clinical_therapy_drug_evidences', 'zcc_clinical_therapy_evidence')
    .then(() => (
      knex.schema.alterTable('zcc_clinical_therapy_evidence', (table) => {
        table.dropForeign(['therapy_drug_id'], 'zcc_clinical_therapy_drug_evidences_therapy_drug_id_foreign');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_therapy_evidence', (table) => {
        table.dropColumn('therapy_drug_id');
        table.string('therapy_id').after('id').notNullable();

        table.foreign('therapy_id')
          .references('id')
          .inTable('zcc_clinical_therapies')
          .onUpdate('RESTRICT')
          .onDelete('RESTRICT');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
