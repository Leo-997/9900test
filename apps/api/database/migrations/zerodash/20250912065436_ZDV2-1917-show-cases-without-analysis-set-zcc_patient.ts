// YYYYMMDDHHmm_merge_patient_study_and_fk_updates.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1) Add new "study" column on zcc_patient
  await knex.schema.alterTable('zcc_patient', (table) => {
    table.string('study', 50).after('patient_id');
  });

  // 2) Backfill study
  await knex.transaction(async (trx) => {
    console.log('Backfilling new study field on zcc_patient table...');

    const toFill = await trx('zcc_patient')
      .whereNull('study')
      .orWhere('study', '')
      .count<{ count: number }[]>({ count: '*' });

    console.log(`Rows needing backfill: ${toFill[0].count}`);

    // Latest study per patient_id from analysis set
    const subquery = trx
      .select('patient_id', 'study')
      .from('zcc_analysis_set')
      .rowNumber('rn', (r) => r.partitionBy('patient_id').orderBy('created_at', 'desc'));

    const latest = trx
      .select('patient_id', 'study')
      .from(subquery.as('s'))
      .where('rn', 1)
      .as('t');

    // Backfill patient.study from latest analysis_set.study
    const updated = await trx('zcc_patient as p')
      .join(latest, 't.patient_id', 'p.patient_id')
      .update('p.study', trx.ref('t.study'))
      .where((q) => q.whereNull('p.study').orWhere('p.study', ''));

    console.log(`Updated ${updated} rows.`);

    // Any remaining null/empty set to "unknown"
    const unknown = await trx('zcc_patient')
      .where((q) => q.whereNull('study').orWhere('study', ''))
      .update({ study: 'unknown' });

    if (unknown > 0) {
      console.log(
        `"study" field set to "unknown" on ${unknown} records. Please, add manually study.`,
      );
    } else {
      console.log('No patient to backfill remains.');
    }
  });

  // 3) Update PK on zcc_patient
  // Drop existing child FKs that point to patient_id
  await knex.schema.alterTable('zcc_sample', (t) => {
    t.dropForeign('patient_id', 'zcc_sample_patient_id_foreign');
  });
  await knex.schema.alterTable('zcc_analysis_set', (t) => {
    t.dropForeign('patient_id', 'zcc_analysis_set_patient_id_foreign');
  });
  await knex.schema.alterTable('zcc_biosample', (t) => {
    t.dropForeign('patient_id', 'zcc_samples_patient_id_foreign');
  });

  // Update parent PK to composite (patient_id, study)
  await knex.schema.alterTable('zcc_patient', (t) => {
    t.dropPrimary();
    t.primary(['patient_id', 'study']);
  });

  // Re-add child FKs
  await knex.schema.alterTable('zcc_analysis_set', (t) => {
    t
      .foreign(['patient_id'], 'zcc_analysis_set_patient_id_foreign')
      .references(['patient_id'])
      .inTable('zcc_patient')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');
  });
  await knex.schema.alterTable('zcc_biosample', (t) => {
    t
      .foreign(['patient_id'], 'zcc_biosample_patient_id_foreign')
      .references(['patient_id'])
      .inTable('zcc_patient')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
  // intentionally left blank
}
