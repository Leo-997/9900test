import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_somatic_mutsig_counts',
    function createCuratedGermlineSnvCountsTbl(table) {
      table
        .enum('signature', [
          'sig1',
          'sig2',
          'sig3',
          'sig4',
          'sig5',
          'sig6',
          'sig7',
          'sig8',
          'sig9',
          'sig10',
          'sig11',
          'sig12',
          'sig13',
          'sig14',
          'sig15',
          'sig16',
          'sig17',
          'sig18',
          'sig19',
          'sig20',
          'sig21',
          'sig22',
          'sig23',
          'sig24',
          'sig25',
          'sig26',
          'sig27',
          'sig28',
          'sig29',
          'sig30',
        ])
        .notNullable()
        .primary();

      table.integer('sample_count', 11).defaultTo(null);
      table.integer('cancer_types', 11).defaultTo(null);

      table
        .foreign('signature')
        .references('signature')
        .inTable('zcc_curated_sample_somatic_mutsig')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
