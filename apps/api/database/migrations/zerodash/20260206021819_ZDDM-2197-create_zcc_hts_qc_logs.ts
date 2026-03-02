import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_hts_qc_logs', (table) => {
    table.string('log_id', 36).notNullable();
    table.string('biosample_id', 150).notNullable();
    table.enum('submitted_status', ['PASS', 'FAIL', 'PENDING']).defaultTo(null);
    table.timestamp('created_on').notNullable();
    table.string('created_by', 255).notNullable();
    table.primary(['log_id']);

    table.index(['biosample_id'], 'zcc_hts_qc_logs_biosample');
    table.index(['created_by'], 'zcc_hts_qc_logs_user');

    table
      .foreign('biosample_id', 'zcc_hts_qc_logs_biosample')
      .references('zcc_biosample.biosample_id');

    table.engine('InnoDB');
    table.charset('utf8mb3');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('zcc_hts_qc_logs');
}