import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_hts_drug_combinations', (table) => {
    table.uuid('id').primary();
    table.uuid('clinical_version_id')
      .notNullable()
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('hts_biosample_id', 150).notNullable().index();
    table.uuid('screen_id_1').notNullable().index();
    table.uuid('screen_id_2').notNullable().index();
    table.string('reporting_rationale', 50);
    table.string('correlation', 50);
    table.json('additional_data');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by');
    table.timestamp('updated_at');
    table.string('updated_by');
    table.unique(['clinical_version_id', 'hts_biosample_id', 'screen_id_1', 'screen_id_2'], { indexName: 'zcc_clinical_hts_drug_combinations_unique' });

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
