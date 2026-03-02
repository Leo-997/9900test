import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_zd_qc', (table) => {
    table.enum('type', [
        'vaf_subclonal_dist',
        'rig_profile',
        'cnv_profile',
        'vaf_clonal_dist',
        'purple_minor_allele_ploidy',
        'purple_clonality_model',
        'purple_fitted_segment',
        'purple_kataegis_clusters',
        'purple_somatic_variant_ploidy',
        'purple_copy_number',
        'purple_purity_range',
        'report',
      ])
      .alter();
  });
}


export async function down(knex: Knex): Promise<void> {
}

