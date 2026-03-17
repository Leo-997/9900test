import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_assay', (table) => {
    table.enum('assay_source', [
      'dna', 'rna', 'protein', 'cells',
    ]).notNullable();
    table.string('assay_type', 75).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
