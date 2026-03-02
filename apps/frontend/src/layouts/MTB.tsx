import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { usePatient } from '@/contexts/PatientContext';
import { LoadingPage } from '@/pages/Loading/Loading';
import { makeStyles } from '@mui/styles';
import { useState, type JSX } from 'react';
import NavBar from '../components/MTB/NavBar/Sample/NavBar';
import MTBArchive from '../components/MTB/Views/MTBArchive';
import MTBContentWrapper from '../components/MTB/Views/MTBContentWrapper';
import { useClinical } from '../contexts/ClinicalContext';
import updateTabTitle from '../utils/functions/updateTabTitle';

const NAVBAR_HEIGHT = 80;
const useStyles = makeStyles(() => ({
  page: {
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  contentWrapper: {
    height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}));

export default function MTBLayout(): JSX.Element {
  const classes = useStyles();
  const {
    getSlides,
    clinicalVersion,
    error,
    isPresentationMode,
    // unvalidatedDrugs,
  } = useClinical();
  const { analysisSet, demographics } = useAnalysisSet();
  const { patient } = usePatient();

  const [archiveOpen, setArchiveOpen] = useState<boolean>(false);
  // const [awaitingApprovalOpen, setAwaitingApprovalOpen] = useState<boolean>(false);

  updateTabTitle(analysisSet);

  if (
    (!patient.patientId
    || !analysisSet.analysisSetId
    || !clinicalVersion.id)
    && !error
  ) {
    return <LoadingPage message="Fetching clinical data.." />;
  }

  if (
    patient.patientId
    && analysisSet.analysisSetId
    && clinicalVersion.id
  ) {
    return (
      <>
        <div
          className={classes.page}
          style={{
            backgroundColor: isPresentationMode ? '#FAFBFC' : '#030313',
          }}
        >
          {!isPresentationMode && (
            <NavBar
              onOpenArchive={(): void => setArchiveOpen(true)}
              // onOpenAwaitingApproval={(): void => setAwaitingApprovalOpen(true)}
            />
          )}
          <div className={classes.contentWrapper} style={{ height: isPresentationMode ? '100vh' : undefined }}>
            <div className={classes.content}>
              <MTBContentWrapper />
            </div>
          </div>
        </div>
        {archiveOpen && (
          <MTBArchive
            open={archiveOpen}
            onClose={(): void => {
              getSlides();
              setArchiveOpen(false);
            }}
          />
        )}
        {/* {awaitingApprovalOpen && (
          <AwaitingValidationDrugs
            unvalidatedDrugs={unvalidatedDrugs}
            open={awaitingApprovalOpen}
            onClose={(): void => {
              getSlides();
              setAwaitingApprovalOpen(false);
            }}
          />
        )} */}
      </>
    );
  }

  return (
    <div>Placeholder error page... invalid patient or sample requested </div>
  );
}
