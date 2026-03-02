import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_zd_fusion', table => {
    table.uuid('file_id').primary().notNullable();
    table.string('start_gene', 45);
    table.string('end_gene', 45);
    table.string('chr_bkpt1', 15);
    table.integer('pos_bkpt1').unsigned();
    table.string('chr_bkpt2', 15);
    table.integer('pos_bkpt2').unsigned();

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

