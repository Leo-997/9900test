import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_methylation_classifier', table => {
    table.uuid('meth_classifier_id').notNullable().primary();
    table.integer('external_id').nullable().defaultTo(null);
    table.string('name', 100).notNullable();
    table.string('version', 10).notNullable();
    table.string('description', 100).nullable().defaultTo(null);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

