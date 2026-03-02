import { ReactNode, useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import EvidenceSearchFilter from '../SearchFilter/EvidenceSearchFilter';
import EvidenceListItem from '../EvidenceList/ListItems/EvidenceListItem';
import useEvidences from '../../../api/useEvidences';
import {
  Evidence, IEvidenceLinkFilters, IEvidenceQuery,
} from '../../../types/Evidence/Evidences.types';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';

const useStyles = makeStyles(() => ({
  tabContentWrapper: {
    height: '100%',
    overflowX: 'hidden',
    padding: '0px 16px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .simplebar-scrollbar': {
      top: 0,
    },
  },
}));

interface IClasses {
  tabContentWrapper?: string;
  searchFilter?: string;
}

interface IProps {
  handlePickEvidence: (evidence: Evidence) => void;
  // This function needs to be a useCallback otherwise you get double loading
  getEvidenceLinks?: (filters?: IEvidenceLinkFilters) => Promise<Evidence[]>;
  initialFilters?: IEvidenceQuery;
  contentBeforeSearch?: ReactNode;
  contentAfterSearch?: ReactNode;
  selectedEvidenceIds?: string[];
  canSelectEvidence?: boolean;
  allowDeselecting?: boolean;
  classNames?: IClasses;
  displayDiagnosisFilters?: boolean;
  isEvidenceSeleted?: (evidence: Evidence) => boolean;
}

export default function EvidenceArchive({
  handlePickEvidence,
  getEvidenceLinks,
  initialFilters,
  contentBeforeSearch,
  contentAfterSearch,
  selectedEvidenceIds,
  canSelectEvidence = false,
  allowDeselecting = false,
  classNames,
  displayDiagnosisFilters = true, // prop for only displaying evidenceFilters on FilterButton menu
  isEvidenceSeleted,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { getAllEvidence } = useEvidences();

  const emptyEvidenceFilters = useMemo<IEvidenceQuery>(() => ({
    title: [],
    author: [],
    year: null,
    publication: [],
  }), []);
  const emptyLinkFilters = useMemo<IEvidenceLinkFilters>(() => ({
    zero2Category: [],
    zero2FinalDiagnosis: [],
    zero2Subcat1: [],
    zero2Subcat2: [],
  }), []);

  // Filters that apply to the evidence MS
  const [evidenceFilters, setEvidenceFilters] = useState<IEvidenceQuery>({
    ...emptyEvidenceFilters,
    ...initialFilters,
  });
  // Filters that apply to zerodash-api's evidence
  const [
    evidenceLinkFilters,
    setEvidenceLinkFilters,
  ] = useState<IEvidenceLinkFilters>(emptyLinkFilters);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetch = useCallback(async (page: number, limit: number): Promise<Evidence[]> => {
    let matchesEvidenceLinks: Evidence[] | null = null;
    // if there are filters set we need to find the evidence that matches the filters only
    // otherwise get everything.
    if (
      JSON.stringify(evidenceLinkFilters) !== JSON.stringify(emptyLinkFilters)
      && getEvidenceLinks
    ) {
      matchesEvidenceLinks = await getEvidenceLinks(evidenceLinkFilters);
    }
    if (matchesEvidenceLinks && matchesEvidenceLinks.length === 0) {
      return [];
    }
    const { allEvidence } = await getAllEvidence({
      evidenceDetailsFilters: {
        ...evidenceFilters,
        ids: matchesEvidenceLinks?.map((e) => e.evidenceId),
        page,
        limit,
      },
      searchQuery: evidenceFilters?.searchQuery,
    });
    return allEvidence;
  }, [emptyLinkFilters, evidenceFilters, evidenceLinkFilters, getAllEvidence, getEvidenceLinks]);

  useEffect(() => {
    const getTotalCount = async (): Promise<void> => {
      let matchesEvidenceLinks: Evidence[] | null = null;
      // if there are filters set we need to find the evidence that matches the filters only
      // otherwise get everything.
      if (
        JSON.stringify(evidenceLinkFilters) !== JSON.stringify(emptyLinkFilters)
        && getEvidenceLinks
      ) {
        matchesEvidenceLinks = await getEvidenceLinks(evidenceLinkFilters);
      }
      if (matchesEvidenceLinks && matchesEvidenceLinks.length === 0) {
        setTotalCount(0);
        return;
      }
      const count = await zeroDashSdk.services.evidence.getEvidenceCount({
        ...evidenceFilters,
        ids: matchesEvidenceLinks?.map((e) => e.evidenceId),
      });
      setTotalCount(count);
    };
    getTotalCount();
  }, [
    emptyLinkFilters,
    evidenceLinkFilters,
    evidenceFilters,
    getEvidenceLinks,
    zeroDashSdk.services.evidence,
  ]);

  const mapping = (item: Evidence): JSX.Element => (
    <EvidenceListItem
      key={item.id}
      evidence={item}
      onSelect={handlePickEvidence}
      isSelected={
        selectedEvidenceIds?.some((id) => id === item.evidenceId)
          || isEvidenceSeleted?.(item)
          || false
      }
      canSelect={canSelectEvidence}
      allowDeselecting={allowDeselecting}
    />
  );

  return (
    <TabContentWrapper
      beforeMappingContent={(
        <>
          {contentBeforeSearch}
          <EvidenceSearchFilter
            searchPlaceholder="Search (PubMed ID, PMCID, first author)"
            evidenceFilters={evidenceFilters}
            setEvidenceFilters={setEvidenceFilters}
            evidenceLinkFilters={getEvidenceLinks ? evidenceLinkFilters : undefined}
            setEvidenceLinkFilters={getEvidenceLinks ? setEvidenceLinkFilters : undefined}
            emptyFilters={emptyLinkFilters}
            counts={{ current: currentCount, total: totalCount }}
            className={classNames?.searchFilter}
            displayDiagnosisFilters={displayDiagnosisFilters}
          />
          {contentAfterSearch}
        </>
      )}
      fetch={fetch}
      mapping={mapping}
      className={clsx(classes.tabContentWrapper, classNames?.tabContentWrapper)}
      updateCount={(count): void => setCurrentCount(count)}
    />
  );
}
