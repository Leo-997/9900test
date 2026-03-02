import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_gene_list', (table) => {
    table.uuid('id').primary();
    table.string('name').unique().notNullable();
    table.enum('type', ['somatic', 'germline', 'rna', 'other']).notNullable();
    table.boolean('is_high_risk').defaultTo(false);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
