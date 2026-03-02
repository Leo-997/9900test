import { Table } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  useCallback, useEffect, useMemo, useState, type JSX,
} from 'react';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import TabContentWrapper from '@/components/PreCurationTabs/TabContentWrapper';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IAnalysisPatient, IAnalysisSet, IAnalysisSetFilters } from '@/types/Analysis/AnalysisSets.types';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import { curationExportOptions } from '@/constants/Curation/export';
import { DashboardExportOptions } from '../../../types/Search.types';
import CurationSearchFilterBar from '../Components/Curation/SearchFilterSort/CurationSearchFilterBar';
import { CurationDashboardHeader } from '../Components/NewCuration/CurationDashboardHeader';
import CurationPatientBlock from '../Components/NewCuration/ListItem/CurationPatientBlock';
import { SamplelessPatientListItem } from '../Components/Common/SamplelessPatient/SamplelessPatientListItem';
import { SamplelessDashboardHeader } from '../Components/Common/SamplelessPatient/SamplelessDashboardHeader';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
    maxWidth: '100%',
  },
  listWrapper: {
    height: 'calc(100vh - 245px)',
    width: '100%',
  },
}));

function CurationDashboardTabContent(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser } = useUser();

  const defaultFilters: IAnalysisSetFilters = useMemo(() => ({
    includeRelatedCases: true,
  }), []);

  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [dbFilters, setDbFilters] = useState<IAnalysisSetFilters>({});
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [exportOptions, setExportOptions] = useState<DashboardExportOptions>(curationExportOptions);

  const areSamplelessPatients = dbFilters.enrolledOnlyCases || dbFilters.withdrawnCases;

  const getCount = useCallback(async (): Promise<number> => {
    const resp = await zeroDashSdk.curation.analysisSets.getAnalysisSetsCount({
      ...dbFilters,
      primaryCurators: dbFilters.primaryCurators?.map((user) => (
        user.split('::')[1]
      )),
    });

    return resp;
  }, [dbFilters, zeroDashSdk.curation.analysisSets]);

  useEffect(() => {
    getCount()
      .then((total) => setTotalCount(total));
  }, [getCount]);

  const getDashboardData = async (): Promise<IAnalysisSet[]> => {
    const dashboardData: IAnalysisSet[] = [];
    const limit = 100;

    const countRecords = await getCount();
    const numOfPages = Math.ceil(countRecords / limit);
    await Promise.all(Array(numOfPages).fill(0).map((e, index) => (
      zeroDashSdk.curation.analysisSets.getAnalysisSetPatients(dbFilters, index + 1, limit)
        .then((resp) => dashboardData.push(...resp.flatMap(
          (patient) => patient.analysisSets
            .map((aset) => ({
              ...aset,
              ...patient,
            })),
        )))
    )));

    return dashboardData;
  };

  const getFileTrackerFiles = async (): Promise<void> => {
    const dashboardData: IAnalysisSet[] = await getDashboardData();
    const sets = dashboardData.map((aset) => getTumourBiosample(aset.biosamples || [])?.biosampleId)
      .filter((biosample) => biosample);
    const query = `searchId=${sets.join(';')}`;
    window.open(`/files?${query}`, '_blank');
  };

  const fetch = useCallback(async (page: number): Promise<IAnalysisPatient[]> => {
    setDataLoading(true);
    const resp = await zeroDashSdk.curation.analysisSets.getAnalysisSetPatients(
      {
        ...dbFilters,
        primaryCurators: dbFilters.primaryCurators?.map((user) => (
          user.split('::')[1]
        )),
        ...defaultFilters,
      },
      page,
      20,
    );
    setDataLoading(false);
    return resp;
  }, [zeroDashSdk.curation.analysisSets, dbFilters, defaultFilters]);

  const mapping = useCallback((
    analysisPatient: IAnalysisPatient,
    index: number,
    update?: ((value: IAnalysisPatient) => void),
  ) => (
    areSamplelessPatients ? (
      <SamplelessPatientListItem
        key={`${analysisPatient.patientId}::${analysisPatient.study}`}
        patient={analysisPatient}
        updatePatient={update}
        loading={dataLoading}
        setLoading={setDataLoading}
      />
    ) : (
      <CurationPatientBlock
        analysisPatient={analysisPatient}
        key={analysisPatient.publicSubjectId}
        updateAnalysisPatient={update}
      />

    )
  ), [areSamplelessPatients, dataLoading]);

  return (
    <div className={classes.root}>
      <CurationSearchFilterBar
        toggled={dbFilters || {}}
        setToggled={setDbFilters}
        exportOptions={exportOptions}
        setExportOptions={setExportOptions}
        getFileTrackerFiles={getFileTrackerFiles}
        getDashboardData={getDashboardData}
        emptyOptions={{}}
        counts={{ current: count, total: totalCount }}
        loading={dataLoading}
        setLoading={setDataLoading}
      />
      {!currentUser ? (
        <LoadingAnimation />
      ) : (
        <Table stickyHeader sx={{ display: 'block' }}>
          <TabContentWrapper
            className={classes.listWrapper}
            fetch={fetch}
            updateCount={setCount}
            beforeMappingContent={areSamplelessPatients
              ? <SamplelessDashboardHeader />
              : <CurationDashboardHeader />}
            mapping={mapping}
          />
        </Table>
      )}
    </div>
  );
}

export default CurationDashboardTabContent;
