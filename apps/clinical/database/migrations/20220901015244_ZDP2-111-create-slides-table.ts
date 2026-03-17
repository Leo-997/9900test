import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_slides', (table) => {
    table.string('id').primary();
    table.integer('index').unsigned().notNullable();
    table.string('title');
    table.text('description');
    table.string('mol_alteration_group_id');
    table.boolean('is_hidden').defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('updated_by');
    table.timestamp('deleted_at');
    table.string('deleted_by');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

