import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_immunoprofile',
    (table) => {
      table.uuid('analysis_set_id').notNullable().primary();
      table.float('ipass_value').defaultTo(null);
      table
        .enum('ipass_status', ['T-cell infiltrated', 'Cold'])
        .defaultTo(null);

      table
        .foreign('analysis_set_id', 'zcc_curated_sample_immunoprofile_analysis')
        .references('analysis_set_id')
        .inTable('zcc_analysis_set')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
