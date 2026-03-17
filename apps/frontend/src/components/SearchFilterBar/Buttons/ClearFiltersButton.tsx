import CustomButton from '@/components/Common/Button';
import { styled } from '@mui/material';
import { CircleXIcon } from 'lucide-react';

import type { JSX } from "react";

const ClearButton = styled(CustomButton)({
  borderRadius: '0px',
  width: '100%',
  '& > .MuiBox-root': {
    justifyContent: 'space-between',
  },
});

interface IProps {
  isDisabled: boolean;
  clearFilters: () => void;
}

export default function ClearFiltersButton({
  isDisabled,
  clearFilters,
}: IProps): JSX.Element {
  return (
    <ClearButton
      onClick={clearFilters}
      disabled={isDisabled}
      label="Clear all filters"
      endIcon={<CircleXIcon />}
    />
  );
}
