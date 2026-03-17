export const CIRCOS_PLOT_DATA = {
  CIRCOS: [
    {
      title: 'Outer first circle',
      summary:
        'Shows the chromosomes. The darker shaded areas represent large gaps in ...',
      content:
        'Shows the chromosomes. The darker shaded areas represent large gaps in the human reference genome: i.e. regions of centromeres, heterochromatin & missing short arms.',
    },
    {
      title: 'Second circle',
      summary:
        'Shows the somatic variants (incl. exon, intron and intergenic regions) ...',
      content:
        'Shows the somatic variants (incl. exon, intron and intergenic regions). Somatic variants are further divided into an outer ring of single nucleotide polymorphism (SNP) allele frequencies and an inner ring of short insertion/deletion (INDEL) locations. SNP allele frequencies have been corrected for tumour purity and scale from 0 to 100%. Each dot represents a single somatic variant. SNPs are colored according to the type of base change (e.g. C>T/G>A in red) and are in concordance with the coloring used in Alexandrov et al. 2013 Nature paper that describes the use of mutational signatures. INDELs are colored yellow and red for insertions and deletions respectively.',
    },
    {
      title: 'Third circle',
      summary:
        'Shows all observed tumour purity adjusted copy number changes, including...',
      content:
        'shows all observed tumour purity adjusted copy number changes, including both focal and chromosomal somatic events. Copy number losses are indicated in red, green shows regions of copy number gain. The scale ranges from 0 (complete loss) to 6 (high level gains). If the absolute copy number is > 6 it is shown as 6 with a green dot on the diagram.',
    },
    {
      title: 'Fourth circle',
      summary:
        "Represents the observed 'minor allele copy numbers' across the ...",
      content:
        "Represents the observed 'minor allele copy numbers' across the chromosome. The range of the chart is from 0 to 3. The expected normal minor allele copy number is 1, and anything below 1 is shown as a loss (orange) and represents a LOH event. Minor allele copy numbers above 1 (blue) indicate amplification events of both A and B alleles at the indicated locations.",
    },
    {
      title: 'Innermost circle',
      summary:
        'The innermost circle displays the observed structural variants within or...',
      content:
        'The innermost circle displays the observed structural variants within or between the chromosomes. Translocations are indicated in blue, deletions in red, insertions in yellow, tandem duplications in green and inversions in black.',
    },
  ],
  RAW_CIRCOS: [
    {
      title: 'Outer circle',
      summary:
        'The outer circle shows the COBALT ratios of the reference and tumour ...',
      content:
        'The outer circle shows the COBALT ratios of the reference and tumour samples in green and blue respectively. Note the reference ratios are after GC and diploid normalization have been applied.The tumour ratios are after GC normalization has been applied.',
    },
    {
      title: 'Inner circle',
      summary: 'The inner circle shows the raw AMBER BAF points in orange...',
      content: 'The inner circle shows the raw AMBER BAF points in orange.',
    },
  ],
};

export const HTS_PLOT_DATA = {
  DRUG_START: [
    {
      title: 'Drug Treatment Start',
      summary: '',
      content: 'Monitoring image was taken at the start of the drug treatment using 10x objective.',
    },
  ],
  DRUG_END: [
    {
      title: 'Drug Treatment End',
      summary: '',
      content: 'Monitoring image was taken at the end of the drug treatment (72h post-treatment) using 10x objective.',
    },
  ],
  SUNRISE: [
    {
      title: 'ASPCF Sunrise Plot',
      summary: '',
      content: 'The sunrise plot is used to determine the optimal aberrant cell fraction and ploidy of the tumour sample and provides a landscape of various aberrant cell fraction and ploidy value options. The optimal solution is highlighted by an annotated cross.',
    },
  ],
  LOGR_BAF: [
    {
      title: 'ASPCF LogR & BAF Plot',
      summary: '',
      content: 'In SNP array analysis, a logR and BAF plot is a graphical representation that displays the log ratio (logR) and B allele frequency (BAF) values for genomic positions across the genome. The combination of logR and BAF values enables the detection of copy number alterations.\n\nThe logR value represents the logarithm of the observed intensity ratio of the sample DNA to a reference DNA at each SNP or probe position on the array.\nThe BAF represents the proportion of the B allele at each SNP position in the sample. It measures the allelic composition of a genomic region',
    },
  ],
  COPY_NUMBER: [
    {
      title: 'ASCAT Copy Number Profile',
      summary: '',
      content: 'The ASCAT profile contains the estimated allele-specific copy numbers across the genome based on logR and BAF value of each SNP probes, calculated specifically for the aberrant tumour cells and correcting for both aneuploidy and non-aberrant cell infiltration. (The copy-number on the Y-axis vs. the genomic location on the X-axis; for illustrative purposes only, both lines are slightly shifted such that they do not overlap.)',
    },
  ],
};
