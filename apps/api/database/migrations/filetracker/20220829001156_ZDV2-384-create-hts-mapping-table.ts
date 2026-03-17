import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_zd_hts', (table) => {
    table.uuid('file_id').primary();
    table.string('hts_id');
    table.string('drug_id');
    table.enum('type', ['AUC', 'IC50', 'LN50', 'CELLS_END', 'CELLS_START']);
  });
}


export async function down(knex: Knex): Promise<void> {
}

