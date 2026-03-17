import { promoterMethylationTableWidths } from '../../../../../constants/Reports/tableWidths';
import { IMethylationData, IMethylationGeneData } from '../../../../../types/Methylation.types';
import { formatPromoter } from '../../../Common/TableFormatters/PromoterMethylation';
import { Table } from '../Table/Table';

import type { JSX } from "react";

interface IProps {
  promoters: IMethylationGeneData[];
  classifiers: IMethylationData[];
}

export function PromoterMethylationTable({
  promoters,
  classifiers,
}: IProps): JSX.Element {
  return (
    <Table
      title="Promoter methylation"
      variantType="METHYLATION_GENE"
      header={[{
        columns: [
          { width: promoterMethylationTableWidths[0], content: 'Gene Promoter' },
          { width: promoterMethylationTableWidths[1], content: 'Methylation Status' },
        ],
      }]}
      rows={classifiers.some((c) => c.classification === 'Not Applicable')
        ? []
        : promoters.map((promoter) => (
          {
            columns: formatPromoter(
              promoter,
              [promoterMethylationTableWidths[0], promoterMethylationTableWidths[1]],
            ),
          }
        ))}
      noRowsMessage={
        classifiers.some((c) => c.classification === 'Not Applicable')
          ? 'Not applicable as non CNS/sarcoma tumour.'
          : 'Methylation not performed.'
      }
    />
  );
}
