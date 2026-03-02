import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_snv_anno',
    function dropDoubleColumns(table) {
      table.dropColumn('pecan');
      table.dropColumn('sjc_medal');
      table.dropColumn('purple_hotspot');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
