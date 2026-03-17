import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_methylation', (table) => {
    table.renameColumn('reportable', 'classification');
  })
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_methylation', (table) => {
        table.boolean('reportable').defaultTo(null).after('classification');
        table.boolean('in_molecular_report').defaultTo(null).after('reportable');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
