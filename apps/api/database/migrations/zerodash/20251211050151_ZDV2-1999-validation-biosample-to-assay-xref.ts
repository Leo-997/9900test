import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample_assay_xref', (table) => {
    table.string('validation_biosample_id', 150).nullable().defaultTo(null);

    table.foreign('validation_biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample_assay_xref', (table) => {
    table.dropColumn('validation_biosample_id');
  });
}
