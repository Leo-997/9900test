import CustomButton from '@/components/Common/Button';
import { corePalette } from '@/themes/colours';
import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import { ArrowRight, PillIcon } from 'lucide-react';

import type { JSX } from "react";

interface IProps {
  onClick: () => void;
  drugs: IExternalDrug[]
}

export default function DrugValidationChipButton({
  onClick,
  drugs,
}: IProps): JSX.Element {
  return (
    <CustomButton
      label={`${drugs.length} Drug${drugs.length > 1 ? 's' : ''} awaiting validation`}
      startIcon={<PillIcon color={corePalette.yellow200} />}
      endIcon={<ArrowRight color={corePalette.offBlack100} />}
      size="small"
      onClick={onClick}
      sx={{
        padding: '0 6px',
        width: 'fit-content',
        bgcolor: corePalette.yellow10,
        color: corePalette.offBlack100,
        border: `1px solid ${corePalette.yellow150}`,
        borderRadius: '4px',
        '&:hover': {
          bgcolor: corePalette.yellow30,
        },
      }}
    />
  );
}
