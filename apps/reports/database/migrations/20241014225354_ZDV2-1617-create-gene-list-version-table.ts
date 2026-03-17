import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_gene_list_version', (table) => {
    table.uuid('id').primary();
    table.uuid('gene_list_id').notNullable();
    table.string('version', 10).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.string('gene_panel');

    table.foreign('gene_list_id')
      .references('id')
      .inTable('zcc_gene_list')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.unique(['gene_list_id', 'version']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
