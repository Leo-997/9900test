import {
  Accordion, AccordionDetails, AccordionSummary, Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChevronDownIcon } from 'lucide-react';
import type { JSX } from 'react';
import { corePalette } from '@/themes/colours';
import { HTS_PLOT_DATA } from '../../constants/plots';
import { IHTSCulturePlots } from '../../types/HTS.types';
import CustomTypography from '../Common/Typography';
import PlotCard from '../QCPlots/PlotCard';

const useStyles = makeStyles(() => ({
  accordionRoot: {
    borderRadius: '4px',

    '&:before': {
      display: 'none',
    },
  },
}));

interface IProps {
  plots?: IHTSCulturePlots;
}

export default function HTSPlotsPanel({
  plots,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Accordion className={classes.accordionRoot} elevation={0} style={{ margin: '8px 0px' }}>
      <AccordionSummary
        sx={{ flexDirection: 'row-reverse', columnGap: '8px', backgroundColor: corePalette.white }}
        expandIcon={(
          <ChevronDownIcon />
        )}
      >
        <CustomTypography variant="h5">
          Plots
        </CustomTypography>
      </AccordionSummary>
      <AccordionDetails sx={{ flexDirection: 'column', backgroundColor: corePalette.white }}>
        <Grid container spacing={4}>
          <Grid size={{ lg: 4 }}>
            <PlotCard
              title="Drug Treatment Start"
              url={plots?.CELLS_START}
              legendTitle="Drug Treatment Start"
              legendData={HTS_PLOT_DATA.DRUG_START}
            />
          </Grid>
          <Grid size={{ lg: 4 }}>
            <PlotCard
              title="Drug Treatment End"
              url={plots?.CELLS_END}
              legendTitle="Drug Treatment End"
              legendData={HTS_PLOT_DATA.DRUG_END}
            />
          </Grid>
          <Grid size={{ lg: 4 }}>
            <PlotCard
              title="ASPCF Sunrise Plot"
              url={plots?.SUNRISE}
              legendTitle="ASPCF Sunrise Plot"
              legendData={HTS_PLOT_DATA.SUNRISE}
            />
          </Grid>
          <Grid size={{ lg: 6 }}>
            <PlotCard
              title="ASPCF LogR & BAF Plot"
              url={plots?.LOGR_BAF}
              legendTitle="ASPCF LogR & BAF Plot"
              legendData={HTS_PLOT_DATA.LOGR_BAF}
            />
          </Grid>
          <Grid size={{ lg: 6 }}>
            <PlotCard
              title="ASCAT Copy Number Profile"
              url={plots?.COPY_NUMBER}
              legendTitle="ASCAT Copy Number Profile"
              legendData={HTS_PLOT_DATA.COPY_NUMBER}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
