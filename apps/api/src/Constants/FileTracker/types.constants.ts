export const fileTypes = [
  'tar',
  'bam',
  'bai',
  'tdf',
  'fastq',
  'vcf',
  'gvcf',
  'json',
  'metrics',
  'png',
  'jpg',
  'pdf',
  'docx',
  'html',
  'gzip',
  'tbi',
  'other',
] as const;
export const sampleTypes = ['tumour', 'normal', 'donor', 'unknown'] as const;
export const refGenomes = [
  'hs38',
  'hg19lite',
  'hs37d5',
  'hg19',
  'hg38',
  'GRCh37',
  'GRCh38fullphix',
  'GRCh38lite',
  'GRCh37illumina',
] as const;
export const categories = [
  'circos',
  'mutsig',
  'qc',
  'methylation',
  'rnaseq',
  'rnaseq_classifier',
  'linx',
  'hts',
  'bam',
  'report',
  'fusion',
  'meth_gene',
  'tsv',
] as const;
export const circosTypes = ['circos', 'raw_circos'] as const;
export const mutsigTypes = ['fit', 'matching', 'matrix'] as const;
export const qcTypes = [
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
] as const;
export const methylationTypes = ['wgs', 'epic', 'mgmt'] as const;
export const htsHitsTypes = [
  'AUC',
  'IC50',
  'IC50CURVE',
  'LN50',
  'LC50',
  'QC_IC50CURVE',
] as const;
export const htsCultureTypes = [
  'CELLS_END',
  'CELLS_START',
  'SUNRISE',
  'LOGR_BAF',
  'COPY_NUMBER',
  'QC_PLATE',
  'QC_CORRELATION',
  'QC_MONITORING',
  
] as const;
export const htsTypes = [...htsHitsTypes, ...htsCultureTypes] as const;
export const tsvTypes = ['index', 'main'] as const;
export const bamMethods = ['wgs', 'rna'] as const;
export const platforms = ['dnanexus', 'ncimdss', 'netapp'] as const;
