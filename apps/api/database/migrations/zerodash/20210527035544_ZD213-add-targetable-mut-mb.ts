import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_sample',
    function addTargetableMbFields(table) {
      table
        .specificType('som_missense_snv_mb', 'double')
        .defaultTo(null)
        .after('mut_burden_mb');
      table.boolean('targetable').defaultTo(null).after('som_missense_snv_mb');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
