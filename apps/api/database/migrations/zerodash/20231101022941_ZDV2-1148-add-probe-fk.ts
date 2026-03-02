import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_probe_genes_xref', (table) => {
    table
      .foreign('probe_id', 'zcc_methylation_probe_genes_xref_probe_id')
      .references('probe_id')
      .inTable('zcc_methylation_probe')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
}
