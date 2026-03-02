import CustomTypography from '@/components/Common/Typography';
import {
  Box,
} from '@mui/material';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import CustomModal from '@/components/Common/CustomModal';
import DrugDetailEditingModal from './DrugDetailEditingModal';
import AwaitingValidationChip from '../DrugValidation/AwaitingValidationChip';
import { DrugDetailGrid } from './DrugDetailGrid';

interface IDrugDetailModalProps {
  drug: IExternalDrug,
  updateActiveTherapyDrugDetail: (updatedDrug: IExternalDrug) => void;
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
}

export default function DrugDetailModal({
  drug,
  updateActiveTherapyDrugDetail,
  open,
  setOpen,
}: IDrugDetailModalProps): JSX.Element {
  const [openEditingModal, setOpenEditingModal] = useState<boolean>(false);

  return (
    <>
      <CustomModal
        title={(
          <Box
            display="flex"
            flexDirection="row"
            gap="16px"
            alignItems="center"
          >
            <CustomTypography variant="h4" fontWeight="medium">
              {drug.name}
            </CustomTypography>
            {!drug.isValidated && <AwaitingValidationChip />}
          </Box>
        )}
        content={<DrugDetailGrid drug={drug} />}
        open={open}
        buttonText={{ confirm: 'Edit details' }}
        showActions={{ cancel: false, confirm: true }}
        onClose={(): void => setOpen(false)}
        onConfirm={(): void => setOpenEditingModal(true)}
        confirmDisabled={drug.version !== drug.latestVersion}
        tooltipText={drug.version !== drug.latestVersion ? 'Cannot edit details of old drug version' : ''}
      />
      {openEditingModal && (
        <DrugDetailEditingModal
          open={openEditingModal}
          setOpen={setOpenEditingModal}
          updateActiveDrugDetail={updateActiveTherapyDrugDetail}
          existingDrug={drug}
        />
      )}
    </>
  );
}
