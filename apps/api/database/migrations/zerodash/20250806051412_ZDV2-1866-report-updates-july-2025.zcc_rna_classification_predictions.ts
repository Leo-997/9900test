import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_rna_classification_predictions', (table) => {
    table.string('prediction', 45).primary();
    table.string('prediction_label');
    
    table.engine('InnoDB');
    table.charset('utf8');
  })
}


export async function down(knex: Knex): Promise<void> {
}

