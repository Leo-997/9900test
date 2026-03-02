import {
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useMemo, type JSX } from 'react';
import { IRNAClassifierTable } from '../../types/RNAseq.types';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import RNAClassifierCard from './RNAClassifierCard';

const useStyles = makeStyles(() => ({
  container: {
    height: 'auto',
  },
  classifiers: {
    width: '100%',
  },
  plotsPanel: {
    gap: '20px',
  },
  plots: {
    minWidth: '350px',
  },
  listWrapper: {
    maxHeight: 'calc(100vh - 210px)',
    width: '100%',
  },
  scrollBar: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .simplebar-scrollbar': {
      top: 53,
    },
  },
}));

interface IRNAClassifiersProps {
  allClassifierData: IRNAClassifierTable[];
  refreshClassifierData: () => void;
  joined?: boolean;
}

export default function RNAClassifiers({
  allClassifierData,
  refreshClassifierData,
  joined,
}: IRNAClassifiersProps): JSX.Element {
  const classes = useStyles({ joined });

  const sortClassifiers = (
    a: IRNAClassifierTable,
    b: IRNAClassifierTable,
  ): number => {
    if (a.selectedPrediction === b.selectedPrediction) {
      return b.score - a.score;
    }
    return Number(b.selectedPrediction) - Number(a.selectedPrediction);
  };

  const allsortsData = useMemo(
    () => allClassifierData
      .filter((item) => item.classifier === 'ALLSorts')
      .toSorted(sortClassifiers),
    [allClassifierData],
  );
  const tallsortsData = useMemo(
    () => allClassifierData
      .filter((item) => item.classifier === 'TALLSorts')
      .toSorted(sortClassifiers),
    [allClassifierData],
  );

  const reviewedSubtypeData = useMemo(
    () => allClassifierData
      .filter((item) => item.classifier === 'TALL subtype classification')
      .toSorted(sortClassifiers),
    [allClassifierData],
  );
  const reviewedGeneticSubtypeData = useMemo(
    () => allClassifierData
      .filter((item) => item.classifier === 'TALL genetic subtype classification')
      .toSorted(sortClassifiers),
    [allClassifierData],
  );
  const riskGroupData = useMemo(
    () => allClassifierData
      .filter((item) => item.classifier === 'TALL risk group classification')
      .toSorted(sortClassifiers),
    [allClassifierData],
  );

  return (
    <ScrollableSection
      className={classes.listWrapper}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="flex-start"
        className={classes.container}
      >

        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="flex-start"
          className={classes.classifiers}
          paddingTop="6px"
          gap="8px"
        >
          { allsortsData.length > 0 && (
            <RNAClassifierCard
              data={allsortsData}
              onRefreshRequired={refreshClassifierData}
            />
          )}
          { tallsortsData.length > 0 && (
            <RNAClassifierCard
              data={tallsortsData}
              onRefreshRequired={refreshClassifierData}
            />
          )}
          { reviewedSubtypeData.length > 0 && (
          <RNAClassifierCard
            data={reviewedSubtypeData}
            onRefreshRequired={refreshClassifierData}
          />
          )}
          { reviewedGeneticSubtypeData.length > 0 && (
            <RNAClassifierCard
              data={reviewedGeneticSubtypeData}
              onRefreshRequired={refreshClassifierData}
            />
          )}
          { riskGroupData.length > 0 && (
            <RNAClassifierCard
              data={riskGroupData}
              onRefreshRequired={refreshClassifierData}
            />
          )}
        </Box>
      </Box>
    </ScrollableSection>
  );
}
