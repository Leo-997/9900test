import { corePalette } from '@/themes/colours';
import { styled } from '@mui/material';
import CustomChip from '../Common/Chip';

import type { JSX } from "react";

const Chip = styled(CustomChip)(() => ({
  maxWidth: 'min(200px, 90%)',
}));

interface IProps {
  label?: string;
}

export default function PrismChip({
  label,
}: IProps): JSX.Element {
  return (
    <Chip
      label={label}
      size="medium"
      colour={corePalette.offBlack100}
      backgroundColour={corePalette.grey50}
      pill
    />
  );
}
