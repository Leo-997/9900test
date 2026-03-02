import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_drug_class', (table) => {
    table.uuid('id').primary();
    table.string('class').notNullable();
    table.string('external_id').notNullable();

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
