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
  paddingLeft: '20px',
  position: 'sticky',
  right: '0px',
});

export function TaskDashboardHeader(): JSX.Element {
  return (
    <TableHead>
      <TableRow sx={{ height: '60px', padding: '0' }}>
        <TableCellLeft sx={{ minWidth: '150px', width: '10vw' }}>
          <CustomTypography variant="label">
            Event
          </CustomTypography>
        </TableCellLeft>
        <TableCell sx={{ minWidth: '180px', width: '10vw' }}>
          <CustomTypography variant="label">
            Cohort
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '200px', width: '12vw' }}>
          <CustomTypography variant="label">
            Zero2 Final Diagnosis
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '180px', width: '10vw' }}>
          <CustomTypography variant="label">
            Curation
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '165px', width: '10vw' }}>
          <CustomTypography variant="label">
            Molecular Report
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '165px', width: '10vw' }}>
          <CustomTypography variant="label">
            Germline Report
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '180px', width: '10vw' }}>
          <CustomTypography variant="label">
            MTB Slides
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '165px', width: '10vw' }}>
          <CustomTypography variant="label">
            MTB Report
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '110px', width: '8vw' }}>
          <CustomTypography variant="label">
            Case Status
          </CustomTypography>
        </TableCell>
        <TableCellRight sx={{ minWidth: '200px', width: '10vw' }}>
          <CustomTypography variant="label">
            Notes
          </CustomTypography>
        </TableCellRight>
      </TableRow>
    </TableHead>
  );
}
