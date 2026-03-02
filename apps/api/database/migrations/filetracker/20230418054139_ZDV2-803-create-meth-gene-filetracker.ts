import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_zd_methylation_genes', (table) => {
    table.uuid('file_id').primary().notNullable();
    table.string('meth_sample_id', 150);
    table.string('gene', 45);
    
    table.foreign('file_id')
      .references('file_id')
      .inTable('datafiles')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

