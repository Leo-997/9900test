import clsx from 'clsx';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import CustomTypography from '../../../Common/Typography';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  fixedColumns: {
    minWidth: 'max(50%, 640px)',
    position: 'sticky',
    left: 0,
    background: '#FFFFFF',
    paddingLeft: 16,
  },
  scrollableSection: {
    minWidth: 615,
  },
  dynamicWrapper: {
    width: '100%',
    height: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  root: {
    width: '100%',
    minWidth: 1255,
    borderBottom: `1px solid ${corePalette.grey50}`,
    position: 'sticky',
    top: '0px',
    background: 'white',
    zIndex: 11,
  },
  sectionPadding: {
    paddingTop: 16,
    paddingBottom: 16,
  },
}));

export function MeetingHeader(): JSX.Element {
  const classes = useStyles({});

  return (
    <Grid
      container
      className={clsx(classes.root)}
      justifyContent="flex-start"
      alignItems="center"
      wrap="nowrap"
    >
      <Grid
        size={{ sm: 4 }}
        className={
          clsx(
            classes.fullHeight,
            classes.sectionPadding,
            classes.fixedColumns,
          )
        }
      >
        <Grid
          container
          justifyContent="flex-start"
          alignItems="center"
          className={clsx(classes.fullHeight)}
        >
          <Grid size={{ sm: 6 }} className={clsx(classes.fullHeight)}>
            <CustomTypography variant="label">SAMPLE ID</CustomTypography>
          </Grid>
          <Grid size={{ sm: 3 }} className={clsx(classes.fullHeight)}>
            <CustomTypography variant="label">STATUS</CustomTypography>
          </Grid>
          <Grid size={{ sm: 3 }} className={clsx(classes.fullHeight)}>
            <CustomTypography variant="label">ENROLMENT</CustomTypography>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        className={clsx(classes.fullHeight, classes.sectionPadding)}
        style={{ width: '100%' }}
      >
        <Grid
          container
          justifyContent="flex-start"
          alignItems="center"
          className={clsx(classes.fullHeight, classes.scrollableSection)}
          wrap="nowrap"
        >
          <Grid size={{ sm: 3 }} className={clsx(classes.fullHeight)}>
            <CustomTypography variant="label">Cancer Type</CustomTypography>
          </Grid>
          <Grid size={{ sm: 4 }} className={clsx(classes.fullHeight)}>
            <CustomTypography variant="label">FINAL DIAGNOSIS</CustomTypography>
          </Grid>
          <Grid size={{ sm: 2 }} className={clsx(classes.fullHeight)}>
            <CustomTypography variant="label">Curation Date</CustomTypography>
          </Grid>
          <Grid size={{ sm: 2 }} className={clsx(classes.fullHeight)}>
            <CustomTypography variant="label" style={{ marginLeft: '20px' }}>Curators</CustomTypography>
          </Grid>
          <Grid size={{ sm: 1 }} className={clsx(classes.fullHeight)}>
            {' '}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
