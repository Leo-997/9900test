import { makeStyles } from '@mui/styles';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IArchiveSample, IArchiveSamplesQuery } from '../../../../../types/MTB/Archive.types';
import TabContentWrapper from '../../../../PreCurationTabs/TabContentWrapper';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import ArchiveSampleListItem from './ArchiveSampleListItem';
import { ArchiveSearchFilterBar } from './ArchiveSearchFilterBar';

const useStyles = makeStyles(() => ({
  contentWrapper: {
    minWidth: '600px',
    height: '100%',
  },
}));

export default function ArchiveLeftPanel(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const {
    selectedSample,
    setSelectedSample,
  } = useMTBArchive();

  const [filters, setFilters] = useState<IArchiveSamplesQuery>({});
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetch = useCallback(async (
    page: number,
  ) => {
    const resp = await zeroDashSdk.mtb.archive.getArchiveSamples(
      filters || {},
      page,
      20,
    );
    return resp;
  }, [zeroDashSdk.mtb.archive, filters]);

  const mapping = (sample: IArchiveSample): ReactNode => (
    <ArchiveSampleListItem
      key={sample.clinicalVersionId}
      sample={sample}
      isSelected={selectedSample?.clinicalVersionId === sample.clinicalVersionId}
      onSelect={(): void => setSelectedSample(sample)}
    />
  );

  useEffect(() => {
    zeroDashSdk.mtb.archive.getArchiveSamplesCount(filters || {})
      .then((resp) => setTotalCount(resp));
  }, [filters, zeroDashSdk.mtb.archive]);

  return (
    <ScrollableSection style={{ height: '100%' }}>
      <TabContentWrapper
        className={classes.contentWrapper}
        fetch={fetch}
        mapping={mapping}
        updateCount={(newCount): void => setCurrentCount(newCount)}
        beforeMappingContent={(
          <ArchiveSearchFilterBar
            filters={filters}
            setFilters={setFilters}
            counts={{ current: currentCount, total: totalCount }}
          />
        )}
      />
    </ScrollableSection>
  );
}
