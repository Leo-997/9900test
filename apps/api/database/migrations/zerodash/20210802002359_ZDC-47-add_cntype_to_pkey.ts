import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_armcnv',
    function updatePrimaryKey(table) {
      table.dropPrimary();
      table.primary(['sample_id', 'chr', 'arm', 'cn_type']);

      table.index(['chr', 'arm', 'cn_type']);
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
