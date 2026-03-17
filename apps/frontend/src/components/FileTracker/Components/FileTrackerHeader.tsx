import {
    Grid, styled,
} from '@mui/material';

import CustomTypography from '../../Common/Typography';

import type { JSX } from "react";

const Item = styled(Grid)(() => ({
  verticalAlign: 'top',
  padding: '8px',
  width: '150px',
  minWidth: '150px',
}));

const Paper = styled(Grid)(() => ({
  margin: 0,
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
}));

const StickySection = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  left: '0px',
  paddingLeft: '8px',
  zIndex: 1,
  backgroundColor: theme.colours.core.white,
  flexShrink: 0,
  paddingRight: '8px',
  width: '45%',
  minWidth: '700px',
}));

export function FileTrackerHeader(): JSX.Element {
  return (
    <Paper>
      <StickySection>
        <Grid container height="100%" gap="8px" alignItems="center">
          <Grid flex={1} />
          <Grid flex={6}>
            <CustomTypography variant="label">FILE NAME</CustomTypography>
          </Grid>
          <Grid flex={5}>
            <CustomTypography variant="label">SAMPLE ID</CustomTypography>
          </Grid>
        </Grid>
      </StickySection>
      <Item>
        <CustomTypography variant="label">GENOME</CustomTypography>
      </Item>
      <Item>
        <CustomTypography variant="label">FILE TYPE</CustomTypography>
      </Item>
      <Item>
        <CustomTypography variant="label">FILE SIZE (BYTES)</CustomTypography>
      </Item>
      <Item>
        <CustomTypography variant="label">DATE MODIFIED</CustomTypography>
      </Item>
    </Paper>
  );
}
