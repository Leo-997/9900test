import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_panel_reportable_notes', (table) => {
    table.increments('id').primary();
    table.string('gene_panel').notNullable();
    table.enu('type', ['rna', 'cytogenetics']).notNullable();
    table.text('content');

    table.index('gene_panel');
    table.unique(['gene_panel', 'type']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
