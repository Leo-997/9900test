import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_somatic_methylation_counts',
    function createCuratedGermlineSnvCountsTbl(table) {
      table.string('meth_class_id', 120).notNullable().primary();

      table.integer('sample_count', 11).defaultTo(null);
      table.integer('cancer_types', 11).defaultTo(null);

      table
        .foreign('meth_class_id')
        .references('meth_class_id')
        .inTable('zcc_curated_sample_somatic_methylation')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
