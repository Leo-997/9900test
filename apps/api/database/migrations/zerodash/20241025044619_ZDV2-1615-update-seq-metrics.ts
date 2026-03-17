import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // need to keep the table to move the data to the new table
  return knex.schema.renameTable('zcc_seq_metrics', 'zcc_seq_metrics_deprecated')
    .then(() => (
      knex.schema.alterTable('zcc_seq_metrics_deprecated', (table) => {
        table.dropForeign(['platform_id'], 'zcc_seq_metrics_platform_id_foreign');
      })
    ))
    .then(() => (
      knex.schema.createTable('zcc_seq_metrics', (table) => {
        table.string('biosample_id', 150).notNullable();
        table.integer('platform_id').unsigned().notNullable();
        table.double('mean_coverage');
        table.double('x20');
        table.double('x30');
        table.double('x50');
        table.integer('uniq_mapped_reads');
        table.double('uniq_mapped_reads_pct');
        table.double('rin');
        table.enum('amber_qc', ['PASS', 'WARN', 'FAIL']);
        table.double('amber_contamination_pct');
        table.string('qc_status');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.string('created_by');
        table.string('updated_by');

        table.primary(['biosample_id', 'platform_id']);
        table.index(['biosample_id']);
        table.index(['platform_id']);

        table
          .foreign('biosample_id')
          .references('biosample_id')
          .inTable('zcc_biosample')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');

        table
          .foreign('platform_id')
          .references('platform_id')
          .inTable('zcc_platforms')
          .onDelete('CASCADE')
          .onUpdate('CASCADE');

        table.engine('InnoDB');
        table.charset('utf8');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
