import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_cyto_annotation_threads`,
    function addCytoThreadTbl(table) {
      table.string('sample_id', 150).notNullable();
      table.string('chromosome').notNullable();
      table.integer('comment_thread_id', 10).unsigned();
      table.integer('summary_thread_id', 10).unsigned();

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');

      table.primary(['sample_id', 'chromosome']);

      table
        .foreign(['sample_id'])
        .references(['sample_id'])
        .inTable('zcc_sample')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
      
      table
        .foreign(['comment_thread_id'])
        .references(['comment_thread_id'])
        .inTable('zcc_annotation_comment_thread')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table
        .foreign(['summary_thread_id'])
        .references(['summary_thread_id'])
        .inTable('zcc_annotation_summary_thread')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
      
      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}

