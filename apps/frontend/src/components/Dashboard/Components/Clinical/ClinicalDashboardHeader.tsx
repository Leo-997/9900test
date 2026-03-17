import {
  Box,
  TableCell as MuiTableCell,
  styled,
  TableHead as MuiTableHead,
  TableRow,
} from '@mui/material';
import CustomTypography from '../../../Common/Typography';

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
});

const TableCellRight = styled(TableCell)({
  position: 'sticky',
  right: 0,
});

export default function ClinicalDashboardHeader(): JSX.Element {
  return (
    <TableHead>
      <TableRow sx={{ height: '60px', padding: '0' }}>
        <TableCellLeft style={{ minWidth: '250px', width: '250px' }}>
          <CustomTypography variant="label" style={{ marginLeft: '32px' }}>
            SAMPLE ID
          </CustomTypography>
        </TableCellLeft>
        <TableCell sx={{ minWidth: '160px', width: '160px' }}>
          <CustomTypography variant="label">
            STATUS
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '180px', width: '18vw' }}>
          <CustomTypography variant="label">
            MEETING DATE
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '200px', width: '33vw' }}>
          <CustomTypography variant="label">
            ZERO2 FINAL DIAGNOSIS
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '120px', width: '20vw' }}>
          <CustomTypography variant="label">
            EVENT
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '80px', width: '13vw' }}>
          <CustomTypography variant="label">
            TISSUE
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ minWidth: '96px', width: '16vw' }}>
          <CustomTypography variant="label">
            AGE (SAMPLE)
          </CustomTypography>
        </TableCell>
        <TableCellRight sx={{ minWidth: '318px', paddingLeft: '10px' }}>
          <Box display="flex" gap="12px">
            <Box width="72px">
              <CustomTypography variant="label">
                CURATORS
              </CustomTypography>
            </Box>
            <Box width="72px">
              <CustomTypography variant="label">
                SOMATIC
              </CustomTypography>
            </Box>
            <Box width="72px">
              <CustomTypography variant="label">
                GERMLINE
              </CustomTypography>
            </Box>
          </Box>
        </TableCellRight>
      </TableRow>
    </TableHead>
  );
}
