import { Box } from '@mui/material';
import { useEffect, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IClinicalVersionRaw } from '../../../../../types/MTB/MTB.types';
import { IFetchRecommendation } from '../../../../../types/MTB/Recommendation.types';
import CustomDialog from '../../../../Common/CustomDialog';
import CustomTypography from '../../../../Common/Typography';
import { RichTextEditor } from '../../../../Input/RichTextEditor/RichTextEditor';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import { RecommendationCountChips } from '../Recommendations/Common/RecommendationCountChips';
import { RecommendationSection } from '../Recommendations/Common/RecommendationSection';

interface IProps {
  open: boolean;
  onClose: () => void;
  clinicalVersion: IClinicalVersionRaw;
}

export default function ArchiveDiscussionModal({
  open,
  onClose,
  clinicalVersion,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const [recommendations, setRecommendations] = useState<IFetchRecommendation[]>([]);

  useEffect(() => {
    zeroDashSdk.mtb.recommendation.getAllRecommendations(
      clinicalVersion.id,
      {
        types: ['GROUP'],
        entityType: 'SLIDE',
        entityId: 'DISCUSSION',
      },
    )
      .then((resp) => setRecommendations(resp));
  }, [clinicalVersion.id, zeroDashSdk.mtb.recommendation]);

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Discussion slide"
      content={(
        <ScrollableSection style={{ maxHeight: '100%' }}>
          <Box display="flex" flexDirection="column" gap="16px" paddingBottom="16px" width="100%">
            <CustomTypography variant="label">
              Discussion title
            </CustomTypography>
            <CustomTypography variant="h5">
              {clinicalVersion.discussionTitle}
            </CustomTypography>
            <RichTextEditor
              mode="readOnly"
              commentMode="readOnly"
              hideComments
              initialText={clinicalVersion.discussionNote}
              title={(
                <CustomTypography variant="label">
                  Discussion Note
                </CustomTypography>
              )}
            />
            <CustomTypography variant="label">
              Recommendations
            </CustomTypography>
            {recommendations.map((rec) => (
              <RecommendationSection
                key={rec.id}
                recommendation={rec}
                isArchive
                chips={<RecommendationCountChips recs={[rec]} />}
              />
            ))}
          </Box>
        </ScrollableSection>
      )}
    />
  );
}
