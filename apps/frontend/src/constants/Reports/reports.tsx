import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { IMethodsText, ReportType } from '@/types/Reports/Reports.types';
import { IReportOption, ISortMenuOption } from '@/types/misc.types';
import { reportVariantTypes } from '../Common/variants';

export const reportTypes = [
  'MOLECULAR_REPORT',
  'MTB_REPORT',
  'GERMLINE_REPORT',
  'PRECLINICAL_REPORT',
] as const;

export const reportGenerationType = [
  'pdf',
  'redacted',
] as const;

export const reportOptions: IReportOption<ReportType>[] = [
  {
    value: 'MOLECULAR_REPORT',
    name: 'Molecular Report',
    abbreviation: 'FT',
    downloadName: 'Molecular Report',
  },
  {
    value: 'MTB_REPORT',
    name: 'MTB Report',
    abbreviation: 'MTB',
    downloadName: 'MTB Report',
  },
  {
    value: 'GERMLINE_REPORT',
    name: 'Germline Report',
    abbreviation: 'G',
    downloadName: 'Germline Cancer Genetics Report',
  },
  {
    value: 'PRECLINICAL_REPORT',
    name: 'Preclinical Report',
    downloadName: 'MTB Preclinical Report',
  },
] as const;

export const reportSortOptions: ISortMenuOption<string>[] = [
  {
    name: 'Drafted',
    value: 'drafted:desc',
    icon: <ArrowDownIcon />,
  },
  {
    name: 'Drafted',
    value: 'drafted:asc',
    icon: <ArrowUpIcon />,
  },
  {
    name: 'Finalised',
    value: 'finalised:desc',
    icon: <ArrowDownIcon />,
  },
  {
    name: 'Finalised',
    value: 'finalised:asc',
    icon: <ArrowUpIcon />,
  },
];

export const germlineReportAttachmentOptions = [
  'No findings factsheet',
  'Genetics contact list',
  'No attachment',
] as const;

export const reportMetadataKeys = [
  'molecular.hidePanel',
  'preclinical.htsBiosampleId',
  'preclinical.htsScreen',
  'germline.attachments',
  'germline.forceApproval',
  ...reportVariantTypes.map((v) => `report.no.result.message.${v}` as const),
  ...reportVariantTypes.map((v) => `report.result.order.${v}` as const),
] as const;

export const localStorageKey = 'reportComments' as const;
export const clinicalReportTypes: ReportType[] = ['MTB_REPORT', 'PRECLINICAL_REPORT'] as const;
export const curationReportTypes: ReportType[] = ['MOLECULAR_REPORT', 'GERMLINE_REPORT'] as const;

const germlineGeneListLink = '[ZERO2 Germline GOI - version 3.2](https://s3.ccia.org.au:10443/cciassets/germline/ZERO2%20Germline%20Gene%20List_Version%203.2%2020260119.pdf)';

const allSortsCitation = '[https://doi.org/10.1182/bloodadvances.2021005894](https://doi.org/10.1182/bloodadvances.2021005894)';
const tallSortsCitation = '[https://doi.org/10.1038/s41586-024-07807-0](https://doi.org/10.1038/s41586-024-07807-0)';

const m1m2ScoreCitation = '[https://doi.org/10.1158/1078-0432.CCR-20-1163](https://doi.org/10.1158/1078-0432.CCR-20-1163)';
const cd8ScoreCitation = '[https://doi.org/10.1038/nmeth.3337](https://doi.org/10.1038/nmeth.3337)';

const baseMethods: IMethodsText = {
  wgs: 'DNA was extracted from tumour:normal matched pair tissue and libraries were prepared using Illumina DNA PCR-Free Library Prep. Both normal and tumour libraries were sequenced on Illumina NovaSeq X to generate 2x150bp reads at a target coverage of >30x for germline and >90x for tumour samples.\nDNA extracted from the tumour:normal matched pair tissue was used to screen for single nucleotide variants, small insertions & deletions, copy number variants, structural variants and mutation burden.',
  panel: 'Method: This test uses the TruSight™ Oncology 500 (TSO500) panel, a targeted hybrid-capture based next generation sequencing assay of 523 cancer related genes. DNA and RNA was extracted from tumour tissue (FFPE or other suitable samples) and sequenced on Illumina NextSeq 550 to generate 2x100bp reads at a target coverage of 2500x.',
  germline: `Germline findings may be included in this report if relevant to the interpretation of the tumour profiling results.\n\nExpanded germline analysis was performed to identify pathogenic or likely pathogenic variants in the ZERO germline cancer predisposition gene list (${germlineGeneListLink}).\n*A separate FINAL germline report will be issued with the results of the expanded germline analysis.`,
  rna: 'Method: Tumour RNA was extracted and RNA libraries were prepared using Illumina Stranded Total RNA Prep with Ribo-Zero Plus kit. Samples were sequenced on Illumina NovaSeq X, 2x150bp reads at a target depth of 80M reads per sample. Analysis: Gene fusion analysis was performed using Arriba, STAR-Fusion and MINTIE.\n* RNA-seq not performed = No RNA-seq was performed due to either insufficient or degraded RNA material.',
  meth: `**DNA Methylation**\nTumour DNA was extracted followed by bisulfite conversion using Zymo EZ DNA methylation kit. Samples were hybridised on the Illumina 8x 935K Infinium Methylation EPIC v2.0 BeadChip.\nClassification of tumours by methylation profiling was performed by uploading the Illumina EPIC Methylation Beadchip data into the Heidelberg Epignostix Research App.\nMGMT promoter methylation status is done by extracting the beta values of the CpG Island sites that are promoter associated with MGMT. MGMT promoter is considered methylated if the average beta values are >0.35.\n\n**Transcriptomics**\nFor leukaemia samples where RNA sequencing has been performed, TPM gene expression values may be input into one or more of the following classifiers as appropriate:\nALLSorts: Performed for BALL samples as described in Schmidt B. et al. 2022 (${allSortsCitation} , PMID: 35482550).\nTALL Subtype classification: In-house TALL transcriptomic classification derived from the classification subtypes as described in Pölönen P. et al. 2024 (${tallSortsCitation} , PMID: 39143224).`,
  vaf: 'The DNA Variant Allele Frequency (VAF) is the ratio of the number of reads containing the variant allele to the total number of reads covering that position. The DNA VAF may be used to infer the presence of the variant in a clone or sub-clone of the original tumour.\nThe RNA VAF is the ratio of the number of reads found in the RNA-seq data that contain the variant to the total number of reads covering that position. The RNA VAF may be used to infer the presence of the variant in a clone or sub-clone, a loss of the wildtype or that the variant is not transcribed.\nThe presence of an RNA VAF more enriched than the DNA VAF may suggest that there has been preferential transcription of the mutated allele, or a potential loss of the wild type allele.\nAbsence of an RNA VAF may be due to a number of biological and/or sequencing limitation reasons - e.g. the variant may introduce a premature termination codon and undergo nonsense mediated decay, poor sequencing coverage, or the gene is not expressed in the tissue type.',
  rnaExpression: 'Gene expression analysis was performed using data from the patient-tumour to generate gene and isoform counts. (FPKM, TPM)',
  ipass: `Tumour immune profiling will be performed on all solid tumour samples. This will be performed using RICO, an RNA-sequencing bioinformatic workflow container, that will quantify the relative gene abundance and infer three putative biomarkers. Each marker will report a score value and an associated percentile for the tumour sample in comparison to a reference paediatric cancer cohort of 767 tumour samples.\n\n**IPASS Status**\nThe Immune Paediatric Signature Score (IPASS) contains the following 15-genes: CD276, NFATC3, CD27, CXCL9, CTLA4, CXCL11, TNFRSF18, PMCH, THBD, SERPING1, LAMP3, SBNO2, LIF, FPR2, NFKB1. The score is calculated by taking the average of the log transformed TPM gene expression values of the 15-genes. An IPASS ≥ 0.7 is T-cell infiltrated and an IPASS < 0.7 is immune cold. The IPASS is not calculated for haematological malignancies or where RNA sequencing data is not available.\n\n**M1M2 Score**\nM1/M2 score contains the following 10-genes: CXCL11, IDO1, CCL19, CXCL9, PLA1A, LAMP3, CCR7, APOL6, CXCL10, TNIP3. The score is derived by calculating the mean expression of these genes as described in Pender A. et al. 2021  (${m1m2ScoreCitation} , PMID: 33020056).\n\n**CD8+ Score**\nRNA-seq based deconvolution to estimate CD8+ T cell abundance using CIBERSORT, as described in Newman AM. et al. 2015  (${cd8ScoreCitation} , PMID: 25822800).`,
};

export const mtbReportMethods: IMethodsText = {
  ...baseMethods,
  somatic: '**WGS**\nSomatic analysis was performed by identifying rare (population allele frequency <0.01), nonsynonymous variants among the targeted genes, detected in tumour tissue but deficient in matched normal (germline).\nGene list applied: ZERO2 {listName}\n\n**Targeted Panel**\nPerformed on DNA for tumour mutational burden (TMB) and mutations in the coding regions of 523 genes, and on RNA for fusions in a subset of 55 genes.',
};

export const molecularReportMethods: IMethodsText = {
  ...baseMethods,
  somatic: 'Somatic analysis was performed by identifying rare (population allele frequency <0.01), nonsynonymous variants among the targeted genes, detected in tumour tissue but deficient in matched normal (germline). Somatic single nucleotide variant, small insertions/deletions and copy number variant analysis covers the following genes ({listName}){genes}Additional somatic findings may be included if relevant to the interpretation of the tumour profiling results. Somatic structural variant analysis covers an expanded list of ~1100 paediatric cancer genes, and only those deemed essential to the interpretation of the tumour profiling results will be returned.',
};

export const germlineReportMethods: IMethodsText = {
  wgs: `DNA was extracted from tumour:normal matched pair tissue and libraries were prepared using Illumina DNA PCR-Free Library Prep. Both normal and tumour libraries were sequenced on Illumina NovaSeq X to generate 2x150bp reads at a target coverage of >30x for germline and >90x for tumour samples.\nDNA extracted from the tumour:normal matched pair tissue was used to screen for single nucleotide variants, small insertions & deletions, copy number variants, structural variants and mutation burden.\n\nExpanded germline analysis was performed examining genes included in the ZERO germline cancer predisposition gene list (${germlineGeneListLink}).`,
  rna: 'Method: Tumour RNA was extracted and RNA libraries were prepared using Illumina Stranded Total RNA Prep with Ribo-Zero Plus kit. Samples were sequenced on Illumina NovaSeq X, 2x150bp reads at a target depth of 80M reads per sample. Analysis: Gene fusion analysis was performed using Arriba, STAR-Fusion and MINTIE.\n* RNA-seq not performed = No RNA-seq was performed due to either insufficient or degraded RNA material.',
  panel: 'Method: This test uses the TruSight™ Oncology 500 (TSO500) panel, a targeted hybrid-capture based next generation sequencing assay of 523 cancer related genes. DNA and RNA was extracted from tumour tissue (FFPE or other suitable samples) and sequenced on Illumina NextSeq 550 to generate 2x100bp reads at a target coverage of 2500x.\n* RNA-seq not performed = No RNA-seq was performed due to either insufficient or degraded RNA material.',
  vaf: 'The DNA Variant Allele Frequency (VAF) is the ratio of the number of reads containing the variant allele to the total number of reads covering that position. The DNA VAF may be used to infer the presence of the variant in a clone or sub-clone of the original tumour.\nThe RNA VAF is the ratio of the number of reads found in the RNA-seq data that contain the variant to the total number of reads covering that position. The RNA VAF may be used to infer the presence of the variant in a clone or sub-clone, a loss of the wildtype or that the variant is not transcribed.\nThe presence of an RNA VAF more enriched than the DNA VAF may suggest that there has been preferential transcription of the mutated allele, or a potential loss of the wild type allele.\nAbsence of an RNA VAF may be due to a number of biological and/or sequencing limitation reasons - e.g. the variant may introduce a premature termination codon and undergo nonsense mediated decay, poor sequencing coverage, or the gene is not expressed in the tissue type.',
};

export const htsReportMethods: IMethodsText = {
  htsSingle: '**Platform**: High-throughput drug screen\n**Number of Compounds**: up to 150\n**Concentration Range**: 0.000001-250 uM (five or six doses at 10-fold increment, tailored to the drug)\n**Drug Exposure**: 72 hours',
  htsCombo: '**Platform**: Combination drug screen\n**Number of Combinations**: up to 12\n**Concentration Range**: 0.000001-250 uM (five or six doses at 10-fold increment, tailored to the drug)\n**Drug Exposure**: 72 hours\n\n**Synergy**: Observed effect > Expected effect*\n**Additive**: Observed effect ~ Expected effect*\n**Antagonism**: Observed effect < Expected effect*',
  aSNP: 'Validation of patient samples using aSNP (Single Nucleotide Polymorphisms microarray) is performed to analyse single nucleotide polymorphisms (SNPs), copy number changes; and to establish tumour ploidy and purity (Infinium Global Screening-array 24 v2 Ilumina).',
  str: 'Authentication of patient samples using STR (Short Tandem Repeat) profiling is performed to identify matching between the primary patient sample and patient derived xenograft/cell line culture. A set of 18 selected and established loci of tetra- and pentanucleotide repeats is amplified via PCR with the extracted DNA (PowerPlex 18D System, Promega).',
  ihc: 'Immunohistochemistry is performed to confirm that cells used in preclinical drug testing are of the same tumour type as the patient\'s primary tumour and to establish tumour cell content.',
} as const;

export const mtbReportLimitations = 'Whole genome sequencing data covers the majority of the genome, whilst targeted genome sequencing is limited to the targeted regions of interest and is unable to detect variants/mutations outside of the targeted region. However, some areas of the genome can be poorly covered or absent from the data. Thus, mutations in those regions may remain unidentified. Furthermore, some types of mutations (such as repeat expansions, small copy-number variants, structural rearrangements, mitochondrial-DNA mutations and areas beyond the targeted design (including introns and promoters)) will not have been detected by this test.\nReported copy number from WGS is approximate due to tumour purity or heterogeneity. Copy number analysis is NOT performed by targeted sequencing.\nNovel sequence changes of unknown, untested, benign and likely benign clinical relevance are not included in this report.\nThe somatic and germline gene lists are updated regularly, but may be incomplete due to the continuous identification of novel genes in human disease.';
export const molecularReportLimitations = 'Whole genome sequencing data covers the majority of the genome - however, some areas of the genome can be poorly covered or absent from the data. Thus, mutations in those regions may remain unidentified. Furthermore, some types of mutations (such as repeat expansions, small copy-number variants, structural rearrangements, mitochondrial-DNA mutations and areas beyond the targeted design (including introns and promoters)) will not have been detected by this test.\nReported copy number from WGS is approximate due to tumour purity or heterogeneity.\nNovel sequence changes of unknown, untested, benign and likely benign clinical relevance are not included in this report.\nThe somatic and germline gene lists are updated regularly, but may be incomplete due to the continuous identification of novel genes in human disease.';
export const germlineReportLimitations = 'Whole genome sequencing data covers the majority of the genome, whilst targeted genome sequencing is limited to the targeted regions of interest and is unable to detect variants/mutations outside of the targeted region. However, some areas of the genome can be poorly covered or absent from the data. Thus, mutations in those regions may remain unidentified. Furthermore, some types of mutations (such as repeat expansions, small copy-number variants, structural rearrangements, mitochondrial-DNA mutations and areas beyond the targeted design (including introns and promoters)) will not have been detected by this test.\nReported copy number from WGS is approximate due to tumour purity or heterogeneity. Copy number analysis is NOT performed by targeted sequencing.\nNovel sequence changes of unknown, untested, benign and likely benign clinical relevance are not included in this report.\nThe somatic and germline gene lists are updated regularly, but may be incomplete due to the continuous identification of novel genes in human disease.';

export const molecularReportDisclaimer = 'This is a clinical research report only and has NOT been validated to the current TGA in-house IVD or NATA requirements. It is highly recommended that all germline findings reported should be followed-up with confirmation NATA or NATA equivalent diagnostic testing. Failure to supply relevant clinical information may affect interpretation.';
export const mtbReportDisclaimer = 'This is a clinical research report only and has NOT been validated to the current TGA in-house IVD or NATA requirements. It is highly recommended that all germline findings reported should be followed-up with confirmation NATA or NATA equivalent diagnostic testing. Failure to supply relevant clinical information may affect interpretation.\n\nGermline analysis will focus on genes known to be associated with cancer predisposition and only clinically relevant findings associated to these regions of interest will be reported. Only variants that are pathogenic or likely pathogenic and have clinical significance based on available literature will be reported.';
export const germlineReportDisclaimer = 'Failure to supply relevant clinical information may affect interpretation. This is a clinical research report only and has NOT been validated to the current TGA in-house IVD or NATA requirements. It is recommended to be followed-up with confirmation NATA or NATA equivalent diagnostic testing. It is highly recommended that all germline findings should be discussed with a clinical genetics / familial cancer service.\n\nGermline analysis will focus on genes known to be associated with cancer predisposition and only clinically relevant findings associated to these regions of interest will be reported. Only variants that are pathogenic or likely pathogenic and have clinical significance based on available literature will be reported.';
export const preclinicalReportDisclaimer = 'Failure to supply relevant clinical information may affect interpretation.';

export const methClassifierPrefix = 'The below statement is a generic description of this methylation class from the Epignostix classifier.';

export const errorFetchingDataMsg = 'There was an error fetching all data';
