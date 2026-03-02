import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_gene_list_version', (table) => {
    table.timestamps(true, true);
    table.string('created_by');
    table.string('updated_by');
  });
}

export async function down(knex: Knex): Promise<void> {
}
