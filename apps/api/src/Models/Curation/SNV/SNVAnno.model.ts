/* eslint-disable camelcase */

/**
 * The format of this model matches the database field names exactly.
 * This is intentional as it is only used for inserting to the database.
 */
export interface ISNVAnno {
  variant_id: string;
  cadd_scaled: string;
  fathmm_pred: string;
  provean_pred: string;
  metalr_pred: string;
  metasvm_pred: string;
  clinvar_omim_id: string;
  clinvar_id: string;
  clinvar_significance: string;
  clinvar_confidence: string;
  clinvar_revstat: string;
  cosmic_id: string;
  cosmic_cosm_cnt: string;
  cosmic_cosn_cnt: string;
  cosmic_pri_site: string;
  cosmic_pri_histology: string;
  dbsnp_is_common: string;
  dbsnp_rsid: string;
  gnomad_ac_exome: string;
  gnomad_an_exome: string;
  gnomad_af_exome: string;
  gnomad_ac_genome: string;
  gnomad_an_genome: string;
  gnomad_af_genome: string;
  gnomad_ac_exome_popmax: string;
  gnomad_an_exome_popmax: string;
  gnomad_af_exome_popmax: string;
  gnomad_ac_genome_popmax: string;
  gnomad_an_genome_popmax: string;
  gnomad_af_genome_popmax: string;
  gnomad_nhomalt: string;
  gnomad_nhomalt_popmax: string;
  gnomad_ac_noncancer: string;
  gnomad_an_noncancer: string;
  gnomad_af_noncancer: string;
  mgrb_ac: string;
  mgrb_an: string;
  in_cancergenecensus: string;
  pfam_id: string;
  pfam_domain: string;
  pfam_description: string;
  pecan_count: string;
  sift_pred: string;
  polyphen_pred: string;
  pecan_somatic_medal?: string;
  pecan_germline_medal?: string;
}
