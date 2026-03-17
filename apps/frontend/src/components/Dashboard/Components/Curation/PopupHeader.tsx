import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

import type { JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  header: {
    alignItems: 'center',
    borderBottom: `1px solid ${corePalette.grey50}`,
    minHeight: '30px',
    padding: '16px 0px',
    columnGap: '12px',
    width: 'fit-content',
    backgroundColor: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  fixedColumns: {
    position: 'sticky',
    paddingLeft: 0,
    left: 0,
    columnGap: '16px',
    backgroundColor: 'inherit',
  },
  fixedColumnsRight: {
    position: 'sticky',
    paddingLeft: '16px',
    right: 0,
    columnGap: '16px',
    backgroundColor: 'inherit',
    minWidth: '180px',
  },
  xs: {
    minWidth: '60px',
    width: '3vw',
  },
  sm: {
    minWidth: '130px',
    width: '5vw',
  },
  md: {
    minWidth: '180px',
    width: '8vw',
  },
  lg: {
    minWidth: '586px',
  },
  checkboxBox: {
    width: '50px',
  },
}));

export function PopupHeader(): JSX.Element {
  const classes = useStyles();

  return (
    <Box
      display="flex"
      flexDirection="row"
      className={
        clsx(
          classes.header,
        )
      }
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={classes.fixedColumns}
      >
        <Box display="flex" className={classes.checkboxBox} />
        <Box
          display="flex"
          flexDirection="column"
          width="180px"
        >
          <CustomTypography variant="label">
            Sample ID
          </CustomTypography>
        </Box>
        <Box
          display="flex"
          gap="8px"
          minWidth="130px"
          flexDirection="column"
        >
          <CustomTypography variant="label">
            Status
          </CustomTypography>
        </Box>
      </Box>
      <Box
        display="flex"
        className={classes.lg}
      >
        <CustomTypography variant="label">
          Zero2 Final Diagnosis
        </CustomTypography>
      </Box>
    </Box>
  );
}
