import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TRIGGER IF EXISTS update_curation_finalised_at;
  `);
}

export async function down(knex: Knex): Promise<void> {
}