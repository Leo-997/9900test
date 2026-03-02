import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_hts_drugs', (table) => {
    table.uuid('clinical_version_id')
      .after('id')
      .notNullable()
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.string('hts_biosample_id', 150)
      .after('clinical_version_id')
      .notNullable()
      .index();

    table.uuid('screen_id')
      .after('hts_biosample_id')
      .notNullable()
      .index();

    table.string('reporting_rationale', 50).after('screen_id');
    table.string('correlation', 50).after('reporting_rationale');
    table.json('additional_data').after('reported_as');

    table.dropForeign(['drug_id']);
    table.dropColumns('sample_id', 'hts_id', 'drug_id', 'drug_name', 'targets', 'reportable', 'file_id');
    table.unique(['clinical_version_id', 'hts_biosample_id', 'screen_id'], { indexName: 'zcc_clinical_hts_drugs_unique' });
  });
}

export async function down(knex: Knex): Promise<void> {
}
