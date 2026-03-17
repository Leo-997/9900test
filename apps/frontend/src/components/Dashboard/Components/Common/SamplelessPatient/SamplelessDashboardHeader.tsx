import {
  TableCell as MuiTableCell,
  styled,
  TableHead as MuiTableHead,
  TableRow,
} from '@mui/material';
import type { JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import { samplelessPatientHeaderWidths } from '@/constants/Curation/samplelessPatient';

const TableHead = styled(MuiTableHead)({
  position: 'sticky',
  zIndex: 1,
  top: 0,
});

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  backgroundColor: theme.colours.core.grey10,
  border: 'none',
  padding: '16px 16px 16px 0px',
}));

export function SamplelessDashboardHeader(): JSX.Element {
  return (
    <TableHead>
      <TableRow sx={{ display: 'flex', height: '60px', padding: '0' }}>
        <TableCell
          sx={{
            ...samplelessPatientHeaderWidths[0],
            padding: '16px',
          }}
        />
        <TableCell
          sx={samplelessPatientHeaderWidths[1]}
        >
          <CustomTypography variant="label">
            Status
          </CustomTypography>
        </TableCell>
        <TableCell
          sx={samplelessPatientHeaderWidths[2]}
        >
          <CustomTypography variant="label">
            Study
          </CustomTypography>
        </TableCell>
        <TableCell
          sx={samplelessPatientHeaderWidths[3]}
        >
          <CustomTypography variant="label">
            Registration
          </CustomTypography>
        </TableCell>
        <TableCell sx={{ flex: 1 }}>
          <CustomTypography variant="label">
            Comments
          </CustomTypography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
