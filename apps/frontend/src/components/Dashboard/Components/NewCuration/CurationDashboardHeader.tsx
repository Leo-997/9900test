import CustomTypography from '@/components/Common/Typography';
import {
  TableCell as MuiTableCell,
  styled,
  TableHead as MuiTableHead,
  TableRow,
} from '@mui/material';

import type { JSX } from "react";

const TableHead = styled(MuiTableHead)({
  position: 'sticky',
  zIndex: 1,
  top: 0,
});

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  marginRight: '16px',
  backgroundColor: theme.colours.core.grey10,
  border: 'none',
  padding: 0,
}));

const TableCellLeft = styled(TableCell)({
  position: 'sticky',
  left: 0,
  zIndex: 3,
  paddingLeft: '16px',
});

const TableCellRight = styled(TableCell)({
  position: 'sticky',
  right: 0,
});

export function CurationDashboardHeader(): JSX.Element {
  return (
    <TableHead>
      <TableRow sx={{ height: '60px', padding: '0' }}>
        <TableCellLeft sx={{ minWidth: '200px', width: '200px' }}>
          <CustomTypography variant="label">
            Event
          </CustomTypography>
        </TableCellLeft>
        <TableCell sx={{ minWidth: '160px', width: '160px' }}>
          <CustomTypography variant="label">
            Status
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '110px', width: '18vw' }}>
          <CustomTypography variant="label">
            Collection
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '80px', width: '13vw' }}>
          <CustomTypography variant="label">
            Study
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '200px', width: '33vw' }}>
          <CustomTypography variant="label">
            Cohort
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '200px', width: '33vw' }}>
          <CustomTypography variant="label">
            ZERO2 Final Diagnosis
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '110px', width: '15vw' }}>
          <CustomTypography variant="label">
            Mut. Burden
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '60px', width: '13vw' }}>
          <CustomTypography variant="label">
            Purity
          </CustomTypography>
        </TableCell>
        <TableCellRight sx={{ minWidth: '200px', paddingLeft: '20px' }}>
          <CustomTypography variant="label">
            Curators
          </CustomTypography>
        </TableCellRight>
      </TableRow>
    </TableHead>
  );
}
