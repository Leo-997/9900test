import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_probe', (table) => {
    table.string('rep_results_by_name', 150).defaultTo(null);
    table.string('rep_results_by_seq', 150).defaultTo(null);
    table.string('rep_results_by_loc', 150).defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
}
