/* eslint-disable react/prop-types */
import { useClinical } from '@/contexts/ClinicalContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { Box } from '@mui/material';
import { ReactNode, useMemo, useState, type JSX } from 'react';
import { useUser } from '@/contexts/UserContext';
import { ITherapy } from '@/types/Therapies/ClinicalTherapies.types';
import { IFetchRecommendation } from '../../../../../../types/MTB/Recommendation.types';
import CustomTypography from '../../../../../Common/Typography';
import { RichTextEditor } from '../../../../../Input/RichTextEditor/RichTextEditor';
import DrugValidationChipButton from '../../Modals/Components/DrugValidation/DrugValidationChipButton';
import AwaitingValidationDrugsModal from '../../Modals/Components/DrugValidation/AwaitingValidationDrugsModal';

interface IProps {
  recommendation: IFetchRecommendation;
  actions?: ReactNode;
  isPresentationMode?: boolean;
  isArchive?: boolean;
  isGeneratingReport?: boolean;
  isReport?: boolean;
  isChildRec?: boolean;
  chips?: React.ReactNode;
  onDrugValidationModalClose?: () => void;
}

export function RecommendationSection({
  recommendation,
  actions,
  isPresentationMode = false,
  isArchive = false,
  isGeneratingReport = false,
  isReport = false,
  isChildRec = false,
  chips,
  onDrugValidationModalClose,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { currentUser } = useUser();

  const canValidateDrugs = useIsUserAuthorised('clinical.drug.validation.write');

  const [awaitingApprovalOpen, setAwaitingApprovalOpen] = useState<boolean>(false);

  const unvalidatedDrugs = useMemo(() => {
    let therapies: ITherapy[];
    switch (recommendation.type) {
      case 'THERAPY':
        therapies = recommendation.therapy ? [recommendation.therapy] : [];
        break;
      case 'GROUP':
        therapies = recommendation.recommendations
          ?.map((r) => r.therapy)
          .filter((t) => !!t) ?? [];
        break;
      default:
        therapies = [];
    }
    const drugs = therapies
      .flatMap((therapy) => therapy.drugs)
      .map(((therapyDrug) => therapyDrug.externalDrug))
      .filter((drug) => !!drug)
      .filter((drug) => !drug.isValidated);
    const uniqueDrugs = [
      ...new Map(drugs.map((drug) => [drug.versionId, drug])).values(),
    ];
    return uniqueDrugs;
  }, [recommendation.recommendations, recommendation.therapy, recommendation.type]);

  const canAddComments = useIsUserAuthorised('common.sample.suggestion.write');

  const handleSave = async (newText: string): Promise<void> => {
    await zeroDashSdk.mtb.recommendation.updateRecommendation(
      clinicalVersion.id,
      recommendation.id,
      { description: newText },
    );
  };

  const getPadding = (): string => {
    if (isGeneratingReport) return '0';
    return isReport ? '8px' : '16px';
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap="4px"
        justifyContent="space-between"
        bgcolor={
          !isGeneratingReport && !isPresentationMode && !isArchive
            ? corePalette.grey10
            : corePalette.white
        }
        padding={getPadding()}
        sx={!isGeneratingReport ? {
          borderRadius: '8px',
          border: `1px solid ${corePalette.grey30}`,
        } : undefined}
      >
        <Box
          display="flex"
          flexDirection="column"
          gap="8px"
        >
          <Box
            display="flex"
            flexDirection="column"
            gap="4px"
          >
            {!(currentUser?.groups ?? []).some((g) => g.name === 'MTBChairs')
              && !isPresentationMode
              && !isGeneratingReport
              && chips}
            <CustomTypography
              variant={isReport ? 'bodySmall' : 'titleRegular'}
              fontWeight={isReport ? 'bold' : 'medium'}
              color={isReport ? `${corePalette.offBlack100} !important` : undefined}
            >
              {recommendation.title}
            </CustomTypography>
          </Box>
          {/* Recommendation description */}
          <CustomTypography
            sx={isReport
              ? {
                fontSize: '13px !important',
                lineHeight: '16px !important',
                '& *': {
                  fontSize: '13px !important',
                  lineHeight: '16px !important',
                },
                '& .typography-bodyDefault': {
                  color: `${corePalette.offBlack100} !important`,
                },
              }
              : undefined}
          >
            <RichTextEditor
              key={recommendation?.description}
              initialText={recommendation?.description}
              mode="readOnly"
              commentMode={canAddComments ? 'edit' : 'readOnly'}
              hideComments={isPresentationMode || isArchive || isGeneratingReport || isChildRec}
              condensed
              hideEvidence={isPresentationMode}
              hideEmptyEditor={isPresentationMode}
              onSave={(newText): Promise<void> => handleSave(newText)}
            />
          </CustomTypography>
          {!isGeneratingReport && !isPresentationMode && unvalidatedDrugs.length > 0 && (
            <DrugValidationChipButton
              drugs={unvalidatedDrugs}
              onClick={(): void => setAwaitingApprovalOpen(true)}
            />
          )}
        </Box>
        {!isPresentationMode && !isGeneratingReport && actions}
      </Box>
      {awaitingApprovalOpen && (
        <AwaitingValidationDrugsModal
          unvalidatedDrugs={unvalidatedDrugs}
          open={awaitingApprovalOpen}
          setOpen={setAwaitingApprovalOpen}
          onClose={onDrugValidationModalClose}
          readonly={isArchive || isChildRec || !canValidateDrugs}
        />
      )}
    </>
  );
}
