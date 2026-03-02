import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_seq_metrics',
    function addPlatformsFkToWgsMetrics(table) {
      table.index('platform_id');
      table.foreign('platform_id').references('zcc_platforms.platform_id');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
