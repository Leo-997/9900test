import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import CircosPlots from '../QCMetrics/CircosPlots';

import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import PlotsTabContent from './PlotsTabContent';
import TumourProfileInfo from '../QCMetrics/TumourProfileInfo';

const useStyles = makeStyles(() => ({
  wrapper: {
    maxHeight: 'calc(100vh - 160px)',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
}));

export default function TumourProfileTabContent(): JSX.Element {
  const classes = useStyles();
  return (
    <ScrollableSection className={classes.wrapper}>
      <Grid container spacing={2}>
        <TumourProfileInfo />
        <CircosPlots />
        <PlotsTabContent />
      </Grid>
    </ScrollableSection>
  );
}
