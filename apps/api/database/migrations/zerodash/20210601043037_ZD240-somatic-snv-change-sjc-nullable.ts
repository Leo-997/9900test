import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_somatic_snv',
    function addPhenotypeColumn(table) {
      table
        .enum('sjc_medal', ['Gold', 'Silver', 'Bronze'])
        .nullable()
        .defaultTo(null)
        .alter();
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
