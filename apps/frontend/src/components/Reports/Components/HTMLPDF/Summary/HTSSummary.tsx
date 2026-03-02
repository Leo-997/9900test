import { SxProps } from '@mui/material';
import { JSX } from 'react';
import { formatHTSDrug } from '@/components/Reports/Common/TableFormatters/HTS';
import { htsWidths } from '@/constants/Reports/tableWidths';
import { IDetailedHTSResult, IHTSCulture } from '@/types/HTS.types';
import { VariantType } from '@/types/misc.types';
import { toFixed } from '@/utils/math/toFixed';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { Table } from '../Table/Table';

interface IProps {
  culture?: IHTSCulture;
  drugs: IDetailedHTSResult[];
  canManage?: boolean;
}

export function HTSSummary({
  culture,
  drugs,
  canManage = false,
}: IProps): JSX.Element {
  const { errorLoadingItems } = useReportData();
  const entityType: VariantType = 'HTS';

  const headerStyles: SxProps = {
    whiteSpace: 'pre !important',
    lineHeight: '1rem',
    paddingBottom: '8px',
    '& > *': {
      textTransform: 'none',
    },
  };

  return (
    <Table
      title="Single agent high-throughput screen"
      variantType="HTS"
      header={[{
        columns: [
          { width: htsWidths[0], content: 'DRUG' },
          { width: htsWidths[1], content: 'TARGET' },
          { width: htsWidths[2], content: 'HIT*' },
          { width: htsWidths[3], content: 'AUC\nZ-SCORE', styleOverrides: headerStyles },
          { width: htsWidths[4], content: 'IC50\nZ-SCORE', styleOverrides: headerStyles },
          { width: htsWidths[5], content: 'IC50\n(μM)', styleOverrides: headerStyles },
          { width: htsWidths[6], content: 'LC50\nZ-SCORE', styleOverrides: headerStyles },
          { width: htsWidths[7], content: 'LC50\n(μM)', styleOverrides: headerStyles },
          { width: htsWidths[8], content: 'CMAX/CSS\n(μM)', styleOverrides: headerStyles },
          { width: htsWidths[9], content: '% EFFECT AT\nCMAX/CSS ‡', styleOverrides: { ...headerStyles, paddingRight: '0px' } },
          { width: htsWidths[10], content: '% CHANGE ^', styleOverrides: { ...headerStyles, paddingRight: '0px' } },
        ],
      }]}
      rows={[
        {
          columns: [
            { width: htsWidths[0], content: 'Control' },
            { width: htsWidths[1], content: '-' },
            { width: htsWidths[2], content: '-' },
            { width: htsWidths[3], content: '-', styleOverrides: { whiteSpace: 'nowrap' } },
            { width: htsWidths[4], content: '-', styleOverrides: { whiteSpace: 'nowrap' } },
            { width: htsWidths[5], content: '-', styleOverrides: { whiteSpace: 'nowrap' } },
            { width: htsWidths[6], content: '-', styleOverrides: { whiteSpace: 'nowrap' } },
            { width: htsWidths[7], content: '-', styleOverrides: { whiteSpace: 'nowrap' } },
            { width: htsWidths[8], content: '-', styleOverrides: { whiteSpace: 'nowrap' } },
            { width: htsWidths[9], content: '-', styleOverrides: { whiteSpace: 'nowrap' } },
            {
              width: htsWidths[10],
              content: (
                culture?.controlChangeRatio === null || culture?.controlChangeRatio === undefined
                  ? '-'
                  : toFixed(culture?.controlChangeRatio, 1)
              ),
              styleOverrides: { whiteSpace: 'nowrap' },
            },
          ],
          entityType,
          entityId: 'Control',
        },
        ...(drugs.some((d) => d.category === 'Chemotherapeutic')
          ? [
            {
              columns: [
                {
                  width: 'auto',
                  colSpan: 11,
                  content: 'Chemotherapy',
                  styleOverrides: { fontWeight: 700 },
                },
              ],
              entityType,
              entityId: 'Chemotherapy',
            },
            ...drugs.filter((d) => d.category === 'Chemotherapeutic')
              .map((d) => ({
                ...formatHTSDrug(d),
                entityType,
                entityId: d.screenId,
              })),
          ] : []),
        ...(drugs.some((d) => d.category === 'Targeted')
          ? [
            {
              columns: [
                {
                  width: 'auto',
                  colSpan: 11,
                  content: 'Targeted agents',
                  styleOverrides: { fontWeight: 700 },
                },
              ],
              entityType,
              entityId: 'Targeted',
            },
            ...drugs.filter((d) => d.category === 'Targeted')
              .map((d) => ({
                ...formatHTSDrug(d),
                entityType,
                entityId: d.screenId,
              })),
          ] : []),
      ]}
      noRowsMessage=""
      legend={'* Drug hit defined as differential sensitivity with a Z-score of close to -2 for AUC and IC50\n‡ compared with control at end of treatment\n^ compared with start of treatment\nSN38, active metabolite of IRN; MITC, active metabolite of TMZ'}
      canManage={canManage}
      showErrorMsg={errorLoadingItems.includes('hts')}
    />
  );
}
