import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { Grid } from '@mui/material';
import CustomTypography from '../Common/Typography';
import DataPanel from '../Common/DataPanel';

import type { JSX } from "react";

export default function TumourImmuneProfileSummary(): JSX.Element {
  const { immunoprofile } = useAnalysisSet();

  const formatImmunoprofileValue = (
    value: string | number | null | undefined,
    ptile: string | number | null | undefined,
    status?: string | number | null | undefined,
  ): string => {
    const hasValue = value !== null && value !== undefined;
    const hasPtile = ptile !== null && ptile !== undefined;
    const hasStatus = status !== null && status !== undefined;

    if (!hasValue && !hasPtile && !hasStatus) {
      return '-';
    }

    let result = '';

    if (hasStatus) {
      result += `${status}`;
    }

    if (hasValue) {
      const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
      if (hasStatus) {
        result += `: ${formattedValue}`;
      } else {
        result += `${formattedValue}`;
      }
    } else if (hasStatus) {
      result += ': -';
    }

    if (hasPtile) {
      const formattedPtile = typeof ptile === 'number' ? ptile.toFixed(2) : ptile;
      result += ` (${formattedPtile})`;
    }

    return result || '-';
  };

  return (
    <Grid
      container
      direction="column"
      spacing={2}
      size={{ xs: 12, lg: 4 }}
      padding="24px"
      borderRadius="8px"
      bgcolor="white"
    >
      <CustomTypography variant="titleRegular" fontWeight="medium">
        Tumour Immune Profile
      </CustomTypography>
      <Grid container direction="row" justifyContent="space-between">
        <Grid>
          <DataPanel
            label="IPASS STATUS"
            value={formatImmunoprofileValue(
              immunoprofile?.ipassValue,
              immunoprofile?.ipassptile,
              immunoprofile?.ipassStatus,
            )}
          />
        </Grid>
        <Grid>
          <DataPanel
            label="M1M2 Status"
            value={formatImmunoprofileValue(
              immunoprofile?.m1m2Value,
              immunoprofile?.m1m2ptile,
            )}
          />
        </Grid>
        <Grid>
          <DataPanel
            label="CD8 Status"
            value={formatImmunoprofileValue(
              typeof immunoprofile?.cd8Value === 'number'
                ? immunoprofile.cd8Value.toExponential(2)
                : immunoprofile?.cd8Value,
              immunoprofile?.cd8ptile,
            )}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
