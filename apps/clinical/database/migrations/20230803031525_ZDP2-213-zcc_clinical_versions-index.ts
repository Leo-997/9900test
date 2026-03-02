import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.index('status');
    table.index('clinician_id');
    table.index('zero2_category');
    table.index('zero2_subcategory1');
    table.index('zero2_subcategory2');
    table.index('zero2_final_diagnosis');
    table.index('mtb_date');
  });
}

export async function down(knex: Knex): Promise<void> {
}
