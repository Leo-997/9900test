import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', (table) => {
    table.string('hts_culture_validation', 45).after('hts_cond_incubation');
  });
}

export async function down(knex: Knex): Promise<void> {
}
