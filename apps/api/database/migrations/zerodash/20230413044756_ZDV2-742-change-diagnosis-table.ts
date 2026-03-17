import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_diagnosis', (table) => {
    table.uuid('id').primary();
    table.string('sample_id', 150).notNullable();
    table.string('zero2_category', 50).notNullable();
    table.string('zero2_subcategory1', 500).notNullable();
    table.string('zero2_subcategory2', 500).notNullable();
    table.string('zero2_final_diagnosis', 500).notNullable();
    table.string('who_grade', 5).defaultTo(null);
    table.string('histology', 200).defaultTo(null);
    table.boolean(`molecular_confirmation`).defaultTo(null);
    table.string('pri_site', 50).defaultTo(null);
    table.string('sample_site', 50).defaultTo(null);
    table.string('sample_met_site', 50).defaultTo(null);
    table.string('ncit_term', 100).defaultTo(null);
    table.string('ncit_code', 20).defaultTo(null);
    table.string('note', 500).nullable().defaultTo(null);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by').defaultTo('sysadmin');

    table
      .foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_sample')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .foreign('created_by')
      .references('id')
      .inTable('zcc_users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
