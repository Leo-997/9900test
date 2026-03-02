import { useCallback, useEffect, useState, type JSX } from 'react';

import { Divider } from '@mui/material';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  ICohortStats,
  IMethCounts,
  IMethylationData,
  IMethylationGeneData,
  IMethylationPredictionData,
} from '../../types/Methylation.types';
import { IRNAClassifierTable } from '../../types/RNAseq.types';
import AddClassifierResult from '../Methylation/AddClassifierResult';
import GraphPanel from '../Methylation/GraphPanel';
import MethylationGenePanel from '../Methylation/MethylationGenePanel';
import MethylationPanel from '../Methylation/MethylationPanel';
import MethylationPredictionPanel from '../Methylation/MethylationPredictionPanel';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { MethPlots } from '../../types/Plot.types';
import MGMTCohort from '../Methylation/MGMTCohort';
import RNAClassifiers from '../RNASeq/RNAClassifiers';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';

const useStyles = makeStyles(() => ({
  wrapper: {
    maxHeight: 'calc(100vh - 160px)',
    width: '100%',
  },
  sectionWrapper: {
    width: '100%',
  },
  chipScore: {
    width: window.innerWidth < 1440 ? '80px' : '150px',
    height: '28px',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgba(208, 217, 226, 1)',
    borderRadius: '8px',
  },
  red: {
    backgroundColor: 'rgba(249, 29, 95, 1) !important',
  },
  yellow: {
    backgroundColor: 'rgba(255, 175, 95, 1) !important',
  },
  green: {
    backgroundColor: 'rgba(64, 229, 141, 1) !important',
  },
}));

export default function ClassifiersTabContent(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const {
    analysisSet,
    methBiosample,
    primaryBiosample,
    rnaBiosample,
  } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();

  const [cohortData, setCohortData] = useState<ICohortStats[] | undefined>(undefined);
  const [methMGMTCount, setMethMGMTCount] = useState<IMethCounts>({
    unmethylatedCount: 0,
    methylatedCount: 0,
  });
  const [methData, setMethData] = useState<IMethylationData[]>([]);
  const [methGeneData, setMethGeneData] = useState<IMethylationGeneData[]>([]);
  const [predData, setPredData] = useState<IMethylationPredictionData | undefined>({
    biosampleId: methBiosample?.biosampleId || '',
    methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
    targetable: false,
    reportedCount: 0,
    targetableCount: 0,
    status: '-',
    estimated: 0,
    ciLower: 0,
    ciUpper: 0,
    cutoff: 0,
    plotUrl: '',
    reportable: null,
    classification: null,
    researchCandidate: null,
  });
  const [profiles, setProfiles] = useState<MethPlots>();
  const [allClassifierData, setAllClassifierData] = useState<IRNAClassifierTable[]>([]);

  const getClassifierTableData = useCallback(async (): Promise<void> => {
    if (rnaBiosample?.biosampleId) {
      try {
        const result = await zeroDashSdk.rna.getRNAClassifierData(rnaBiosample.biosampleId);
        setAllClassifierData(result);
      } catch (error) {
        enqueueSnackbar('Error refreshing classifier data.', { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, rnaBiosample?.biosampleId, zeroDashSdk.rna]);

  const getAllMethData = useCallback(async () => {
    async function getGenePlot(m: IMethylationGeneData): Promise<string> {
      if (m.gene && methBiosample?.biosampleId) {
        try {
          const resp = await zeroDashSdk.plots.getMethGenePlot(
            methBiosample.biosampleId,
            m.gene,
          );
          return resp;
        } catch (err) {
          enqueueSnackbar('There was an issue fetching the gene plot.', { variant: 'error' });
        }
      }
      return '';
    }

    async function processMethGeneResp(
      data: IMethylationGeneData[],
    ): Promise<Record<string, string>> {
      const genePlotMap: Record<string, string> = {};
      await Promise.all(data.map(async (m) => {
        const plotUrl = await getGenePlot(m);
        genePlotMap[m.gene] = plotUrl;
      }));

      return genePlotMap;
    }

    if (primaryBiosample?.biosampleId) {
      const plotsResp = await zeroDashSdk.plots.getMethPlots(primaryBiosample.biosampleId);
      setProfiles(plotsResp);
    } else {
      setProfiles({
        cnProfile: '',
        methProfile: '',
        mgmt: '',
      });
    }

    if (!methBiosample?.biosampleId) {
      setMethData([]);
      setPredData(undefined);
      setMethGeneData([]);
    }

    if (methBiosample?.biosampleId) {
      const methResp = await zeroDashSdk.methylation.getMethylationData(
        methBiosample.biosampleId,
      );
      setMethData(methResp.map((m) => ({
        ...m,
        methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
        groupName: m.groupName ? m.groupName.replace(/([Mm]ethylation class )/, '') : '-',
      })));

      const predResp = await zeroDashSdk.methylation.getMethylationPrediction(
        methBiosample.biosampleId,
      );
      setPredData({
        ...predResp,
        status: predResp.status ?? '-',
        methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
      });

      const methGeneResp = await zeroDashSdk.methylation.getMethylationGeneData(
        methBiosample.biosampleId,
      );

      processMethGeneResp(methGeneResp)
        .then((genePlotMap) => {
          setMethGeneData(
            methGeneResp.map((m) => ({
              ...m,
              biosampleId: methBiosample.biosampleId,
              methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
              status: m.status === null ? 'unknown' : m.status,
              methSampleId: methBiosample.biosampleId,
              genePlot: genePlotMap[m.gene],
            })),
          );
        })
        .catch(() => {
          enqueueSnackbar('There was an issue fetching the new data.', { variant: 'error' });
        });

      if (analysisSet.zero2Category === 'CNS') {
        const cohortResp = await zeroDashSdk.methylation.getMGMTCohort(
          methBiosample.biosampleId,
        );
        setCohortData(cohortResp);
        const counts = await zeroDashSdk.methylation.countMethMGMT(
          methBiosample.biosampleId,
        );
        setMethMGMTCount(counts);
      }
    }
  }, [
    methBiosample?.biosampleId,
    enqueueSnackbar,
    zeroDashSdk.methylation,
    zeroDashSdk.plots,
    methBiosample?.aliases,
    primaryBiosample?.biosampleId,
    analysisSet.zero2Category,
  ]);

  useEffect(() => {
    getAllMethData();
  }, [getAllMethData]);

  useEffect(() => {
    getClassifierTableData();
  }, [getClassifierTableData]);

  const updateMethData = (result: IMethylationData): void => {
    setMethData((prev) => (
      prev.map((p) => (
        p.groupId === result.groupId
          ? result
          : p
      ))
    ));
  };

  return (
    <div>
      <ScrollableSection className={classes.wrapper}>
        {allClassifierData.length > 0 && (
          <>
            <RNAClassifiers
              allClassifierData={allClassifierData}
              refreshClassifierData={getClassifierTableData}
              joined
            />
            <Divider
              variant="middle"
              style={{
                marginTop: '24px',
                marginBottom: '24px',
              }}
            />
          </>
        )}
        <ScrollableSection className={classes.sectionWrapper}>
          { methData.map((m) => (
            <MethylationPanel
              data={m}
              setData={updateMethData}
            />
          ))}
        </ScrollableSection>
        <Divider variant="middle" style={{ marginTop: '24px' }} />
        <GraphPanel data={profiles} />
        <Divider variant="middle" />
        {cohortData && methBiosample?.biosampleId && methMGMTCount.methylatedCount > 0 && (
          <MGMTCohort
            data={cohortData}
            biosampleId={methBiosample?.biosampleId}
            methMGMTCount={methMGMTCount}
          />
        )}
        {predData && (
          <ScrollableSection className={classes.sectionWrapper}>
            <MethylationPredictionPanel
              data={predData}
              setData={setPredData}
            />
          </ScrollableSection>
        )}
        <Divider variant="middle" style={{ marginBottom: '24px' }} />
        <ScrollableSection className={classes.sectionWrapper}>
          { methGeneData.map((m) => (
            <MethylationGenePanel
              data={m}
              setData={setMethGeneData}
            />
          ))}
        </ScrollableSection>
      </ScrollableSection>
      <AddClassifierResult
        getMethData={getAllMethData}
      />
    </div>
  );
}
