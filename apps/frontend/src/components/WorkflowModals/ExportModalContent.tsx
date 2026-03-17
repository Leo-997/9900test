import { clinicalStatuses } from '@/constants/MTB/navigation';
import { useCuration } from '@/contexts/CurationContext';
import { corePalette } from '@/themes/colours';
import { ClinicalStatus } from '@/types/MTB/ClinicalStatus.types';
import { Box, MenuItem, Select } from '@mui/material';
import { Dispatch, SetStateAction, type JSX } from 'react';
import StatusChip from '../Chips/StatusChip';
import CustomTypography from '../Common/Typography';

interface IExportModalContentProps {
  clinicalStatus: ClinicalStatus | 'N/A';
  setClinicalStatus: Dispatch<SetStateAction<ClinicalStatus | 'N/A'>>;
}

export default function ExportModalContent({
  clinicalStatus,
  setClinicalStatus,
}: IExportModalContentProps): JSX.Element {
  const { curationStatus } = useCuration();
  const getClinicalStatuses = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    for (const status in clinicalStatuses) {
      if (!clinicalStatuses[status].disabledInCuration) {
        items.push(
          <MenuItem
            value={status}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '8px',
              height: '44px',
              '&:hover': {
                background: corePalette.grey30,
              },
            }}
          >
            {clinicalStatuses[status].chips.map((chip) => (
              <StatusChip
                {...chip.chipProps}
              />
            ))}
          </MenuItem>,
        );
      }
    }
    return items;
  };
  return (
    <>
      {curationStatus?.status !== 'Done' && (
        <CustomTypography>
          You are about to complete curation for this sample.
        </CustomTypography>
      )}
      <CustomTypography>
        This action will copy all reportable variants to the Clinical module of ZeroDash.
      </CustomTypography>
      <CustomTypography>
        Would you like to proceed?
      </CustomTypography>
      {curationStatus?.status !== 'Done' && (
        <Box display="flex" flexDirection="column">
          <CustomTypography
            variant="label"
            sx={{
              marginTop: '25px',
              marginBottom: '10px',
            }}
          >
            MTB SLIDES STATUS *
          </CustomTypography>
          <Select
            key="case-status-select"
            variant="outlined"
            value={clinicalStatus}
            onChange={(e): void => {
              setClinicalStatus(e.target.value as ClinicalStatus);
            }}
            sx={{
              height: '44px',
              width: '230px',
              borderRadius: '4px',
              backgroundColor: corePalette.white,
              color: corePalette.offBlack100,
            }}
          >
            {getClinicalStatuses()}
          </Select>
        </Box>
      )}
    </>
  );
}
