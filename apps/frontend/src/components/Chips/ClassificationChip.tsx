import { corePalette } from '@/themes/colours';
import { styled } from '@mui/material';
import { ReactNode, type JSX } from 'react';
import CustomChip from '../Common/Chip';

interface IProps {
  classification: string;
  reportable: boolean | null;
  tooltipText?: NonNullable<ReactNode>;
}

const Chip = styled(CustomChip)(() => ({
  width: 150,
}));

export default function ClassificationChip({
  reportable,
  classification,
  tooltipText,
}: IProps): JSX.Element {
  return (
    <Chip
      label={classification}
      size="medium"
      colour={reportable ? corePalette.white : corePalette.offBlack100}
      backgroundColour={reportable ? corePalette.violet100 : corePalette.grey30}
      tooltipText={tooltipText}
    />
  );
}
