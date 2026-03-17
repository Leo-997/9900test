import { tierOfRecReferenceWidths } from '@/constants/Reports/tableWidths';
import { Table } from '../Table/Table';

import type { JSX } from "react";

export function TierOfRecReference(): JSX.Element {
  return (
    <Table
      title="Tier of therapy recommendation"
      header={[{
        columns: [
          { content: 'Tier', width: tierOfRecReferenceWidths[0], colSpan: 1 },
          {
            content: 'Strength of evidence in relation to current published literature',
            width: tierOfRecReferenceWidths[1],
            colSpan: 5,
          },
        ],
      }]}
      rows={[
        {
          columns: [
            { content: '1', width: tierOfRecReferenceWidths[0], colSpan: 1 },
            {
              content: 'Evidence from clinical studies of the same cancer type',
              width: tierOfRecReferenceWidths[1],
              colSpan: 5,
            },
          ],
        },
        {
          columns: [
            { content: '2', width: tierOfRecReferenceWidths[0], colSpan: 1 },
            {
              content: 'Evidence from clinical studies of different cancer type',
              width: tierOfRecReferenceWidths[1],
              colSpan: 5,
            },
          ],
        },
        {
          columns: [
            { content: '3', width: tierOfRecReferenceWidths[0], colSpan: 1 },
            {
              content: 'Preclinical evidence in the same cancer type',
              width: tierOfRecReferenceWidths[1],
              colSpan: 5,
            },
          ],
        },
        {
          columns: [
            { content: '4', width: tierOfRecReferenceWidths[0], colSpan: 1 },
            {
              content: 'Preclinical evidence in different cancer type',
              width: tierOfRecReferenceWidths[1],
              colSpan: 5,
            },
          ],
        },
        {
          columns: [
            { content: '5', width: tierOfRecReferenceWidths[0], colSpan: 1 },
            {
              content: 'Consensus opinion',
              width: tierOfRecReferenceWidths[1],
              colSpan: 5,
            },
          ],
        },
      ]}
      noRowsMessage=""
      legend="STRENGTH OF EVIDENCE IN RELATION TO ZERO DIAGNOSTIC PLATFORM: M = Molecular, I = In Vitro, P = PDX"
    />
  );
}
