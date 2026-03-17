import {
  TableCell as MuiTableCell,
  TableHead,
  TableRow as MuiTableRow,
  styled,
} from '@mui/material';

import CustomTypography from '../../../../../Common/Typography';
import { IMolAltSelectModalColumn } from '../../../../../../types/MTB/MolecularAlteration.types';

import type { JSX } from "react";

const TableRow = styled(MuiTableRow)(({ theme }) => ({
  height: '40px',
  padding: 0,
  borderBottom: `1px solid ${theme.colours.core.grey50}`,
}));

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  padding: '0px',
  height: '100%',
  backgroundColor: theme.colours.core.white,
}));

interface IProps {
  columnSettings: IMolAltSelectModalColumn[];
}

export function MolAlterationsSelectModalHeader({ columnSettings }: IProps): JSX.Element {
  return (
    <TableHead>
      <TableRow>
        <TableCell
          sx={{ width: '56px' }}
        />
        {columnSettings.map((o) => (
          <TableCell
            key={o.key}
            style={{
              paddingRight: '10px',
              maxWidth: o.width,
            }}
          >
            <CustomTypography variant="label">
              {o.label}
            </CustomTypography>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
