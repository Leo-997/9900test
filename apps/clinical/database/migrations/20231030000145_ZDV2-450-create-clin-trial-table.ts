import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_trials', (table) => {
    table.uuid('id').primary();
    table.string('name');
    table.string('trial_id');
    table.string('external_id');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');
    table.timestamp('updated_at');
    table.string('updated_by');
    table.timestamp('deleted_at');
    table.string('deleted_by');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
