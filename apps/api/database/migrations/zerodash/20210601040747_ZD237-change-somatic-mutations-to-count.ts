import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_sample',
    function changeSomaticMutations(table) {
      table.dropColumn('som_missense_snv_mb');
      table.integer('som_missense_snvs').defaultTo(null);
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
