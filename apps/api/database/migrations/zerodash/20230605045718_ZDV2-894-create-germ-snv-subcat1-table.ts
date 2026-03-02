import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_germline_snv_subcat1_xref', (table) => {
    table.uuid('variant_id').notNullable();
    table.string('zero2_subcategory1', 500).notNullable();

    table.primary(['variant_id', 'zero2_subcategory1']);
    table.unique(['variant_id', 'zero2_subcategory1'], { indexName: 'variant_id_subcat1_unique' });
    table.index('variant_id');
    table.index('zero2_subcategory1');

    table
      .foreign('variant_id')
      .references('variant_id')
      .inTable('zcc_curated_snv')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
