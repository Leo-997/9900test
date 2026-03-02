import { Grid, SxProps, Theme } from '@mui/material';
import { toFixed } from '../../utils/math/toFixed';
import DataPanel from '../Common/DataPanel';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

interface IProps {
  title: string;
  titleContent: string;
  pMean?: number;
  p20?: number;
  p30?: number;
  p50?: number;
  sx?: SxProps<Theme>;
}

export default function CoverageInfoSegment({
  title,
  titleContent,
  pMean,
  p20,
  p30,
  p50,
  sx,
}: IProps): JSX.Element {
  return (
    <Grid
      container
      direction="column"
      size={{ xs: 12, md: 6, lg: 4 }}
      spacing={2}
      height="fit-content"
      minHeight="112px"
      padding="0 24px"
      sx={sx}
    >
      <DataPanel
        label={title}
        value={(
          <CustomTypography variant="bodyRegular" fontWeight="bold">
            {titleContent || '-'}
          </CustomTypography>
        )}
      />
      <Grid container direction="row" justifyContent="space-between" spacing={2}>
        <Grid>
          <DataPanel label="Mean Coverage" value={pMean ? toFixed(pMean, 4) : '-'} />
        </Grid>
        <Grid>
          <DataPanel label="% > 20x" value={`${p20 ? toFixed(p20 * 100, 2) : '-'} %`} />
        </Grid>
        <Grid>
          <DataPanel label="% > 30x" value={`${p30 ? toFixed(p30 * 100, 2) : '-'} %`} />
        </Grid>
        <Grid>
          <DataPanel label="% > 50x" value={`${p50 ? toFixed(p50 * 100, 2) : '-'} %`} />
        </Grid>
      </Grid>
    </Grid>
  );
}
