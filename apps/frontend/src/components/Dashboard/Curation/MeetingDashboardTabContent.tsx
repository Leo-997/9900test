import { makeStyles } from '@mui/styles';
import { ReactNode, useCallback, type JSX } from 'react';
import { IAnalysisPatient } from '@/types/Analysis/AnalysisSets.types';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import MeetingEmpty from '../Components/Common/Static/MeetingEmpty';
import { CurationDashboardHeader } from '../Components/NewCuration/CurationDashboardHeader';
import CurationPatientBlock from '../Components/NewCuration/ListItem/CurationPatientBlock';

const useStyles = makeStyles(() => ({
  root: {
    background: '#FFFFFF',
    height: '100%',
    width: '100%',
    maxWidth: '100%',
  },
  listWrapper: {
    height: 'calc(100vh - 250px)',
    width: '100%',
  },
}));

interface IProps {
  currentDate?: string;
  isAssignSampleOpen?: boolean;
}

function MeetingDashboardTabContent({
  currentDate,
  isAssignSampleOpen,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser, loading } = useUser();

  const fetchDashboardData = useCallback(
    async (page: number) => {
      async function fetchDashboardDataFn(): Promise<IAnalysisPatient[]> {
        const resp = await zeroDashSdk.curation.analysisSets.getAnalysisSetPatients(
          {
            startCuration: currentDate,
            endCuration: currentDate,
          },
          page,
          20,
        );

        return resp;
      }

      if (!isAssignSampleOpen && currentUser?.id) {
        const data = await fetchDashboardDataFn();
        return data;
      }
      return [];
    },
    [currentDate, currentUser?.id, isAssignSampleOpen, zeroDashSdk.curation.analysisSets],
  );

  const mapping = (
    analysisPatient: IAnalysisPatient,
  ): ReactNode => (
    <CurationPatientBlock
      analysisPatient={analysisPatient}
      key={analysisPatient.publicSubjectId}
    />
  );

  return (
    <div className={classes.root}>
      {!currentUser || loading ? (
        <LoadingAnimation />
      ) : (
        <TabContentWrapper
          className={classes.listWrapper}
          fetch={fetchDashboardData}
          beforeMappingContent={
            <CurationDashboardHeader />
          }
          mapping={mapping}
          customEmptyContent={
            <MeetingEmpty type="Curation" meetingDate={currentDate} />
          }
        />
      )}
    </div>
  );
}

export default MeetingDashboardTabContent;
