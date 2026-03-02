import { makeStyles } from '@mui/styles';
import { ReactNode, type JSX } from 'react';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { LoadingPage } from '@/pages/Loading/Loading';
import NavBar from '../components/NavBar/NavBar';
import RightSideNavigation from '../components/NavBar/RightSideNavigation';

import { usePatient } from '../contexts/PatientContext';

import updateTabTitle from '../utils/functions/updateTabTitle';

const NAVBAR_HEIGHT = 80;
const useStyles = makeStyles(() => ({
  page: {
    backgroundColor: '#F3F5F7',
    height: '100vh',
    width: '100%',
    maxHeight: '100vh',
    maxWidth: '100vw',
    overflow: 'hidden',
  },
  contentWrapper: {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    padding: '30px 0 0 32px',
    display: 'flex',
    alignItems: 'start',
    flexDirection: 'row',
    justifyContent: 'top',
  },
  content: {
    width: 'calc(100% - 120px)',
    height: '100%',
  },
  rightNav: {
    marginLeft: 'auto',
  },
}));

interface IProps {
  children: ReactNode;
}

export default function CurationLayout({
  children,
}: IProps): JSX.Element {
  const classes = useStyles();

  const {
    patient,
    error: patientError,
  } = usePatient();
  const { analysisSet } = useAnalysisSet();

  updateTabTitle(analysisSet);

  if (!analysisSet && !patientError) {
    return <LoadingPage />;
  }
  if (patient.patientId && analysisSet.analysisSetId) {
    return (
      <div className={classes.page}>
        <NavBar />
        <div className={classes.contentWrapper}>
          <div className={classes.content}>{children}</div>
          <div className={classes.rightNav}>
            <RightSideNavigation isSummary={false} key="curation-right-side-nav" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>Placeholder error page... invalid patient or sample requested </div>
  );
}
