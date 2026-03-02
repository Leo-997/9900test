import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.integer('presentation_mode_scale').unsigned().defaultTo(115).after('discussion_columns');
  });
}

export async function down(knex: Knex): Promise<void> {
}
