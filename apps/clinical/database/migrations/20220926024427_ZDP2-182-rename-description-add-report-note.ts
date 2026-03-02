import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_slides', (table) => {
    table.text('report_note').after('description');
    table.renameColumn('description', 'slide_note');
  });
}


export async function down(knex: Knex): Promise<void> {
}

