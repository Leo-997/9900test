import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IPathwaySearchOptions } from '../../types/Search.types';
import PathwaysListItem, { IPathway } from '../Pathways/PathwaysListItem';
import PathwaysSearchFilterBar from '../Pathways/PathwaysSearchFilterBar';
import TabContentWrapper from './TabContentWrapper';

const emptyOptions: IPathwaySearchOptions = {
  search: '',
};

export default function PathwaysTabContent(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    rnaBiosample,
  } = useAnalysisSet();

  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [toggled, setToggled] = useState<IPathwaySearchOptions | undefined>(emptyOptions);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPathways = useCallback(async (page: number, limit: number) => {
    if (rnaBiosample?.biosampleId) {
      setLoading(true);
      const pathwayData = await zeroDashSdk.pathways.getAllPathways(
        rnaBiosample.biosampleId,
        toggled?.search,
        page,
        limit,
      );
      setLoading(false);
      return pathwayData;
    }
    return [];
  }, [rnaBiosample?.biosampleId, toggled?.search, zeroDashSdk]);

  useEffect(() => {
    async function getCounts(): Promise<void> {
      if (rnaBiosample?.biosampleId) {
        const pathwayCount = await zeroDashSdk.pathways.getAllPathwaysCount(
          rnaBiosample.biosampleId,
          toggled?.search,
        );
        setTotalCount(pathwayCount);
      }
    }
    getCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggled?.search]);

  const mapping = (pathway: IPathway, key: number): ReactNode => (
    <PathwaysListItem pathway={pathway} key={key} />
  );

  return (
    <div>
      <PathwaysSearchFilterBar
        toggled={toggled || emptyOptions}
        setToggled={setToggled}
        emptyOptions={emptyOptions}
        counts={{ current: count, total: totalCount }}
        loading={loading}
        disabled={!rnaBiosample}
      />
      <TabContentWrapper
        fetch={fetchPathways}
        updateCount={setCount}
        mapping={mapping}
      />
    </div>
  );
}
