import { Dispatch, SetStateAction, useMemo, useState, type JSX } from 'react';
import {
  Box,
} from '@mui/material';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { makeStyles } from '@mui/styles';
import { PlusIcon } from 'lucide-react';
import CustomButton from '../../Common/Button';
import SearchBar from '../../Search/SearchBar';
import CustomTypography from '../../Common/Typography';
import { EvidenceType, IEvidenceLinkFilters, IEvidenceQuery } from '../../../types/Evidence/Evidences.types';
import FilterButton from '../../SearchFilterBar/Buttons/FilterButton';
import SortButton from '../../SearchFilterBar/Buttons/SortButton';
import EvidenceFilterOptions from './EvidenceFilterOptions';
import { evidenceSortMenuOptions } from '../../../constants/evidences';
import CreateNewEvidenceModal from '../Modals/CreateNewEvidenceModal';

const useStyles = makeStyles(() => ({
  searchInput: {
    display: 'flex',
    height: 48,
    flex: 1,
    borderRadius: 4,
    paddingLeft: 20,
    marginRight: 24,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& p': {
      color: '#273957',
    },
  },
  header: {
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 1.5,
  },
}));

interface IProps {
  searchPlaceholder?: string;
  evidenceFilters: IEvidenceQuery;
  setEvidenceFilters: Dispatch<SetStateAction<IEvidenceQuery>>;
  evidenceLinkFilters?: IEvidenceLinkFilters;
  setEvidenceLinkFilters?: Dispatch<SetStateAction<IEvidenceLinkFilters>>;
  emptyFilters: IEvidenceLinkFilters;
  counts: { current: number, total: number };
  className?: string;
  displayDiagnosisFilters?: boolean;
}

export default function EvidenceSearchFilter({
  searchPlaceholder,
  evidenceFilters,
  setEvidenceFilters,
  evidenceLinkFilters,
  setEvidenceLinkFilters,
  emptyFilters,
  counts,
  className,
  displayDiagnosisFilters = true, // prop for only displaying evidenceFilters on FilterButton menu
}: IProps): JSX.Element {
  const classes = useStyles();

  const [newEvidenceModalOpen, setNewEvidenceModalOpen] = useState<boolean>(false);

  const canCreateEvidence = useIsUserAuthorised('curation.evidence.write');

  const handleFilterChange = (
    filters: IEvidenceLinkFilters,
  ): void => {
    const newFilters = { ...filters };

    let type: EvidenceType;
    if (
      // only one is set
      (newFilters.hideCitations && !newFilters.hideResources)
      || (!newFilters.hideCitations && newFilters.hideResources)
    ) {
      type = newFilters.hideCitations
        ? 'RESOURCE'
        : 'CITATION';
    }
    setEvidenceFilters((prev) => ({
      ...prev,
      type: type || undefined,
      title: newFilters.title,
      author: newFilters.author,
      year: newFilters.year,
      publication: newFilters.publication,
    }));

    delete newFilters.hideCitations;
    delete newFilters.hideResources;
    delete newFilters.title;
    delete newFilters.author;
    delete newFilters.year;
    delete newFilters.publication;

    if (setEvidenceLinkFilters) {
      setEvidenceLinkFilters(newFilters);
    }
  };

  const toggled = useMemo(() => ({
    ...evidenceLinkFilters,
    hideCitations: evidenceFilters.type === 'RESOURCE',
    hideResources: evidenceFilters.type === 'CITATION',
    title: evidenceFilters.title || [],
    author: evidenceFilters.author || [],
    year: evidenceFilters.year || null,
    publication: evidenceFilters.publication || [],
  }), [
    evidenceFilters.author,
    evidenceFilters.publication,
    evidenceFilters.title,
    evidenceFilters.type,
    evidenceFilters.year,
    evidenceLinkFilters,
  ]);

  return (
    <Box display="flex" flexDirection="column" className={className}>
      <CustomTypography variant="label" className={classes.header}>
        {searchPlaceholder}
      </CustomTypography>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        style={{ width: '100%', marginBottom: 16 }}
      >
        <SearchBar
          searchMethod={
            (query: string): void => (
              setEvidenceFilters((prev) => ({ ...prev, searchQuery: query }))
            )
          }
          className={classes.searchInput}
          placeholder={searchPlaceholder}
          value={evidenceFilters.searchQuery}
        />
        <CustomButton
          variant="outline"
          startIcon={<PlusIcon />}
          label="Add new evidence"
          onClick={(): void => setNewEvidenceModalOpen(true)}
          disabled={!canCreateEvidence}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingBottom="16px"
      >
        <Box display="flex">
          {evidenceLinkFilters && setEvidenceLinkFilters && (
            <FilterButton
              toggled={toggled}
              setToggled={handleFilterChange}
              clearFilters={(): void => handleFilterChange(emptyFilters)}
              filterOptions={
                EvidenceFilterOptions({
                  toggled,
                  setToggled: setEvidenceLinkFilters,
                  setEvidenceFilters,
                  displayDiagnosisFilters,
                })
              }
              isCompressed
            />
          )}
          <SortButton
            toggled={evidenceFilters}
            setToggled={setEvidenceFilters}
            sortOptions={evidenceSortMenuOptions}
            isCompressed
          />
        </Box>
        <Box display="flex" flexDirection="row" alignItems="center">
          <CustomTypography variant="label">
            {counts.current}
            {' of '}
            {counts.total}
            {' Citations and Resources'}
          </CustomTypography>
        </Box>
      </Box>
      {newEvidenceModalOpen && (
        <CreateNewEvidenceModal
          open={newEvidenceModalOpen}
          onClose={(): void => setNewEvidenceModalOpen(false)}
          hideEvidenceLevel
          hideClinicalSummary
          onSubmit={(): void => handleFilterChange(emptyFilters)}
        />
      )}
    </Box>
  );
}
