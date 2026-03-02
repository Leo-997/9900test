import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_somatic_snv_counts',
    function addSomaticSnvCountTable(table) {
      table.integer('variant_id', 10).notNullable().primary();
      table.integer('sample_count', 11).defaultTo(null);
      table.integer('cancer_types', 11).defaultTo(null);

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
