import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_germline_snv',
    function addPhenotypeColumn(table) {
      table
        .enum('phenotype', ['GUS', 'GUS 3.8', 'Confirmed'])
        .defaultTo(null)
        .after('sjc_medal');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
