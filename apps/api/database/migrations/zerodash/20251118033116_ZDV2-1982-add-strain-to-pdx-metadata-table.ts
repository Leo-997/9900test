import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_pdx_metadata', (table) => {
    table.enum('strain', ['NSG', 'MISTRG', 'NOD/SCID', 'BALB/c Nude']).nullable().defaultTo(null).after('passage');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_pdx_metadata', (table) => {
    table.dropColumn('strain');
  });
}
