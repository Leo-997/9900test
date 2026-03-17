import { corePalette } from '@/themes/colours';
import { IconButton } from '@mui/material';
import { CircleCheckBigIcon, PlusCircleIcon } from 'lucide-react';

import type { JSX } from "react";

interface IProps {
  onSelect: () => void;
  isSelected: boolean;
  allowDeselecting?: boolean;
  disabled?: boolean;
}

export function EvidencePickerButton({
  onSelect,
  isSelected,
  allowDeselecting,
  disabled = false,
}: IProps): JSX.Element {
  return (
    <IconButton
      onClick={onSelect}
      disabled={
        (isSelected && !allowDeselecting)
        || disabled
      }
      sx={{
        padding: '6px',
      }}
    >
      {isSelected ? (
        <CircleCheckBigIcon fill={corePalette.blank} stroke={corePalette.green150} />
      ) : (
        <PlusCircleIcon />
      )}
    </IconButton>
  );
}
