import { Box, styled } from '@mui/material';
import { ITherapyDrug } from '../../../../../types/Drugs/Drugs.types';
import CustomTypography from '../../../../Common/Typography';
import AwaitingValidationChip from '../Modals/Components/DrugValidation/AwaitingValidationChip';

import type { JSX } from "react";

interface IStyleProps {
  isAlternative?: boolean;
  colour?: string;
  altColour?: string;
}

const Drug = styled(Box)<IStyleProps>(({ isAlternative, colour, altColour }) => ({
  color: isAlternative ? altColour : colour,
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
}));

export interface IProps {
  drug: ITherapyDrug;
  isAlternative?: boolean;
  showDrugClass?: boolean;
  colour?: string;
  altColour?: string;
  showAllDetails?: boolean;
}

export function MainSlideDrug({
  drug,
  isAlternative = false,
  showDrugClass = false,
  colour,
  altColour = '#5A278A',
  showAllDetails = false,
}: IProps): JSX.Element {
  const getDrugName = (): string => {
    if (!showAllDetails && drug.externalDrug) {
      return drug.externalDrug.name;
    }

    if (!showAllDetails || !drug.externalDrug) {
      return drug.class.name;
    }

    if (showDrugClass) {
      return `${drug.externalDrug?.name} (${drug.class.name})`;
    }

    return drug.externalDrug.name;
  };

  return (
    <Drug isAlternative={isAlternative} colour={colour} altColour={altColour}>
      <CustomTypography truncate>
        {getDrugName()}
      </CustomTypography>
      {drug.externalDrug && !drug.externalDrug.isValidated && showAllDetails
        && <AwaitingValidationChip />}
    </Drug>
  );
}
