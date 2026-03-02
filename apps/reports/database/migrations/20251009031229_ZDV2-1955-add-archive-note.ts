import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_gene_list_version', (table) => {
    table.text('archive_notes').after('gene_panel');
  });
}

export async function down(knex: Knex): Promise<void> {
}
