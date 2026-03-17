/* eslint-disable @typescript-eslint/naming-convention */
import Chip from '@mui/material/Chip';
import { makeStyles } from '@mui/styles';

import type { JSX } from "react";

type Props = {
  isCNV?: boolean;
  mid?: number;
  minCn?: number;
  maxCn?: number;
  value: string;
  isLOH?: boolean;
};

type ChipColors = {
  backgroundColor: string;
  color: string;
};

const useStyles = makeStyles({
  chip: ({ backgroundColor, color }: ChipColors) => ({
    height: 28,
    borderRadius: 8,
    width: 'min(150px, 90%)',
    fontWeight: 700,
    fontSize: 16,
    backgroundColor,
    color,
  }),
});

const almostBlack = '#022034';
const inclusiveBlack = '#030313';

const colorShades = {
  reds: {
    800: {
      backgroundColor: '#FF2969',
      color: inclusiveBlack,
    },
    700: {
      backgroundColor: '#FF477E',
      color: inclusiveBlack,
    },
    600: {
      backgroundColor: '#FF5E8F',
      color: inclusiveBlack,
    },
    500: {
      backgroundColor: '#FF85A9',
      color: almostBlack,
    },
    400: {
      backgroundColor: '#FFAAC4',
      color: almostBlack,
    },
    300: {
      backgroundColor: '#FEC9D8',
      color: almostBlack,
    },
    200: {
      backgroundColor: '#FEE0E9',
      color: almostBlack,
    },
    100: {
      backgroundColor: '#FFF2F6',
      color: almostBlack,
    },
  },
  greens: {
    800: {
      backgroundColor: '#0EC971',
      color: inclusiveBlack,
    },
    700: {
      backgroundColor: '#16DA7D',
      color: inclusiveBlack,
    },
    600: {
      backgroundColor: '#40E58D',
      color: almostBlack,
    },
    500: {
      backgroundColor: '#5DFCA8',
      color: almostBlack,
    },
    400: {
      backgroundColor: '#85FFBE',
      color: almostBlack,
    },
    300: {
      backgroundColor: '#ABFFD2',
      color: almostBlack,
    },
    200: {
      backgroundColor: '#C9FFE2',
      color: almostBlack,
    },
    100: {
      backgroundColor: '#E0FFEF',
      color: almostBlack,
    },
  },
  N200: {
    backgroundColor: '#ECF0F3',
    color: almostBlack,
  },
  V800: {
    backgroundColor: '#AB6EE5',
    color: '#FFF',
  },
};

const getColorShade = (
  min: number,
  max: number,
  mid: number,
  value: number,
  isLOH: boolean,
): ChipColors => {
  const {
    reds, greens, N200, V800,
  } = colorShades;

  if (isLOH) return V800;

  const scaleFactorMax: number = (max - mid) / 8;
  const scaleFactorMin: number = (mid - min) / 8;

  switch (true) {
    case value === mid:
      return N200;
    case (value > mid && (Math.ceil((value - mid) / scaleFactorMax) * 100 > 800)):
      return reds['800'];
    case (value < mid && (Math.ceil((mid - value) / scaleFactorMin) * 100 > 800)):
      return greens['800'];
    case value > mid:
      return reds[Math.ceil((value - mid) / scaleFactorMax) * 100 as keyof typeof reds];
    case value < mid:
      return greens[Math.ceil((mid - value) / scaleFactorMin) * 100 as keyof typeof greens];
    default:
      return { backgroundColor: '', color: '' };
  }
};

export default function AvgCopyChip({
  isCNV = false,
  mid = 2,
  maxCn,
  minCn = 0,
  value,
  isLOH = false,
}: Props): JSX.Element {
  const min = minCn < 0 ? 0 : minCn;
  const max = maxCn || mid * 5;
  const newAvg = value === '0.00' || parseFloat(value) < 0 ? 0 : parseFloat(value);
  const colors = getColorShade(min, max, 2, newAvg, isLOH);
  const classes = useStyles({ ...colors });

  return isCNV ? (
    <Chip label={value} className={classes.chip} />
  ) : (
    <Chip label={Number.isNaN(newAvg) ? '-' : newAvg} className={classes.chip} />
  );
}
