import { Menu, MenuItem } from '@mui/material';
import { ChevronDownIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import { GroupRecommendationProvider } from '@/contexts/GroupRecommendationContext';
import { recommendationOptions } from '../../../../../../constants/options';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { TherapyRecommendationProvider } from '../../../../../../contexts/TherapyRecommendationContext';
import { ISelectOption } from '../../../../../../types/misc.types';
import { IMolecularAlterationDetail } from '../../../../../../types/MTB/MolecularAlteration.types';
import { IFetchRecommendation, RecommendationLinkEntity, RecommendationType } from '../../../../../../types/MTB/Recommendation.types';
import CustomButton from '../../../../../Common/Button';
import GermlineRecommendationDialog from '../Germline/GermlineRecommendationDialog';
import TherapyRecommendationDialog from '../Therapy/TherapyRecommendationDialog';
import DiagnosisRecommendationDialog from '../Diagnosis/DiagnosisRecommendationDialog';
import GroupRecommendationDialog from '../Group/GroupRecommendationDialog';
import TextRecommendationDialog from '../Text/TextRecommendationDialog';

interface IRecommendationButtonsProps {
  title?: string;
  alterations: IMolecularAlterationDetail[];
  onSubmitRecommendation: (newRec: IFetchRecommendation) => void;
  recommendationTypes: RecommendationType[];
  entity?: RecommendationLinkEntity;
  order?: number;
  disabled?: boolean;
  label?: string;
}

export default function AddRecommendationButton({
  title,
  alterations,
  onSubmitRecommendation,
  recommendationTypes,
  entity,
  order,
  disabled,
  label = 'Add recommendation',
}: IRecommendationButtonsProps): JSX.Element {
  const {
    isPresentationMode,
  } = useClinical();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openTextModal, setOpenTextModal] = useState<boolean>(false);
  const [openGermlineModal, setOpenGermlineModal] = useState<boolean>(false);
  const [openTherapyModal, setOpenTherapyModal] = useState<boolean>(false);
  const [openDiagnosisModal, setOpenDiagnosisModal] = useState<boolean>(false);
  const [openGroupModal, setOpenGroupModal] = useState<boolean>(false);

  const handleClick = (val: RecommendationType): void => {
    switch (val) {
      case 'THERAPY':
        setOpenTherapyModal(true);
        break;
      case 'CHANGE_DIAGNOSIS':
        setOpenDiagnosisModal(true);
        break;
      case 'GERMLINE':
        setOpenGermlineModal(true);
        break;
      case 'TEXT':
        setOpenTextModal(true);
        break;
      case 'GROUP':
        setOpenGroupModal(true);
        break;
      default:
        break;
    }
    setAnchorEl(null);
  };

  if (isPresentationMode) {
    return <div />;
  }

  return (
    <>
      <CustomButton
        variant="outline"
        label={label}
        onClick={(e): void => setAnchorEl(e.currentTarget)}
        endIcon={<ChevronDownIcon />}
        disabled={disabled}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
        onClose={(): void => setAnchorEl(null)}
      >
        {recommendationOptions.map((option: ISelectOption<RecommendationType>) => {
          const { value, name } = option;

          return (recommendationTypes.includes(value)) && (
            <MenuItem
              key={`${value}-rec`}
              onClick={(): void => handleClick(value)}
              disabled={disabled}
            >
              {name}
            </MenuItem>
          );
        })}
      </Menu>
      {recommendationTypes.includes('THERAPY') && openTherapyModal && (
        <TherapyRecommendationProvider entity={entity}>
          <TherapyRecommendationDialog
            alterations={alterations}
            open={openTherapyModal}
            setOpen={setOpenTherapyModal}
            onSubmitRecommendation={onSubmitRecommendation}
            returnToTitle={title}
            order={order}
          />
        </TherapyRecommendationProvider>
      )}
      {recommendationTypes.includes('CHANGE_DIAGNOSIS') && openDiagnosisModal && (
        <DiagnosisRecommendationDialog
          alterations={alterations}
          open={openDiagnosisModal}
          setOpen={setOpenDiagnosisModal}
          onSubmitRecommendation={onSubmitRecommendation}
          entity={entity}
          order={order}
        />
      )}
      {recommendationTypes.includes('TEXT') && openTextModal && (
        <TextRecommendationDialog
          open={openTextModal}
          setOpen={setOpenTextModal}
          onSubmitRecommendation={onSubmitRecommendation}
          entity={entity}
          order={order}

        />
      )}
      {recommendationTypes.includes('GERMLINE') && openGermlineModal && (
        <GermlineRecommendationDialog
          open={openGermlineModal}
          setOpen={setOpenGermlineModal}
          onSubmitRecommendation={onSubmitRecommendation}
          entity={entity}
          order={order}
        />
      )}
      {recommendationTypes.includes('GROUP') && openGroupModal && entity && (
        <GroupRecommendationProvider entity={entity}>
          <GroupRecommendationDialog
            open={openGroupModal}
            setOpen={setOpenGroupModal}
            order={order}
            onSubmitRecommendation={onSubmitRecommendation}
          />
        </GroupRecommendationProvider>
      )}

    </>
  );
}
