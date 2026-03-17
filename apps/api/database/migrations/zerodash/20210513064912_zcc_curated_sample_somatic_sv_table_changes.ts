import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_sv',
    function changeCuratedSampleSomaticSvFields(table) {
      table
        .enu('inframe', ['W', 'R', 'P', 'WR', 'WP', 'RP', 'WPR', 'No'])
        .defaultTo(null)
        .alter();
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
