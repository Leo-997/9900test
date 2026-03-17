import { Box, Divider, styled } from '@mui/material';
import { IQuickFilter } from '@/types/Common.types';
import { CurationThreadTypes, ICurationCommentsQuery } from '@/types/Comments/CurationComments.types';
import { Dispatch, SetStateAction, useMemo, type JSX } from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { germlineCommentTags, molecularCommentTags } from '@/constants/Curation/comments';
import CustomTypography from '@/components/Common/Typography';
import QuickFilterButton from './QuickFilterButton';
import QuickFilters from './QuickFilters';

const StyledDivider = styled(Divider)({
  margin: '0px 8px',
  alignSelf: 'stretch',
  height: 'auto',
});

interface IProps<T extends ICurationCommentsQuery> {
  includeTagFilters?: boolean;
  toggled: T;
  setToggled: Dispatch<SetStateAction<T>>;
  type?: CurationThreadTypes;
  defaultFilters: T;
}

export default function CommentsQuickFilters<T extends ICurationCommentsQuery>({
  includeTagFilters,
  toggled,
  setToggled,
  type,
  defaultFilters,
}: IProps<T>): JSX.Element {
  const {
    analysisSet,
  } = useAnalysisSet();

  const aSetHasZero2FDiagnosis = Boolean(analysisSet.zero2FinalDiagnosis);

  const tagFilters = useMemo(() => {
    // Set tags accordingly depending on comment type
    const molecularFilters = ['GENE', 'ALTERATION', 'PREVALENCE', 'THERAPEUTIC'];
    const commentTags = type === 'MOLECULAR'
      ? molecularCommentTags
        .filter((tag) => molecularFilters.includes(tag.value))
        .sort((a, b) => molecularFilters.indexOf(a.value) - molecularFilters.indexOf(b.value))
      : germlineCommentTags;

    // Create a quick filter object for each tag
    const isFilterActive = (
      prevFilter: T,
      tagValue: string,
    ): boolean => prevFilter.type?.length === 1 && prevFilter.type.every((t) => t === tagValue);
    const quickFilters: IQuickFilter<T>[] = commentTags.map((tag) => ({
      label: tag.name.split(' ')[0],
      onClick: () => setToggled((prev) => ({
        ...prev,
        type: isFilterActive(prev, tag.value) ? defaultFilters.type : [tag.value],
      })),
      checkIsActive: (newFilters) => isFilterActive(newFilters, tag.value),
    }));

    // Only for MOLECULAR comments, add "Other" quick filter
    const isOtherFilterActive = (
      prevFilter: T,
    ): boolean => prevFilter.type?.length === 5
      && prevFilter.type.includes('FINAL')
      && prevFilter.type.includes('DIAGNOSTIC')
      && prevFilter.type.includes('PROGNOSTIC')
      && prevFilter.type.includes('GERMLINE_GENE')
      && prevFilter.type.includes('VARIANT_INTERPRETATION');
    if (type === 'MOLECULAR') {
      quickFilters.push({
        label: 'Other',
        onClick: () => setToggled((prev) => ({
          ...prev,
          type: isOtherFilterActive(prev)
            ? defaultFilters.type
            : molecularCommentTags
              .filter((tag) => !molecularFilters.includes(tag.value))
              .map((tag) => tag.value),
        })),
        checkIsActive: isOtherFilterActive,
      });
    }

    return quickFilters;
  }, [setToggled, type, defaultFilters.type]);

  const isFinalFilterActive = (
    prevFilter: T,
  ): boolean => prevFilter.zero2FinalDiagnosis?.length === 1
    && prevFilter.zero2FinalDiagnosis[0] === analysisSet.zero2FinalDiagnosis;

  return (
    <>
      <StyledDivider orientation="vertical" />
      {includeTagFilters && (
        <>
          <QuickFilters
            label="Quick tag filters"
            labelSx={{ minWidth: '105px' }}
            quickFilters={tagFilters}
            toggled={toggled}
          />
          <StyledDivider orientation="vertical" />
        </>
      )}
      <Box
        height="36px"
        {...(!includeTagFilters && {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 8px 0px 12px',
        })}
      >
        {!includeTagFilters && (
        <CustomTypography
          variant="bodySmall"
          sx={{
            minWidth: '80px',
          }}
        >
          Quick filters
        </CustomTypography>
        )}

        <QuickFilterButton
          toggled={toggled}
          data={{
            label: 'Final diagnosis',
            tooltip: !aSetHasZero2FDiagnosis ? 'This case has no Final Diagnosis yet.' : '',
            disabled: !aSetHasZero2FDiagnosis,
            onClick: () => setToggled((prev) => ({
              ...prev,
              zero2FinalDiagnosis: isFinalFilterActive(prev)
                ? undefined
                : [analysisSet.zero2FinalDiagnosis],
            })),
            checkIsActive: isFinalFilterActive,
          }}
        />
      </Box>
    </>
  );
}
