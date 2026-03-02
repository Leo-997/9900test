import { corePalette } from '@/themes/colours';
import { strToBool } from '@/utils/functions/bools';
import { styled } from '@mui/material';
import { ReactNode, type JSX } from 'react';
import CustomChip from '../Common/Chip';

interface IProps {
  targetable: string;
  label?: string;
  tooltipText?: NonNullable<ReactNode>;
}

const Chip = styled(CustomChip)(() => ({
  width: 150,
}));

export default function TargetableChip({ targetable, label, tooltipText }: IProps): JSX.Element {
  return (
    <Chip
      label={label ?? targetable}
      size="medium"
      colour={strToBool(targetable) ? corePalette.white : corePalette.offBlack100}
      backgroundColour={strToBool(targetable) ? corePalette.violet100 : corePalette.grey30}
      tooltipText={tooltipText}
    />
  );
}
