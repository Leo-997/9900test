import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_sample_curation_summary_notes`,
    function addExpediteToSampleTbl(table) {
      table.string('sample_id', 150).primary();

      table.text('snv_summary').defaultTo(null);
      table.text('sv_summary').defaultTo(null);
      table.text('cnv_summary').defaultTo(null);
      table.text('rna_summary').defaultTo(null);
      table.text('methylation_summary').defaultTo(null);
      table.text('germline_summary').defaultTo(null);
      table.text('mut_sig_summary').defaultTo(null);
      table.text('helium_summary').defaultTo(null);
      table.text('cytogenetics_summary').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

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
