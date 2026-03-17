import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_samples', (table) => {
    table.index('hts_id');
    table.index('zero2_category');
    table.index('zero2_subcategory1');
    table.index('zero2_subcategory2');
    table.index('zero2_final_diagnosis');
  });
}

export async function down(knex: Knex): Promise<void> {
}
