import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_methylation_probe_genes_xref', (table) => {
    table.integer('gene_id').notNullable().unsigned();
    table.string('probe_id', 50).notNullable();

    table.primary(['probe_id', 'gene_id']);

    table
      .foreign('gene_id')
      .references('gene_id')
      .inTable('zcc_genes')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');

    table
      .foreign('probe_id')
      .references('probe_id')
      .inTable('zcc_methylation_probe')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
