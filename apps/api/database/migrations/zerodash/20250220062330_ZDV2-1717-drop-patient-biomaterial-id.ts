import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.dropColumn('parent_biomaterial_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.integer('parent_biomaterial_id').nullable().after('biomaterial_name');
  });
}
