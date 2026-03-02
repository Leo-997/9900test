import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_hts_culture',
    function createHtsCultureTbl(table) {
      table.string('hts_id', 50).primary();
      table.string('sample_id', 150).notNullable();

      table.string('biomaterial', 50).notNullable();
      table.string(`hts_event`, 5).defaultTo(null);
      table.date(`hts_screen_date`).defaultTo(null);
      table.integer(`hts_duration_days`, 3).defaultTo(null);
      table.integer(`hts_num_drugs`, 4).defaultTo(null);
      table.integer('hts_num_concs', 3).defaultTo(null);
      table.string('hts_screen_format', 10).defaultTo(null);
      table.string('hts_passage', 70).defaultTo(null);
      table.double(`hts_num_cells`).defaultTo(null);
      table.string('hts_viability_pct', 10).defaultTo(null);
      table.text(`hts_cond_culture`);
      table.string('hts_screen_platform', 20).defaultTo(null);
      table.string('hts_rocki', 5).defaultTo(null);
      table.string('hts_cond_incubation', 45).defaultTo(null);
      table.string('hts_valid_method', 45).defaultTo(null);
      table.string('hts_valid_result', 100).defaultTo(null);
      table.text(`comments`);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.index('sample_id');
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
