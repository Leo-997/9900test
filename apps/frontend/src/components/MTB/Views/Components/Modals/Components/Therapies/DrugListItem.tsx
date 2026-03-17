import { IDrugMetadata, IExternalDrug } from '@/types/Drugs/Drugs.types';
import { Box, IconButton } from '@mui/material';
import { Trash2Icon } from 'lucide-react';
import { corePalette } from '@/themes/colours';
import DrugListItemChip from './DrugListItemChip';

import type { JSX } from "react";

interface IDrugCardProps {
  isActive: boolean;
  drug: IExternalDrug | null;
  drugClass: IDrugMetadata | null;
  handleClick: () => void;
  handleDelete?: () => void;
}

export function DrugListItem({
  isActive,
  drug,
  drugClass,
  handleClick,
  handleDelete,
}: IDrugCardProps): JSX.Element {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="16px"
      width="100%"
    >
      <DrugListItemChip
        isActive={isActive}
        drug={drug}
        drugClass={drugClass}
        handleClick={handleClick}
      />
      <IconButton
        onClick={handleDelete}
        disabled={!handleDelete || !drugClass}
      >
        <Trash2Icon
          color={!handleDelete || !drugClass ? corePalette.grey50 : corePalette.offBlack100}
        />
      </IconButton>
    </Box>
  );
}
