import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_report_drugs', (table) => {
    table.uuid('id').primary();
    table.uuid('clinical_version_id')
      .notNullable()
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.string('report_type', 50).notNullable().index();
    table.uuid('external_drug_version_id').notNullable().index();
    table.boolean('pbs_approved');
    table.boolean('appropriate_clinical_trial');

    table.unique(['clinical_version_id', 'external_drug_version_id', 'report_type'], { indexName: 'zcc_clinical_report_drug_unique' });

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
