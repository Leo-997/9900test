import { Knex } from 'knex';
import { v4 } from 'uuid';

export async function up(knex: Knex): Promise<void> {
  const drugs = await knex.select({
    clinical_version_id: 'clinical_version_id',
    report_type: knex.raw('"MTB_REPORT"'),
    external_drug_version_id: 'external_drug_version_id',
    pbs_approved: 'pbs_approved',
    appropriate_clinical_trial: 'appropriate_clinical_trial',
  })
    .from({ therapy: 'zcc_clinical_drugs' })
    .where('show_in_report', true)
    .then((rows) => rows.map((row) => ({ ...row, id: v4() })));

  if (drugs.length) {
    await knex.insert(
      await knex.select({
        clinical_version_id: 'clinical_version_id',
        report_type: knex.raw('"MTB_REPORT"'),
        external_drug_version_id: 'external_drug_version_id',
        pbs_approved: 'pbs_approved',
        appropriate_clinical_trial: 'appropriate_clinical_trial',
      })
        .from({ therapy: 'zcc_clinical_drugs' })
        .where('show_in_report', true)
        .then((rows) => rows.map((row) => ({ ...row, id: v4() }))),
    )
      .into('zcc_clinical_report_drugs')
      .onConflict(['clinical_version_id', 'external_drug_version_id', 'report_type'])
      .ignore();
  }
  return knex.schema.dropTable('zcc_clinical_drugs');
}

export async function down(knex: Knex): Promise<void> {
}
