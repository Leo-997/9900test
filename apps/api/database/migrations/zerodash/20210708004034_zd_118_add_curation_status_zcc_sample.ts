import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_sample',
    function addCurationStatusColumn(table) {
      table
        .enum('curation_status', [
          'Preliminary Data Ready',
          'RNA Data Entry',
          'Ready for Curation',
          'Curation in Progress',
          'Ready Curation Meeting',
          'Curated',
          'Ready for MTB',
        ])
        .defaultTo(null)
        .after('loh_proportion');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
