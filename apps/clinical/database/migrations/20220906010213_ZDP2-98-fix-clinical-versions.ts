import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.timestamp('mtb_date').nullable().after('sample_id');
    table.integer('patient_age_at_death').after('person_age_at_death');
  })
  .then(async () => {
    await knex('zcc_clinical_versions').update(
      'patient_age_at_death', knex.column('person_age_at_death')
    )
  })
  .then(async () => {
    await knex.schema.alterTable('zcc_clinical_versions', (table) => {
      table.dropColumn('person_age_at_death')
    })
  });
}


export async function down(knex: Knex): Promise<void> {
}

