import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_somatic_armcnv_counts',
    function updatePrimaryKey(table) {
      table.dropPrimary();
      table.primary(['chr', 'arm', 'cn_type']);

      table.dropForeign(['chr', 'arm']);
      table
        .foreign(['chr', 'arm', 'cn_type'])
        .references(['chr', 'arm', 'cn_type'])
        .inTable('zcc_curated_sample_somatic_armcnv')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
