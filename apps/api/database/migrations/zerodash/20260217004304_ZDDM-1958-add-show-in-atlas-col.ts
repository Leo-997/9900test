import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_classifier', (table) => {
    table.boolean('show_in_atlas')
      .notNullable()
      .defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
}
