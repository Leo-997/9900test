import clsx from 'clsx';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  header: {
    alignItems: 'center',
    minHeight: '30px',
    padding: '16px 0px',
    columnGap: '12px',
    width: 'fit-content',
    backgroundColor: '#FAFBFC',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  fixedColumns: {
    position: 'sticky',
    paddingLeft: '16px',
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
    minWidth: '240px',
    width: '11vw',
  },
  checkboxBox: {
    width: '50px',
  },
}));

export function DashboardSampleListHeader(): JSX.Element {
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
        <Box
          display="flex"
          flexDirection="column"
          width="320px"
        >
          <CustomTypography variant="label">
            Sample ID
          </CustomTypography>
        </Box>
        <Box
          display="flex"
          columnGap="4px"
          minWidth="130px"
        >
          <CustomTypography variant="label">
            Stage
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
        className={classes.sm}
        alignItems="center"
      >
        <CustomTypography variant="label">
          Enrolment
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.sm}
      >
        <CustomTypography variant="label">
          Study
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.xs}
      >
        <CustomTypography variant="label">
          Event
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.md}
      >
        <CustomTypography variant="label">
          Cohort
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.sm}
      >
        <CustomTypography variant="label">
          Zero2 Category
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.md}
      >
        <CustomTypography variant="label">
          Zero2 Subcategory 1
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.md}
      >
        <CustomTypography variant="label">
          Zero2 Subcategory 2
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.lg}
      >
        <CustomTypography variant="label">
          Zero2 Final Diagnosis
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.sm}
      >
        <CustomTypography variant="label">
          Mutation Burden
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.xs}
      >
        <CustomTypography variant="label">
          Purity
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.md}
      >
        <CustomTypography variant="label">
          DKFZ METH CLASSIFIER
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.sm}
      >
        <CustomTypography variant="label">
          MGMT Status
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        className={classes.sm}
      >
        <CustomTypography variant="label">
          Curation Date
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={classes.fixedColumnsRight}
      >
        <CustomTypography variant="label">
          Curators
        </CustomTypography>
      </Box>
    </Box>
  );
}
