import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import type { MetricDefinition, ComparisonSubject } from './types';

interface Props {
  subjects: ComparisonSubject[];
  metrics: MetricDefinition[];
}

export function ComparisonMetricsTable({
  subjects,
  metrics,
}: Props): JSX.Element {
  return (
    <Box>
      <CustomTypography variant="titleSmall" fontWeight="bold" sx={{ marginBottom: '8px' }}>
        Selected metrics
      </CustomTypography>
      <TableContainer
        sx={{
          border: `1px solid ${corePalette.grey50}`,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: corePalette.white,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: corePalette.grey10 }}>
              <TableCell sx={{ width: '240px' }}>
                <CustomTypography variant="label">Metric</CustomTypography>
              </TableCell>
              {subjects.map((s) => (
                <TableCell key={s.id}>
                  <CustomTypography variant="label" truncate>
                    {s.patientId} — {s.timepointTag}
                  </CustomTypography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <CustomTypography variant="bodySmall" fontWeight="bold">
                    {m.label}
                  </CustomTypography>
                </TableCell>
                {subjects.map((s) => (
                  <TableCell key={`${m.id}-${s.id}`}>
                    <CustomTypography variant="bodySmall">
                      {m.getValue(s)}
                    </CustomTypography>
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {metrics.length === 0 && (
              <TableRow>
                <TableCell colSpan={subjects.length + 1}>
                  <CustomTypography variant="bodySmall">
                    No metrics selected.
                  </CustomTypography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

