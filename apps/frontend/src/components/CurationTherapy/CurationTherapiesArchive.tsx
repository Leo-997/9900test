import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { CurationTherapyEntityTypes, ICurationTherapy, ITherapiesQuery } from '@/types/Therapies/CurationTherapies.types';
import { Grid, styled } from '@mui/material';
import { ChevronDownIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useState, type JSX } from 'react';
import CustomTypography from '../Common/Typography';
import TabContentWrapper from '../PreCurationTabs/TabContentWrapper';
import TherapySearchFilter from './SearchFilter/TherapySearchFilter';
import TherapyListItem from './TherapyListItem';

const StyledTabContentWrapper = styled(TabContentWrapper<ICurationTherapy>)({
  height: '100%',
  overflowX: 'hidden',
  padding: '0px 16px',
  '& .simplebar-scrollbar': {
    top: 0,
  },
});

const StickyHeader = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: theme.colours.core.grey30,
  zIndex: 1,
  width: '100%',
  padding: '8px 16px',
}));

const StickyHeaderAccordion = styled(StickyHeader)({
  '&:hover': {
    cursor: 'pointer',
  },
});

interface IProps {
  entityId: string | number;
  entityType: CurationTherapyEntityTypes;
  isUserAuthorised: boolean;
  initialFilters?: ITherapiesQuery;
  onChange?: (linkedTherapies: ICurationTherapy[]) => void;
}

export default function CurationTherapiesArchive({
  entityId,
  entityType,
  isUserAuthorised,
  initialFilters,
  onChange,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const [prevAddedTherapies, setPrevAddedTherapies] = useState<ICurationTherapy[]>([]);
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showAllTherapies, setShowAllTherapies] = useState<boolean>(true);
  const [therapyFilters, setTherapyFilters] = useState<ITherapiesQuery>(initialFilters || {});

  const fetch = useCallback(async (page: number, limit: number): Promise<ICurationTherapy[]> => {
    if (!showAllTherapies) return [];

    const resp = await zeroDashSdk.curationTherapies.getTherapies(
      {
        ...therapyFilters,
        drugClassIds: therapyFilters.drugClassIds?.map((d) => d.split('::')[1]),
        clinicalDrugIds: therapyFilters.clinicalDrugIds?.map((c) => c.split('::')[1]),
      },
      page,
      limit,
    );
    return resp;
  }, [showAllTherapies, therapyFilters, zeroDashSdk.curationTherapies]);

  // Will equal to true if therapy is linked to TherapyListItem
  const isSelected = (
    t: ICurationTherapy,
  ): boolean => prevAddedTherapies.some((i) => i.id === t.id);

  const handleSelectTherapy = async (therapy: ICurationTherapy): Promise<void> => {
    if (isSelected(therapy)) {
      // delete entity's link to therapy
      await zeroDashSdk.curationTherapies.unlinkTherapy({
        therapyId: therapy.id,
        entityType,
        entityId,
      });

      setPrevAddedTherapies((prev) => [...prev.filter((p) => p.id !== therapy.id)]);
      setTherapyFilters(initialFilters || {});
    } else {
      // link entity to therapy
      await zeroDashSdk.curationTherapies.linkTherapy({
        therapyId: therapy.id,
        entityType,
        entityId,
      });

      setPrevAddedTherapies((prev) => [...prev, therapy]);
    }
  };

  useEffect(() => {
    const getCommentTherapies = async (): Promise<void> => {
      try {
        const therapies = await zeroDashSdk.curationTherapies.getTherapies({
          entityId,
          entityType,
        });
        setPrevAddedTherapies(therapies);
      } catch {
        enqueueSnackbar('Could not fetch therapies, please try again', { variant: 'error' });
      }
    };
    getCommentTherapies();
  }, [entityId, entityType, zeroDashSdk.curationTherapies]);

  const getCount = useCallback(() => {
    zeroDashSdk.curationTherapies.getTherapiesCount({
      ...therapyFilters,
      drugClassIds: therapyFilters.drugClassIds?.map((d) => d.split('::')[1]),
      clinicalDrugIds: therapyFilters.clinicalDrugIds?.map((c) => c.split('::')[1]),
    })
      .then((resp) => setTotalCount(resp));
  }, [
    zeroDashSdk.curationTherapies,
    therapyFilters,
  ]);

  useEffect(() => {
    getCount();
  }, [getCount]);

  const mapping = (item: ICurationTherapy): JSX.Element => (
    <TherapyListItem
      key={item.id}
      therapy={item}
      isSelected={isSelected(item)}
      onSelect={handleSelectTherapy}
      canSelectTherapy={isUserAuthorised}
    />
  );

  // function prop drilled to LinkedTherapyModal
  // updates prevAddedTherapies and empties filters
  const handleModalSave = (newTherapy: ICurationTherapy): void => {
    setPrevAddedTherapies((prev) => [
      ...prev,
      newTherapy,
    ]);
    setTherapyFilters(initialFilters || {});
  };

  useEffect(() => {
    if (onChange) {
      onChange(prevAddedTherapies);
    }
  }, [onChange, prevAddedTherapies]);

  return (
    <StyledTabContentWrapper
      fetch={fetch}
      mapping={mapping}
      updateCount={(c): void => setCount(c)}
      customEmptyContent={showAllTherapies ? undefined : ' '}
      beforeMappingContent={(
        <>
          <TherapySearchFilter
            filters={therapyFilters}
            setFilters={setTherapyFilters}
            entityId={entityId}
            entityType={entityType}
            searchPlaceholder="Search (drug class, clinical drug)"
            counts={{ current: count, total: totalCount }}
            onSubmit={handleModalSave}
            canAddTherapy={isUserAuthorised}
          />
          <>
            <StickyHeader>
              <CustomTypography
                variant="label"
              >
                Therapies added to this comment
              </CustomTypography>
            </StickyHeader>
            {prevAddedTherapies?.map(mapping)}
            <StickyHeaderAccordion
              container
              direction="row"
              justifyContent="space-between"
              onClick={(): void => setShowAllTherapies((prev) => !prev)}
            >
              <Grid>
                <CustomTypography
                  variant="label"
                >
                  All therapies
                </CustomTypography>
              </Grid>
              <Grid style={{ display: 'flex', alignItems: 'center' }}>
                <CustomTypography
                  variant="bodySmall"
                  fontWeight="bold"
                >
                  {showAllTherapies ? 'Hide' : 'Show'}
                </CustomTypography>
                <ChevronDownIcon
                  style={{
                    transform: showAllTherapies ? 'rotate(180deg)' : undefined,
                    transition: 'all 0.5s cubic-bezier(.19, 1, .22, 1)',
                  }}
                />
              </Grid>
            </StickyHeaderAccordion>
          </>
        </>
        )}
    />
  );
}
