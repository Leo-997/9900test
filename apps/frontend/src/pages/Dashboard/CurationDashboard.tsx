import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import { corePalette } from '@/themes/colours';
import CustomTypography from '../../components/Common/Typography';
import CurationDashboardTabContent from '../../components/Dashboard/Curation/CurationDashboardTabContent';
import { useUser } from '../../contexts/UserContext';

const WELCOME_MESSAGE_BAR_HEIGHT = 64;

const useStyles = makeStyles(() => ({
  page: {
    marginTop: 80,
    paddingTop: 20,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: '#FAFBFC',
    height: 'calc(100vh - 80px)',
    width: '100%',
    maxHeight: 'calc(100vh - 80px)',
    maxWidth: '100vw',
    overflow: 'hidden',
    display: 'flex',
    borderRadius: '22px 0 0 0',
  },
  pageBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    backgroundColor: corePalette.offBlack200,
    zIndex: -1,
  },
  welcomeMsgBar: {
    height: `${WELCOME_MESSAGE_BAR_HEIGHT}px`,
  },
  sampleSection: {
    marginTop: 24,
    maxHeight: `calc(100% - ${WELCOME_MESSAGE_BAR_HEIGHT}px - 40px)`,
    width: '100%',
    maxWidth: '100%',
  },
  content: {
    flexGrow: 1,
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 24,
    maxHeight: '100%',
    width: '100%',
  },
}));

export default function CurationDashboardPage(): JSX.Element {
  const { currentUser } = useUser();
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <div className={classes.pageBg} />
      <main className={classes.content}>
        <Grid
          container
          direction="column"
          sx={{ height: '100%', width: '100%' }}
          wrap="nowrap"
        >
          <Grid className={classes.welcomeMsgBar}>
            <CustomTypography variant="h2" fontWeight="bold">
              Hi
              {currentUser?.givenName ? ` ${currentUser.givenName}` : ''}
              ,
              here&apos;s the latest on Zerodash
            </CustomTypography>
          </Grid>
          <Grid className={classes.sampleSection}>
            <CurationDashboardTabContent />
          </Grid>
        </Grid>
      </main>
    </div>
  );
}
