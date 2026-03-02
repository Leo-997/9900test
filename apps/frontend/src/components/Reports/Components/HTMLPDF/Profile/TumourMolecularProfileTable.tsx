import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IPurity } from '@/types/Precuration/Purity.types';
import { molecularProfileTableWidths } from '../../../../../constants/Reports/tableWidths';
import { formatMolecularProfile } from '../../../Common/TableFormatters/MolecularProfile';
import { Table } from '../Table/Table';

import type { JSX } from "react";

interface IProps {
  analysisSet: IAnalysisSet;
  purity?: IPurity;
  isPanel?: boolean;
}

export function TumourMolecularProfileTable({
  analysisSet,
  purity,
  isPanel = false,
}: IProps): JSX.Element {
  return (
    <Table
      title="Tumour molecular profile"
      header={[{
        columns: [
          { width: molecularProfileTableWidths[0], content: 'Mutations/MB' },
          { width: molecularProfileTableWidths[1], content: 'SNVS/Exome' },
          { width: molecularProfileTableWidths[2], content: 'Ploidy (Confidence Range)' },
          { width: molecularProfileTableWidths[3], content: `Purity${isPanel ? '' : ' (Confidence Range)'}` },
        ],
      }]}
      rows={(
        formatMolecularProfile(
          analysisSet,
          molecularProfileTableWidths,
          purity,
          isPanel,
        )
      )}
      noRowsMessage="No molecular profile data found"
    />
  );
}
