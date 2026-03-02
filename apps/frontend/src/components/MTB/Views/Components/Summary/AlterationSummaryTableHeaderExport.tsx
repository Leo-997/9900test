import {
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { corePalette } from '@/themes/colours';
import CustomTypography from '../../../../Common/Typography';
import { IMolAltSummaryColumn } from '../../../../../types/MTB/MolecularAlteration.types';
import { IGeneAltSettings, INonGeneAltSettings } from '../../../../../types/MTB/Settings.types';

import type { JSX } from "react";

interface IProps<T extends IGeneAltSettings | INonGeneAltSettings> {
  columnSettings: IMolAltSummaryColumn<T>[];
}

export function AlterationSummaryTableHeaderExport<
T extends IGeneAltSettings | INonGeneAltSettings
>({
  columnSettings,
}: IProps<T>): JSX.Element {
  return (
    <TableHead>
      <TableRow
        sx={{ borderBottom: `2px solid ${corePalette.grey50}` }}
      >
        {columnSettings.map((o) => (
          o.visible && (
            <TableCell
              key={`mol-alt-column-${o.key}-${o.visible}`}
              sx={{
                minWidth: o.minWidth,
                height: '100%',
                maxWidth: '200px',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textAlign: 'left',
              }}
            >
              <CustomTypography variant="label">
                {o.label}
              </CustomTypography>
            </TableCell>
          )
        ))}
      </TableRow>
    </TableHead>
  );
}
