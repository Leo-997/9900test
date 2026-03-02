import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.dropColumn('purity');
    table.dropColumn('ploidy');
    table.dropColumn('msi_status');
    table.dropColumn('amber_qc');
    table.dropColumn('contamination');
    table.dropColumn('contamination_score');
    table.dropColumn('rna_uniq_mapped_reads');
    table.dropColumn('rna_uniq_mapped_reads_pct');
    table.dropColumn('rna_rin');
  });
}

export async function down(knex: Knex): Promise<void> {
}
