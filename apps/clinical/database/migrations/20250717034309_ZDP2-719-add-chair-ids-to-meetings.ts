import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_clinical_meetings', (table) => {
    table.string('chair_id').after('type').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
}
