import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_drugs', (table) => {
    table.string('external_drug_version_id').after('external_id');
  })
    .then(() => (
      knex
        .update({
          external_drug_version_id: knex.raw('external_id'),
        })
        .from('zcc_clinical_drugs')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_drugs', (table) => {
        table.dropColumn('external_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
