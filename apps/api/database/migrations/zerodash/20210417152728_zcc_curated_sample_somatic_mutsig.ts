import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_somatic_mutsig',
    function createCuratedSampleSomaticMutsig(table) {
      table.string('sample_id', 150).notNullable();

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
        .notNullable();
      table.specificType('sig_contrib', 'double').defaultTo(null);

      table.string('reportable').defaultTo(null);
      table.boolean('targetable').defaultTo(null);
      table.text('curator_summary').defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.primary(['sample_id', 'signature']);

      table.index('sample_id');

      table
        .foreign('sample_id')
        .references('zcc_sample.sample_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
