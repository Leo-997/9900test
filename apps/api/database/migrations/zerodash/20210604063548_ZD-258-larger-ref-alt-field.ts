import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_snv',
    function updateRefAltLargerFields(table) {
      table.string('ref', 500).notNullable().alter();
      table.string('alt', 800).notNullable().alter();

      table.unique(
        ['chr', 'pos', knex.raw('`ref`(250)'), knex.raw('`alt`(250)')],
        'zcc_curated_snv_uniq_key',
      );
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
