import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_assay', (table) => {
    table.dropColumn('library_prep');
    table.dropColumn('extraction_prot');

    table.string('platform', 255).nullable().defaultTo(null).after('assay_name');
    table.string('provider', 75).notNullable().after('platform');

    table.enum('assay_type', [
      'wgs', 'rnaseq', 'panel', 'methylation', 'hts', 'pdx', 'dna_extraction',
      'rna_extraction', 'library_prep',
    ]).notNullable().alter();
    table.string('assay_name', 255).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
