import { IGeneList } from '@/types/Reports/GeneLists.types';
import { Grid } from '@mui/material';
import { ReactNode } from 'react';
import { IMethodsText, ReportType } from '../../../../types/Reports/Reports.types';
import { IReportTableRow } from '../../../../types/Reports/Table.types';
import CustomTypography from '../../../Common/Typography';

interface IMethodsSettings {
  reportType?: ReportType;
  somaticGenes?: IGeneList;
  germlineGenes?: IGeneList;
  reference?: boolean;
  wgs?: boolean;
  rna?: boolean;
  panel?: boolean;
  meth?: boolean;
  somatic?: boolean;
  germline?: boolean;
  vaf?: boolean;
  rnaExpression?: boolean;
  ipass?: boolean;
  htsSingle?: boolean;
  htsCombo?: boolean;
  aSNP?: boolean;
  str?: boolean;
  ihc?: boolean;
}

export function getSomaticWithListName(
  {
    somaticGenes,
  }: IMethodsSettings,
  {
    somatic = '',
  }: IMethodsText,
): string {
  if (!somaticGenes) {
    // MTB report and general molecular report
    const lines = [
      '**WGS**\nSomatic analysis was performed by identifying rare (population allele frequency <0.01), nonsynonymous variants among the targeted genes, detected in tumour tissue but deficient in matched normal (germline).',
      '\n**Targeted Panel**\nPerformed on DNA for tumour mutational burden (TMB) and mutations in the coding regions of 523 genes, and on RNA for fusions in a subset of 55 genes.',
    ];
    return lines.join('\n');
  }

  const somaticWithListName = somatic.replaceAll('{listName}', `${somaticGenes.name} version ${somaticGenes.version}`);
  return somaticWithListName;
}

export function formatSomaticGenes(
  settings: IMethodsSettings,
  text: IMethodsText,
): string | ReactNode {
  const somaticWithListName = getSomaticWithListName(settings, text);
  const somaticParts = somaticWithListName.split('{genes}');

  const genes = settings.somaticGenes;
  let geneList = genes?.genes || [];
  if (geneList && somaticParts.length === 2) {
    geneList = geneList.sort(
      (a, b) => a.gene.toLowerCase().localeCompare(b.gene.toLowerCase()),
    );
    return (
      <>
        <span>
          {somaticParts[0]}
        </span>
        <Grid container direction="row" style={{ flexWrap: 'wrap' }}>
          {genes && genes.genes
            ? genes.genes
              .filter(
                (gene, index, self) => (
                  index === self.findIndex((other) => other.gene === gene.gene)
                ),
              )
              .map((gene) => (
                <Grid
                  key={gene.gene}
                  sx={{
                    padding: '0px',
                    borderLeft: 'none',
                    marginLeft: '1px',
                    width: '40px',
                    lineHeight: '7px !important',
                  }}
                >
                  <CustomTypography variant="bodySmall" fontWeight="medium" sx={{ fontSize: '7px', lineHeight: '7px' }}>
                    {gene.gene}
                  </CustomTypography>
                </Grid>
              )) : (
              ''
            )}
        </Grid>
        <span>
          {somaticParts[1]}
        </span>
      </>
    );
  }
  return somaticWithListName;
}

export function formatGermlineGenes(
  {
    germlineGenes: genes,
  }: IMethodsSettings,
  {
    germline = '',
  }: IMethodsText,
): string {
  return germline
    .replaceAll('{listName}', `${genes?.name || ''} version ${genes?.version || ''}`)
    .replaceAll(
      '{genes}',
      genes && genes.genes
        ? genes.genes
          .sort((a, b) => a.gene.toLowerCase().localeCompare(b.gene.toLowerCase()))
          .map((gene) => gene.gene)
          .join(', ')
        : '',
    );
}

export function formatMethodsCommon(
  {
    ...settings
  }: IMethodsSettings,
  methodsText: IMethodsText,
  widths: string[],
): IReportTableRow[] {
  const rows: IReportTableRow[] = [];
  if (settings.reference) {
    rows.push({
      columns: [
        { width: widths[0], content: 'Genome Reference' },
        { width: widths[1], content: 'GRCh38/hg38' },
      ],
    });
  }
  if (settings.wgs) {
    rows.push({
      columns: [
        { width: widths[0], content: 'WGS' },
        { width: widths[1], content: methodsText.wgs },
      ],
    });
  }
  if (settings.rna) {
    rows.push({
      columns: [
        { width: widths[0], content: 'RNA Sequencing' },
        { width: widths[1], content: methodsText.rna },
      ],
    });
  }
  if (settings.panel) {
    rows.push({
      columns: [
        { width: widths[0], content: 'Targeted sequencing' },
        { width: widths[1], content: methodsText.panel },
      ],
    });
  }
  if (settings.meth) {
    rows.push({
      columns: [
        { width: widths[0], content: 'Molecular Classifiers' },
        { width: widths[1], content: methodsText.meth },
      ],
    });
  }
  if (settings.somatic) {
    rows.push({
      columns: [
        { width: widths[0], content: 'Somatic Analysis' },
        {
          width: widths[1],
          content: formatSomaticGenes(settings, methodsText),
        },
      ],
    });
  }
  if (settings.germline) {
    rows.push({
      columns: [
        { width: widths[0], content: 'Germline Analysis' },
        { width: widths[1], content: formatGermlineGenes(settings, methodsText) },
      ],
    });
  }
  if (settings.vaf) {
    rows.push({
      columns: [
        { width: widths[0], content: 'VAF (RNA and DNA)' },
        { width: widths[1], content: methodsText.vaf },
      ],
    });
  }
  if (settings.rnaExpression) {
    const genes: string[] = [];
    if (settings.rnaExpression) genes.push('RNA Expression');

    rows.push({
      columns: [
        { width: widths[0], content: genes.join(', ') },
        { width: widths[1], content: methodsText.rnaExpression },
      ],
    });
  }
  if (settings.ipass) {
    rows.push({
      columns: [
        { width: widths[0], content: 'Tumour Immune Profiling' },
        { width: widths[1], content: methodsText.ipass },
      ],
    });
  }
  if (settings.htsSingle) {
    rows.push({
      columns: [
        { width: widths[0], content: 'In vitro Drug Testing (Single Agent)' },
        { width: widths[1], content: methodsText.htsSingle },
      ],
    });
  }
  if (settings.htsCombo) {
    rows.push({
      columns: [
        { width: widths[0], content: 'In vitro Drug Testing (Combination)' },
        { width: widths[1], content: methodsText.htsCombo },
      ],
    });
  }
  if (settings.aSNP) {
    rows.push({
      columns: [
        { width: widths[0], content: 'aSNP' },
        { width: widths[1], content: methodsText.aSNP },
      ],
    });
  }
  if (settings.str) {
    rows.push({
      columns: [
        { width: widths[0], content: 'STR profiling' },
        { width: widths[1], content: methodsText.str },
      ],
    });
  }
  if (settings.ihc) {
    rows.push({
      columns: [
        { width: widths[0], content: 'IHC' },
        { width: widths[1], content: methodsText.ihc },
      ],
    });
  }
  return rows;
}
