import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_armcnv',
    function indexChrArm(table) {
      table.index(['chr', 'arm']);
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
