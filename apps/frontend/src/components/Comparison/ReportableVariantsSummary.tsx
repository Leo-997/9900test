import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useMemo, useState, type JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import type { VariantType } from '@/types/misc.types';
import type { IGetReportableVariantData } from '@/types/Reports/ReportableVariants.types';
import type { ComparisonSubject } from './types';

interface Props {
  subject: ComparisonSubject;
}

const summaryOrder: VariantType[] = [
  'SNV',
  'CNV',
  'SV',
  'RNA_SEQ',
  'RNA_CLASSIFIER',
  'METHYLATION',
  'CYTOGENETICS',
  'MUTATIONAL_SIG',
  'HTS',
  'HTS_COMBINATION',
];

export function ReportableVariantsSummary({
  subject,
}: Props): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const [items, setItems] = useState<IGetReportableVariantData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    async function run(): Promise<void> {
      if (!subject.analysisSetId) return;
      setIsLoading(true);
      setError(undefined);
      try {
        const resp = await zeroDashSdk.reportableVariants.getReportableVariants(
          subject.analysisSetId,
          {},
        );
        if (!cancelled) setItems(resp);
      } catch {
        if (!cancelled) setError('Failed to load reportable variants');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [subject.analysisSetId, zeroDashSdk.reportableVariants]);

  const grouped = useMemo(() => {
    const map = new Map<VariantType, IGetReportableVariantData[]>();
    for (const i of items) {
      const arr = map.get(i.variantType) ?? [];
      arr.push(i);
      map.set(i.variantType, arr);
    }
    return map;
  }, [items]);

  const rows = useMemo(() => {
    const types = [...grouped.keys()].sort((a, b) => {
      const ai = summaryOrder.indexOf(a);
      const bi = summaryOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return types.map((t) => {
      const list = grouped.get(t) ?? [];
      const top = list.slice(0, 5).map((x) => x.variantId).join(', ');
      return { type: t, count: list.length, top };
    });
  }, [grouped]);

  return (
    <Box>
      <CustomTypography variant="titleSmall" fontWeight="bold" sx={{ marginBottom: '8px' }}>
        Variant summary
      </CustomTypography>
      <CustomTypography variant="bodyTiny" sx={{ color: corePalette.grey200, marginBottom: '8px' }}>
        {subject.patientId} — {subject.timepointTag}
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
              <TableCell>
                <CustomTypography variant="label">Type</CustomTypography>
              </TableCell>
              <TableCell sx={{ width: 80 }}>
                <CustomTypography variant="label">Count</CustomTypography>
              </TableCell>
              <TableCell>
                <CustomTypography variant="label">Example IDs</CustomTypography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>
                  <CustomTypography variant="bodySmall">Loading…</CustomTypography>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={3}>
                  <CustomTypography variant="bodySmall" sx={{ color: corePalette.red200 }}>
                    {error}
                  </CustomTypography>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !error && rows.map((r) => (
              <TableRow key={r.type}>
                <TableCell>
                  <CustomTypography variant="bodySmall" fontWeight="bold">
                    {r.type}
                  </CustomTypography>
                </TableCell>
                <TableCell>
                  <CustomTypography variant="bodySmall">
                    {r.count}
                  </CustomTypography>
                </TableCell>
                <TableCell>
                  <CustomTypography variant="bodySmall" truncate>
                    {r.top || '-'}
                  </CustomTypography>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <CustomTypography variant="bodySmall">
                    No reportable variants found.
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

