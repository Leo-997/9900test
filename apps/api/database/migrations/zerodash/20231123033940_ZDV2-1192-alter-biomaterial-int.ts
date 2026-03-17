import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.integer('biomaterial_id').unsigned().alter();
  });
}
export async function down(knex: Knex): Promise<void> {
}
