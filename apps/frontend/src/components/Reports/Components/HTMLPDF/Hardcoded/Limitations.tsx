import { Box, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  row: {
    padding: '0px 2px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiBox-root': {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& > *': {
        fontSize: '8px !important',
      },
    },
  },
}));

interface IProps {
  limitations: string;
}

export function Limitations({
  limitations,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Grid container direction="row" wrap="nowrap">
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid size={12}>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '11px' }} fontWeight="bold">
              Limitations
            </CustomTypography>
          </Grid>
        </Grid>
        <Grid container direction="row" className={classes.row}>
          <Box sx={{ lineHeight: '5px' }}>
            <CustomTypography variant="bodySmall" sx={{ whiteSpace: 'pre-wrap' }}>
              {limitations}
            </CustomTypography>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}
