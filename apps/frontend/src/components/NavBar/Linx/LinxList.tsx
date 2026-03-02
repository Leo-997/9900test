import { List } from '@mui/material';
import Grid from '@mui/material/Grid';
import { createStyles, makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import type { JSX } from 'react';
import { LinxPlot } from '../../../types/Plot.types';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';
import ListItem from './LinxListItem';

const useStyles = makeStyles(() => createStyles({
  root: {
    flexGrow: 1,
    width: '100%',
    height: '100%',
  },
}));

interface ILinxListProps {
  plots: LinxPlot[];
  setCurrentPlot: (plot: string) => void;
  handleDeletePlot: (plot: LinxPlot) => void;
}

function LinxList({
  plots,
  setCurrentPlot,
  handleDeletePlot,
}: ILinxListProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid size={12} className={classes.root}>
        <List style={{ width: '100%', paddingTop: '0px', height: '100%' }}>
          <ScrollableSection className={classes.root}>
            {
              plots.sort((a, b) => dayjs(b.created).diff(dayjs(a.created)))
                .map((plot) => (
                  <ListItem
                    key={plot.fileId}
                    plot={plot}
                    setCurrentPlot={setCurrentPlot}
                    handleDeletePlot={handleDeletePlot}
                  />
                ))
            }
          </ScrollableSection>
        </List>
      </Grid>
    </div>
  );
}

export default LinxList;
