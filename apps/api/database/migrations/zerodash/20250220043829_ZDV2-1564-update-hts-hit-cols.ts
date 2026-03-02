import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', (table) => {
    // This is quite safe as there are no keys that get dropped then recreated for this table
    table.renameColumn('reportable_hit', 'reportable');
  })
    .then(() => (
      knex.schema.alterTable('zcc_hts_drugstats', (table) => {
        table.string('reporting_rationale', 50).after('reportable');
        table.string('correlation', 50).after('reporting_rationale');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
