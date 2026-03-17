import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_somatic_snv_counts',
    function createCuratedSomaticSnvCountsTbl(table) {
      table.string('sample_id', 150).notNullable().primary();

      table.specificType('din', 'double').defaultTo(null);
      table.date('date_to_tapestation').defaultTo(null);
      table.boolean('sent_to_agrf').defaultTo(null);
      table.bigInteger('sentrix_barcode').defaultTo(null);
      table.string('sample_section', 50).defaultTo(null);
      table.string('dkfz_classifier', 200).defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table
        .foreign('sample_id')
        .references('sample_id')
        .inTable('zcc_sample')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
