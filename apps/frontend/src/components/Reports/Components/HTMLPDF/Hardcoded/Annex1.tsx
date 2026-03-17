import {
  nswClinics,
  nzClinics,
  qldClinics,
  saClinics,
  tasClinics,
  vicClinics,
  waClinics,
} from '../../../../../constants/Reports/germlineReport';
import { annex1Widths } from '../../../../../constants/Reports/tableWidths';
import { formatAnnex1 } from '../../../Common/TableFormatters/germlineReport';
import { Table } from '../Table/Table';

import type { JSX } from "react";

export default function Annex1(): JSX.Element {
  return (
    <Table
      title=""
      titleAlignment="center"
      header={[{
        columns: [
          { width: annex1Widths[0], content: 'Region' },
          { width: annex1Widths[1], content: 'Location' },
          { width: annex1Widths[2], content: 'Service' },
          { width: annex1Widths[3], content: 'Contact Details' },
        ],
      }]}
      rows={[
        ...formatAnnex1(nswClinics, annex1Widths),
        ...formatAnnex1(vicClinics, annex1Widths),
        ...formatAnnex1(waClinics, annex1Widths),
        ...formatAnnex1(qldClinics, annex1Widths),
        ...formatAnnex1(saClinics, annex1Widths),
        ...formatAnnex1(tasClinics, annex1Widths),
        ...formatAnnex1(nzClinics, annex1Widths),
      ]}
      noRowsMessage=""
      textSize="medium"
    />
  );
}
