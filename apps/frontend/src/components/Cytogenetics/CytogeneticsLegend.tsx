import { colorShades } from '@/themes/colours';
import { IArmCNSummary } from '@/types/Cytogenetics.types';
import { toFixed } from '@/utils/math/toFixed';
import { Grid, styled } from '@mui/material';
import CustomTypography from '../Common/Typography';
import SearchFilterBar from '../SearchFilterBar/SearchFilterBar';

import type { JSX } from "react";

const Root = styled(Grid)(() => ({
  width: '100%',
  height: '100%',
  paddingLeft: '60px',
  paddingBottom: '8px',
}));

const Legend = styled('div')(() => ({
  width: '500px',
  height: '20px',
  borderRadius: '10px',
  background: `linear-gradient(90deg, ${colorShades.greens[800].backgroundColour} 0%, ${colorShades.greens[600].backgroundColour} 12.5%, ${colorShades.greens[400].backgroundColour} 25%, ${colorShades.greens[200].backgroundColour} 37.5%, ${colorShades.N200.backgroundColour} 50%, ${colorShades.reds[200].backgroundColour} 62.5%, ${colorShades.reds[400].backgroundColour} 75%, ${colorShades.reds[600].backgroundColour} 87.5%, ${colorShades.reds[800].backgroundColour} 100%)`,
}));

const LohCircle = styled('div')(({ theme }) => ({
  width: '20px',
  height: '20px',
  borderRadius: '10px',
  background: theme.colours.core.violet50,
}));

interface IProps {
  armCnSummary: IArmCNSummary;
}

export default function CytogeneticsLegend({ armCnSummary }: IProps): JSX.Element {
  return (
    <SearchFilterBar>
      <Root
        container
        direction="row"
        alignItems="flex-end"
        gap="16px"
      >
        <CustomTypography variant="bodySmall">Copy Number:</CustomTypography>
        <div>
          <Grid container direction="row" alignItems="flex-end" justifyContent="space-between">
            <CustomTypography variant="label">
              p:
              {toFixed(armCnSummary.p.min, 2)}
              , q:
              {toFixed(armCnSummary.q.min, 2)}
            </CustomTypography>
            <CustomTypography variant="label">2</CustomTypography>
            <CustomTypography variant="label">
              p:
              {toFixed(armCnSummary.p.max, 2)}
              , q:
              {toFixed(armCnSummary.q.max, 2)}
            </CustomTypography>
          </Grid>
          <Legend />
        </div>
        <CustomTypography variant="bodySmall" style={{ marginLeft: '60px' }}>LOH:</CustomTypography>
        <LohCircle />
      </Root>
    </SearchFilterBar>
  );
}
