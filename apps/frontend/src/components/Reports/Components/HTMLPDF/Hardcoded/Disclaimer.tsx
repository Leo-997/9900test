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
  disclaimer: string;
}

export function Disclaimer({ disclaimer }: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Grid container direction="row" wrap="nowrap">
      <Grid container direction="column">
        <Grid container direction="row">
          <Grid size={12}>
            <CustomTypography variant="bodyRegular" fontWeight="bold" style={{ fontSize: '11px' }}>
              Disclaimer
            </CustomTypography>
          </Grid>
        </Grid>
        <Grid container direction="row" className={classes.row}>
          <Box sx={{ lineHeight: '5px' }}>
            <CustomTypography variant="bodySmall">
              <span style={{ whiteSpace: 'pre-wrap' }}>
                {disclaimer}
              </span>
            </CustomTypography>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}
