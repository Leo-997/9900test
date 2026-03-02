import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_qc_metrics_warning_acknowledgement',
    function createQcMetricsWarningAcknowledgementTlbl(table) {
      table.string('sample_id', 255).notNullable();
      table.string('user_id', 255).notNullable();
      table.boolean('acknowledged').notNullable();
      table.string('note', 255).notNullable();
      table.timestamp('acknowledgedAt');

      table.primary(['sample_id', 'user_id']);

      table
        .foreign('sample_id')
        .references('zcc_sample.sample_id')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
      
      table
        .foreign('user_id')
        .references('zcc_users.id')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    }
  )
}

export async function down(knex: Knex): Promise<void> {
}

