import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_samples', (table) => {
    table.string('tumour_assays').after('biomaterial');
    table.string('germline_assays').after('tumour_assays');
  });
}

export async function down(): Promise<void> {
}
