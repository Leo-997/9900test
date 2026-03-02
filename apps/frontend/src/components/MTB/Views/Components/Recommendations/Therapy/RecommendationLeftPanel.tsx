import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { useTherapyRecommendation } from '@/contexts/TherapyRecommendationContext';
import { corePalette } from '@/themes/colours';
import { IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import { ITherapyOption } from '@/types/Therapies/CommonTherapies.types';
import {
  Box,
  Divider,
} from '@mui/material';
import { styled } from '@mui/styles';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import CustomChip from '@/components/Common/Chip';
import { DrugListItem } from '../../Modals/Components/Therapies/DrugListItem';
import TherapyOption from '../../Modals/Components/Therapies/TherapyOption';
import TherapyTrialModal from '../../Modals/Components/Therapies/TherapyTrialModal';
import TargetSection from '../Common/TargetSection';

const EditorWrapper = styled('span')({
  width: '100%',
  '& .editorArea': {
    maxHeight: '500px',
    minHeight: '152px',
    backgroundColor: corePalette.white,
  },
});

interface IProps {
  alterations: IMolecularAlterationDetail[];
}

export default function RecommendationLeftPanel({
  alterations,
}: IProps): JSX.Element {
  const {
    tier,
    targets,
    setTargets,
    description,
    setDescription,
    selectedTherapyDrugs,
    selectedTherapyTrials,
    activeTherapyDrugIndex,
    setActiveTherapyDrugIndex,
    addTherapyDrug,
    deleteTherapyDrug,
    chemotherapy,
    radiotherapy,
    updateTitlePrefilling,
    updateTherapy,
  } = useTherapyRecommendation();

  const [trialModalOpen, setTrialModalOpen] = useState<boolean>(false);

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
          {alterations.length > 0 && (
            <TargetSection
              allTargets={alterations}
              selectedTargets={targets}
              setSelectedTargets={setTargets}
              subtitle="Select an alteration to target for this therapy"
              updateTitlePrefilling={(newTargets: IMolecularAlterationDetail[]): void => {
                updateTitlePrefilling(
                  selectedTherapyDrugs,
                  chemotherapy.includeOption,
                  radiotherapy.includeOption,
                  newTargets,
                  tier,
                );
              }}
            />
          )}
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <EditorWrapper>
              <RichTextEditor
                key={`${chemotherapy.note}${radiotherapy.note}${JSON.stringify(selectedTherapyDrugs)}`}
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
          <Box
            display="flex"
            flexDirection="column"
            gap="8px"
          >
            <CustomTypography variant="titleRegular" fontWeight="medium">
              Therapy details
            </CustomTypography>
            <TherapyOption
              key="chemortherapy"
              option={chemotherapy}
              checkboxLabel="Chemotherapy"
              onChange={(newOption: ITherapyOption): void => {
                updateTherapy('chemotherapy', newOption);
              }}
            />
            <TherapyOption
              option={radiotherapy}
              checkboxLabel="Radiotherapy"
              onChange={(newOption: ITherapyOption): void => {
                updateTherapy('radiotherapy', newOption);
              }}
            />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            width="100%"
            gap="8px"
          >
            <CustomTypography
              variant="titleRegular"
              fontWeight="medium"
            >
              Drugs
            </CustomTypography>
            {selectedTherapyDrugs.map((therapyDrug, index) => (
              <DrugListItem
                key={therapyDrug.id}
                isActive={index === activeTherapyDrugIndex}
                drug={therapyDrug.drug}
                drugClass={therapyDrug.class}
                handleDelete={(): void => deleteTherapyDrug(index)}
                handleClick={(): void => setActiveTherapyDrugIndex(index)}
              />
            ))}
            {activeTherapyDrugIndex === -1 && (
              <DrugListItem
                key="new"
                isActive
                drug={null}
                drugClass={null}
                handleClick={(): void => setActiveTherapyDrugIndex(-1)}
              />
            )}
            <CustomButton
              label={`Add ${selectedTherapyDrugs.length > 0 ? 'combination ' : ''}drug`}
              variant="subtle"
              startIcon={<PlusIcon />}
              onClick={addTherapyDrug}
              disabled={activeTherapyDrugIndex === -1}
            />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            gap="8px"
          >
            <Box
              display="flex"
              flexDirection="row"
              gap="10px"
              alignItems="center"
            >
              <CustomTypography variant="titleRegular" fontWeight="medium">
                Clinical Trials
              </CustomTypography>
              {selectedTherapyTrials.length > 0 && (
                <CustomChip
                  label={selectedTherapyTrials.length}
                  size="small"
                  pill
                  colour={corePalette.green150}
                  backgroundColour={corePalette.green10}
                  sx={{
                    border: `1px solid ${corePalette.green150}`,
                  }}
                />
              )}
            </Box>
            {selectedTherapyTrials.length > 0 ? (
              <Box
                border={`1px solid ${corePalette.grey50}`}
                borderRadius="8px"
                padding="16px"
                width="100%"
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                bgcolor={corePalette.white}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  maxWidth="80%"
                >
                  {selectedTherapyTrials.map((t) => (
                    <CustomTypography truncate>
                      {t.externalTrial.name}
                    </CustomTypography>
                  ))}
                </Box>
                <Box
                  display="flex"
                  gap="24px"
                  height="100%"
                >
                  <Divider
                    orientation="vertical"
                    flexItem
                  />
                  <CustomButton
                    label="Edit"
                    variant="subtle"
                    startIcon={<PencilIcon />}
                    size="small"
                    onClick={(): void => setTrialModalOpen(true)}
                  />
                </Box>
              </Box>
            ) : (
              <Box paddingBottom="5px">
                <CustomButton
                  onClick={(): void => setTrialModalOpen(true)}
                  variant="subtle"
                  size="medium"
                  startIcon={<PlusIcon />}
                  label="Add clinical trial"
                />
              </Box>
            )}
            {trialModalOpen && (
              <TherapyTrialModal
                open={trialModalOpen}
                setOpen={setTrialModalOpen}
              />
            )}
          </Box>
        </Box>
      </ScrollableSection>
    </Box>
  );
}
