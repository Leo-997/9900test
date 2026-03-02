import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_somatic_armcnv_counts',
    function createCuratedSomaticCnvCountsTbl(table) {
      table.string('chr', 15).notNullable();
      table.enum('arm', ['p', 'q', 'centromere', 'telomere']).notNullable();

      table.integer('sample_count', 11).defaultTo(null);
      table.integer('cancer_types', 11).defaultTo(null);

      table.primary(['chr', 'arm']);

      table.index(['chr', 'arm']);
      table
        .foreign(['chr', 'arm'])
        .references(['chr', 'arm'])
        .inTable('zcc_curated_sample_somatic_armcnv')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
