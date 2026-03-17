import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_pdx_metadata', (table) => {
    table.string('biosample_id', 150).notNullable().primary();
    table.string('contributor', 45).nullable();
    table.string('pdx_subject_id', 20).nullable();
    table.string('source', 45).nullable();
    table.tinyint('passage', 1).unsigned().nullable();
    table.enum('subtype', ['ETP', 'MLL', 'Ph-like', 'Ph+', 'MYCN']).nullable();
    table.tinyint('grade').unsigned().nullable();
    table.enum('staging', ['primary', 'metastatic']).nullable();
    table.tinyint('available').unsigned().nullable();

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.index('contributor', 'idx_zcc_pdx_metadata_contributor');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
