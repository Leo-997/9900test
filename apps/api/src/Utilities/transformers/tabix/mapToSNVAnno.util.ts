import { ISNVAnno } from 'Models/Curation/SNV/SNVAnno.model';
import md5ToUUID from 'Utilities/transformers/md5ToUUID.util';
import md5 = require('md5');

export default function mapToSNVAnno(
  header: string[],
  line: string[],
): ISNVAnno {
  const CPRA = [
    line[header.indexOf('Chr')],
    line[header.indexOf('Pos')],
    line[header.indexOf('Ref')],
    line[header.indexOf('Alt')],
  ];
  const variantString = CPRA.join('|');
  const utf8 = Buffer.from(variantString, 'utf-8');
  const hash = md5(utf8);

  return {
    variant_id: md5ToUUID(hash),
    cadd_scaled: line[header.indexOf('CADD Scaled')],
    fathmm_pred: line[header.indexOf('FATHMM_pred')],
    provean_pred: line[header.indexOf('PROVEAN_pred')],
    metalr_pred: line[header.indexOf('MetaLR_pred')],
    metasvm_pred: line[header.indexOf('MetaSVM_pred')],
    clinvar_omim_id: line[header.indexOf('OMIM Disorders')],
    clinvar_id: line[header.indexOf('ClinVar Variation ID')],
    clinvar_significance: line[header.indexOf('ClinVar Clinical Significance')],
    clinvar_confidence: line[header.indexOf('ClinVar Clinical Significance Conflicts')],
    clinvar_revstat: line[header.indexOf('cv_revstat')],
    cosmic_id: line[header.indexOf('COSMIC Coding ID')],
    cosmic_cosm_cnt: line[header.indexOf('COSMIC Coding Count')],
    cosmic_cosn_cnt: line[header.indexOf('COSMIC NonCoding Count')],
    cosmic_pri_site: line[header.indexOf('COSMIC Primary Site')],
    cosmic_pri_histology: line[header.indexOf('COSMIC Primary Histology')],
    dbsnp_is_common: line[header.indexOf('is_dbsnp_common')],
    dbsnp_rsid: line[header.indexOf('rs_ids')],
    gnomad_ac_exome: line[header.indexOf('ac_gnomad_exome_total')],
    gnomad_an_exome: line[header.indexOf('an_gnomad_exome_total')],
    gnomad_af_exome: line[header.indexOf('af_gnomad_exome_total')],
    gnomad_ac_genome: line[header.indexOf('gnomad_ac')],
    gnomad_an_genome: line[header.indexOf('gnomad_an')],
    gnomad_af_genome: line[header.indexOf('gnomad_af')],
    gnomad_ac_exome_popmax: line[header.indexOf('ac_gnomad_exome_popmax')],
    gnomad_an_exome_popmax: line[header.indexOf('an_gnomad_exome_popmax')],
    gnomad_af_exome_popmax: line[header.indexOf('af_gnomad_exome_popmax')],
    gnomad_ac_genome_popmax: line[header.indexOf('gnomad_ac_popmax')],
    gnomad_an_genome_popmax: line[header.indexOf('gnomad_an_popmax')],
    gnomad_af_genome_popmax: line[header.indexOf('gnomad_af_popmax')],
    gnomad_nhomalt: line[header.indexOf('gnomad_nhomalt')],
    gnomad_nhomalt_popmax: line[header.indexOf('gnomad_nhomalt_popmax')],
    gnomad_ac_noncancer: line[header.indexOf('gnomad_ac_noncancer')],
    gnomad_an_noncancer: line[header.indexOf('gnomad_an_noncancer')],
    gnomad_af_noncancer: line[header.indexOf('gnomad_af_noncancer')],
    mgrb_ac: line[header.indexOf('mgrb_ac')],
    mgrb_an: line[header.indexOf('MGRB AN')],
    in_cancergenecensus: line[header.indexOf('CGC Associations')],
    pfam_id: line[header.indexOf('pfam_id')],
    pfam_domain: line[header.indexOf('pfam_domain')],
    pfam_description: line[header.indexOf('pfam_description')],
    pecan_count: line[header.indexOf('pecan_count')],
    sift_pred: line[header.indexOf('SIFT Prediction')],
    polyphen_pred: line[header.indexOf('PolyPhen Prediction')],
  };
}
