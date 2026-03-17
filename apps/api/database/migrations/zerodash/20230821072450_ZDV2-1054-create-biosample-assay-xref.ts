import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_biosample_assay_xref', (table) => {
    table.string('biosample_id', 150).notNullable();
    table.string('assay_id', 36).notNullable();

    table.primary(['biosample_id', 'assay_id']);
    table.index('assay_id', 'zcc_biosample_assay_xref_assay_idx');

    table
      .foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .foreign('assay_id')
      .references('assay_id')
      .inTable('zcc_assay')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
