import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.string('provider_id', 36).after('manifest_name');
  })
    .then(() => (
      knex.schema.alterTable('zcc_biosample', (table) => {
        table
          .foreign('provider_id')
          .references('provider_id')
          .inTable('zcc_provider')
          .onUpdate('CASCADE')
          .onDelete('RESTRICT');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_provider', (table) => {
        table.string('provider_name', 50).alter();
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
