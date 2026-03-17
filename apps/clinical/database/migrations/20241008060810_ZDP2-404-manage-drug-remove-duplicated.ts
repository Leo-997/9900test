import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_drugs', (table) => {
    table.dropColumns('name', 'has_paediatric_dose', 'company', 'fda_approved', 'artg_approved');
  })
    .then(() => (
      knex.schema.alterTable('zcc_clinical_therapy_drugs', (table) => {
        table.dropColumns('alt_drug_id', 'drug_tier');
        table.string('external_drug_class_id').after('drug_class_id');
      })
    ))
    .then(async () => {
      const resp = await knex
        .select({
          externalId: 'drugClass.external_id',
          drugClassId: 'therapyDrugs.drug_class_id',
        })
        .from({ drugClass: 'zcc_clinical_drug_class' })
        .innerJoin({ therapyDrugs: 'zcc_clinical_therapy_drugs' }, 'therapyDrugs.drug_class_id', 'drugClass.id');

      await Promise.all(resp.map(({ externalId, drugClassId }) => (
        knex
          .update({
            external_drug_class_id: externalId,
          })
          .from({ therapyDrugs: 'zcc_clinical_therapy_drugs' })
          .where('therapyDrugs.drug_class_id', drugClassId)
      )));
    })
    .then(async () => {
      await knex.schema.alterTable('zcc_clinical_therapy_drugs', (table) => {
        table.dropForeign('drug_class_id');
        table.dropColumn('drug_class_id');
      });
      await knex.schema.dropTable('zcc_clinical_drug_class');
    });
}

export async function down(knex: Knex): Promise<void> {
}
