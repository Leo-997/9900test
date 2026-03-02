import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_rnaseq_metrics', (table) => {
    table.string('biosample_id', 150).primary();
    table.integer('uniq_mapped_reads').nullable().defaultTo(null);
    table.float('uniq_mapped_reads_pct').nullable().defaultTo(null);
    table.float('rin').nullable().defaultTo(null);
    table.timestamps(false, true);
    table.string('created_by').nullable().defaultTo(null);
    table.string('updated_by').nullable().defaultTo(null);
    table.foreign('biosample_id').references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('cascade')
      .onUpdate('cascade');
    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_rnaseq_metrics');
}
