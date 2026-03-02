import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_gene_list_version_gene_xref', (table) => {
    table.uuid('gene_list_version_id').notNullable();
    table.integer('gene_id').unsigned().notNullable();

    table.primary(['gene_list_version_id', 'gene_id']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
