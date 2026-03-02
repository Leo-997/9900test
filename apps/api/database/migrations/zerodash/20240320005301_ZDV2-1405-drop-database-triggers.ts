import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const triggers = [
    'zcc_curated_germline_snv_subcat1_xref_AFTER_INSERT',
    'zcc_curated_sample_somatic_methylation_AFTER_INSERT',
    'zcc_curated_sample_somatic_methylation_AFTER_UPDATE',
    'zcc_curated_sample_germline_cnv_BEFORE_HELIUM_INSERT',
    'zcc_curated_sample_germline_cnv_BEFORE_HELIUM_UPDATE',
    'zcc_curated_sample_germline_cnv_AFTER_INSERT',
    'zcc_curated_sample_germline_cnv_AFTER_UPDATE',
    'zcc_sample_AFTER_INSERT_curation_workflow',
    'zcc_curated_sample_somatic_snv_BEFORE_HELIUM_INSERT',
    'zcc_curated_sample_somatic_snv_BEFORE_HELIUM_UPDATE',
    'zcc_curated_sample_somatic_snv_AFTER_INSERT',
    'zcc_curated_sample_somatic_snv_AFTER_UPDATE',
    'zcc_curated_sample_somatic_sv_BEFORE_HELIUM_INSERT',
    'zcc_curated_sample_somatic_sv_BEFORE_HELIUM_UPDATE',
    'zcc_curated_sample_somatic_sv_AFTER_INSERT',
    'zcc_curated_sample_somatic_sv_AFTER_UPDATE',
    'zcc_curated_sample_germline_snv_BEFORE_HELIUM_INSERT',
    'zcc_curated_sample_germline_snv_BEFORE_HELIUM_UPDATE',
    'zcc_curated_sample_germline_snv_AFTER_INSERT',
    'zcc_curated_sample_germline_snv_AFTER_UPDATE',
    'zcc_curated_sample_somatic_cnv_AFTER_INSERT',
    'zcc_curated_sample_somatic_cnv_AFTER_UPDATE',
    'zcc_curated_sample_methylation_genes_AFTER_INSERT',
    'zcc_curated_sample_methylation_genes_AFTER_UPDATE',
    'zcc_curated_sample_somatic_armcnv_AFTER_INSERT',
    'zcc_curated_sample_somatic_armcnv_AFTER_UPDATE',
    'zcc_curated_sample_somatic_mutsig_AFTER_INSERT',
    'zcc_curated_sample_somatic_mutsig_AFTER_UPDATE',
    'zcc_curated_sample_somatic_rnaseq_AFTER_INSERT',
    'zcc_curated_sample_somatic_rnaseq_AFTER_UPDATE',
  ];

  await Promise.all(triggers.map((trigger) => (
    knex.schema.raw(`DROP TRIGGER IF EXISTS ${trigger}`)
  )));
}

export async function down(knex: Knex): Promise<void> {
}
