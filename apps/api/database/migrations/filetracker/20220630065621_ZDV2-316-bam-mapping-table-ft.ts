import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_zd_bam', (table) => {
    table.string('file_id');
    table.enum('method', ['rna', 'wgs']);
    table.boolean('assembly');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

