import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_reviewer', (table) => {
    table.enum('role', [
      'MTBChairs',
      'Clinicians',
      'CancerGeneticists',
      'Curators',
    ])
      .notNullable()
      .after('clinical_version_id');
  })
    .then(() => (
      knex.raw(`
        ALTER TABLE zcc_clinical_reviewer 
        DROP PRIMARY KEY,
        ADD PRIMARY KEY (clinical_version_id, role);
      `)
    ));
}

export async function down(knex: Knex): Promise<void> {
}
