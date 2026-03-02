import { liverKidneyGenePanels } from '@/constants/sample';
import { IPatientGermlineConsent } from '@/types/Patient/Patient.types';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import { VariantType } from '../../../types/misc.types';
import { ReportType } from '../../../types/Reports/Reports.types';
import { GenePanel } from '../../../types/Samples/Sample.types';

interface IUpdateOptions {
  reportable: boolean | null,
  defaultValue: ReportType[],
  gene?: string,
  secondaryGene?: string, // Mostly for SV variant, which has 2 genes: startGene & endGene.
  geneList?: IGeneList,
  genePanel?: GenePanel,
  variantType?: Extract<VariantType, 'RNA_SEQ' | 'GERMLINE_SNV' | 'GERMLINE_CNV' | 'GERMLINE_SV' | 'GERMLINE_CYTO'>;
  germlineConsent?: IPatientGermlineConsent | null;
}

export default function getUpdatedReportsValue(updateOptions: IUpdateOptions): ReportType[] {
  const {
    reportable,
    defaultValue,
    gene,
    secondaryGene,
    geneList,
    genePanel,
    variantType,
    germlineConsent,
  } = updateOptions;

  const reportOptions: ReportType[] = [...defaultValue];
  // General
  if (!reportable) return [];

  // #1 Rules for Germline variants.
  if (
    variantType === 'GERMLINE_CNV'
    || variantType === 'GERMLINE_SNV'
    || variantType === 'GERMLINE_SV'
    || variantType === 'GERMLINE_CYTO'
  ) {
    // #1.a if there is consent, add them to all reports
    if (germlineConsent?.category2Consent || germlineConsent?.germlineConsent) {
      return [
        'GERMLINE_REPORT',
        'MOLECULAR_REPORT',
        'MTB_REPORT',
      ];
    }

    // #1.b if there is no consent, add them to no report by default
    return [];
  }

  // #2 Rules for MTB REPORT
  reportOptions.push('MTB_REPORT');

  // #3 Rules for MOLECULAR REPORT.
  if (
    // #3.a Case: RNA variant
    (
      variantType === 'RNA_SEQ'
      && gene
      && genePanel
      && (
        (
          liverKidneyGenePanels.some((p) => p === genePanel)
          && ['H19', 'IGF2'].includes(gene.toUpperCase())
        )
        // PDCD1LG2 = PDL2
        || (
          genePanel === 'Leukaemia and lymphoma'
          && ['CRLF2', 'PDCD1LG2', 'STAT3'].includes(gene.toUpperCase())
        )
      )
    )
    // #3.b Case: Somatic & Cytogenetics variants
    || (
      variantType !== 'RNA_SEQ'
      && (
        !geneList
        || !gene
        || (geneList.genes || [])
          .some((g) => (g.gene === gene) || (secondaryGene && g.gene === secondaryGene))
      )
    )
  ) reportOptions.push('MOLECULAR_REPORT');

  return Array.from(new Set(reportOptions));
}
