import { Box } from '@mui/material';
import { styled } from '@mui/styles';
import { useRecommendationCountingChipHelpers } from '@/hooks/useRecommendationHelpers';
import { useMemo, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import { useGroupRecommendation } from '../../../../../../contexts/GroupRecommendationContext';
import CustomTypography from '../../../../../Common/Typography';
import { RichTextEditor } from '../../../../../Input/RichTextEditor/RichTextEditor';
import { ScrollableSection } from '../../../../../ScrollableSection/ScrollableSection';
import AddRecommendationButton from '../Common/AddRecommendationButton';
import OptionCountingTable from './OptionCountingTable';
import TargetSection from '../Common/TargetSection';
import { RecommendationCountChips } from '../Common/RecommendationCountChips';

const EditorWrapper = styled('span')({
  width: '100%',
  '& .editorArea': {
    maxHeight: '500px',
    minHeight: '152px',
    backgroundColor: corePalette.white,
  },
});

export default function RecommendationLeftPanel(): JSX.Element {
  const { countRecommendationsAndOptions } = useRecommendationCountingChipHelpers();
  const {
    entity,
    description,
    setDescription,
    selectedTargets,
    setSelectedTargets,
    allTargets,
    setNewReportRecs,
    reportMolAlterations,
    newReportRecs,
    reportRecs,
    selectedSlideRecs,
  } = useGroupRecommendation();

  const count = useMemo(
    () => countRecommendationsAndOptions(
      [...newReportRecs, ...reportRecs, ...selectedSlideRecs],
    ),
    [countRecommendationsAndOptions, newReportRecs, reportRecs, selectedSlideRecs],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="50%"
      height="100%"
      padding="24px"
    >
      <ScrollableSection style={{ maxHeight: 'calc(100vh - 280px)', padding: '0 16px' }}>
        <Box display="flex" flexDirection="column" gap="24px">
          {allTargets.length > 0 && (
            <TargetSection
              allTargets={allTargets}
              selectedTargets={selectedTargets}
              setSelectedTargets={setSelectedTargets}
              subtitle="Select therapy recommendations to see their targets here."
            />
          )}
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <EditorWrapper>
              <RichTextEditor
                key={JSON.stringify([...newReportRecs, ...reportRecs, ...selectedSlideRecs])}
                title={(
                  <CustomTypography variant="titleRegular" fontWeight="medium">
                    Description
                  </CustomTypography>
                )}
                initialText={description}
                mode="autoSave"
                commentMode="readOnly"
                hideComments
                onSave={(newText): void => setDescription(newText)}
                classNames={{ editor: 'editorArea' }}
              />
            </EditorWrapper>
          </Box>
          {entity.entityType === 'REPORT' && (
            <Box padding="4px">
              <AddRecommendationButton
                onSubmitRecommendation={(newRec): void => {
                  setNewReportRecs((prev) => [newRec, ...prev]);
                }}
                alterations={entity.entityId === 'PRECLINICAL_REPORT' ? [] : reportMolAlterations}
                recommendationTypes={['THERAPY', 'CHANGE_DIAGNOSIS', 'GERMLINE', 'TEXT']}
                label="Add Options"
              />
            </Box>
          )}
          <Box
            display="flex"
            flexDirection="column"
            gap="4px"
          >
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingRight="12px"
            >
              <CustomTypography variant="titleRegular" fontWeight="medium">
                Recommendation count
              </CustomTypography>
              <RecommendationCountChips
                recs={[...selectedSlideRecs, ...reportRecs, ...newReportRecs]}
                hideOptionChips
              />
            </Box>
            <OptionCountingTable
              count={[
                count.type1Count,
                count.type2Count,
                count.type3Count,
                count.type4Count,
              ]}
            />
          </Box>
        </Box>
      </ScrollableSection>
    </Box>
  );
}
