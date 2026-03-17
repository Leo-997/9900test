import { Box, Grid, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import { FileTrackerTabContent } from '../../components/FileTracker/FileTrackerTabContent';

const Page = styled(Box)(({ theme }) => ({
  paddingTop: 20,
  paddingLeft: 24,
  paddingRight: 24,
  backgroundColor: theme.colours.core.grey10,
  height: 'calc(100vh - 80px)',
  width: '100vw',
  overflow: 'hidden',
  display: 'flex',
  borderRadius: '22px 0 0 0',
  position: 'relative',
  top: '80px',
}));

const Background = styled(Box)(({ theme }) => ({
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  backgroundColor: theme.colours.core.offBlack100,
  zIndex: -1,
}));

const useStyles = makeStyles(() => ({
  content: {
    flexGrow: 1,
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 24,
    maxHeight: '100%',
    width: '100%',
  },
  filesSection: {
    marginTop: 24,
    height: 'calc(100% - 24px)',
    width: '100%',
    maxWidth: '100%',
  },
}));

interface IFileTrackerPageProps {
  query: URLSearchParams;
}

export default function FileTrackerPage({
  query,
}: IFileTrackerPageProps): JSX.Element {
  const classes = useStyles();

  return (
    <Page>
      <Background />
      <main className={classes.content}>
        <Grid
          container
          direction="column"
          style={{ height: '100%', width: '100%' }}
          wrap="nowrap"
        >
          <Grid className={classes.filesSection}>
            <FileTrackerTabContent query={query} />
          </Grid>
        </Grid>
      </main>
    </Page>
  );
}
