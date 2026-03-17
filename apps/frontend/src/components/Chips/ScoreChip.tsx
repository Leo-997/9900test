import { styled } from '@mui/material';

import { colorShades } from '@/themes/colours';
import CustomChip from '../Common/Chip';

import type { JSX } from "react";

type Props = {
  min: number;
  max: number;
  mid: number;
  value?: number;
  label?: string;
  isLOH?: boolean;
  inverted?: boolean;
};

type ChipColors = {
  backgroundColour: string;
  colour: string;
  width?: string | number;
  fontWeight?: number;
};

const Chip = styled(CustomChip)(() => ({
  borderRadius: 8,
  marginTop: 0,
  marginBottom: 0,
  width: 'min(150px, 90%)',
}));

const getColorShade = (
  min: number,
  max: number,
  middle: number,
  value?: number,
  isLOH?: boolean,
  inverted?: boolean,
): ChipColors => {
  const {
    reds: redShades, greens: greenShades, N200, V800,
  } = colorShades;

  if (!value) return N200;
  if (isLOH) return V800;

  const reds = inverted ? greenShades : redShades;
  const greens = inverted ? redShades : greenShades;

  const scaleFactor: number = (max - min) / 8;
  switch (true) {
    case value === middle:
      return N200;
    case value >= max:
      return reds['800'];
    case value <= min:
      return greens['800'];
    case value > middle:
      return reds[(
        Math.ceil((value - middle) / scaleFactor) * 100
      ) as keyof typeof reds];
    case value < middle:
      return greens[(
        Math.ceil((middle - value) / scaleFactor) * 100
      ) as keyof typeof greens];
    default:
      return N200;
  }
};

export function ScoreChip({
  max,
  min,
  mid,
  value,
  isLOH,
  label,
  inverted = false,
}: Props): JSX.Element {
  const colors = getColorShade(min, max, mid, value, isLOH || false, inverted);
  return (
    <Chip
      label={label || (isLOH ? 'LOH' : value ?? '-')}
      backgroundColour={colors?.backgroundColour}
      colour={colors?.colour}
      fontWeight="bold"
      size="medium"
    />
  );
}
