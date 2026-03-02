import { corePalette } from '@/themes/colours';
import { IDrugMetadata, IExternalDrug } from '@/types/Drugs/Drugs.types';
import { Box } from '@mui/material';
import { PillIcon } from 'lucide-react';
import CustomButton from '../../../../../../Common/Button';
import CustomTypography from '../../../../../../Common/Typography';
import AwaitingValidationChip from '../DrugValidation/AwaitingValidationChip';

import type { JSX } from "react";

interface IProps {
  isActive: boolean;
  drug: IExternalDrug | null;
  drugClass: IDrugMetadata | null;
  showAwaitingValidationChip?: boolean;
  handleClick: () => void;
}

export default function DrugListItemChip({
  isActive,
  drug,
  drugClass,
  showAwaitingValidationChip = true,
  handleClick,
}: IProps): JSX.Element {
  const getDrugPillIcon = (): JSX.Element => {
    let colour = corePalette.grey50;
    let backgroundColour = corePalette.grey30;
    if (drug) {
      colour = drug.isValidated ? corePalette.green300 : corePalette.yellow300;
      backgroundColour = drug.isValidated ? corePalette.green10 : corePalette.yellow30;
    }
    return (
      <PillIcon stroke={colour} fill={backgroundColour} />
    );
  };

  const getDrugChipTitle = (): string => {
    if (drug && drugClass) {
      return `${drugClass.name} (${drug.name})`;
    }
    if (!drug && drugClass) {
      return drugClass.name;
    }
    if (drug && !drugClass) {
      return drug.name;
    }
    return 'Add drug details';
  };

  return (
    <CustomButton
      variant="text"
      onClick={handleClick}
      label={(
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          width="100%"
          padding="10px 16px"
          gap="16px"
          marginRight="auto"
        >
          <Box
            display="flex"
            flexDirection="row"
            gap="16px"
            flexGrow={1}
            minWidth={0}
          >
            {getDrugPillIcon()}
            <CustomTypography truncate fontWeight="medium">
              {getDrugChipTitle()}
            </CustomTypography>
          </Box>
          {drug && !drug.isValidated && showAwaitingValidationChip && <AwaitingValidationChip /> }
        </Box>
      )}
      sx={{
        width: '100%',
        padding: 0,
        color: corePalette.offBlack100,
        backgroundColor: corePalette.white,
        border: isActive ? `2px solid ${corePalette.green150}` : `1px solid ${corePalette.grey50}`,
        '& .MuiBox-root > span': {
          width: '100%',
        },
      }}
    />
  );
}
