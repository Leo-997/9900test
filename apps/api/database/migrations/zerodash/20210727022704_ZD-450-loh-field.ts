import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_somatic_snv',
    function addSomaticSnvLohField(table) {
      table.string('LOH', 10).defaultTo(null).after('hotspot');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
