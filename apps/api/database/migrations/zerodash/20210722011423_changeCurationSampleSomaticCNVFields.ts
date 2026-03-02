import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_cnv',
    function changeCuratedSampleSomaticCNVFields(table) {
      table
        .enu('pathclass', [
          'C5: Pathogenic',
          'C4: Likely pathogenic',
          'C3: Unknown pathogenicity',
          'C2: Unlikely pathogenic',
          'C1: Not pathogenic',
          'C3.8: VOUS',
          'False Positive',
          'Unclassified',
          'Failed PathOS filters',
        ])
        .defaultTo(null)
        .alter();
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
