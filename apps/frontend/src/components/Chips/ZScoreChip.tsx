/* eslint-disable @typescript-eslint/naming-convention */
import Chip from '@mui/material/Chip';
import { makeStyles } from '@mui/styles';

import type { JSX } from "react";

type Props = {
  min: number;
  max: number;
  mid?: number;
  zScore: string;
  inverted?: boolean,
};

type ChipColors = {
  backgroundColor: string;
  color: string;
};

const useStyles = makeStyles({
  chip: ({ color, backgroundColor }: ChipColors) => ({
    height: 28,
    borderRadius: 8,
    width: 150,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 16,
    color,
    backgroundColor,
  }),
});

// Colors
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
    backgroundColor: '#6F60E4',
    color: '#FFF',
  },
};

const getColorShade = (
  min: number,
  max: number,
  mid: number,
  value: number,
  inverted: boolean,
  isLOH: boolean,
): ChipColors => {
  const {
    reds, greens, N200, V800,
  } = colorShades;

  if (isLOH) return V800;
  const highScaleFactor: number = (max - min) / 8;
  const redIndex = (Math.ceil((value - mid) / highScaleFactor) * 100) as keyof typeof reds;

  const lowScaleFactor: number = (max - min) / 8;
  const greenIndex = (Math.ceil((mid - value) / lowScaleFactor) * 100) as keyof typeof greens;

  switch (true) {
    case value === mid:
      return N200;
    case value >= max:
      return inverted ? greens['800'] : reds['800'];
    case value <= min:
      return inverted ? reds['800'] : greens['800'];
    case value > mid:
      return inverted ? greens[redIndex] : reds[redIndex];
    case value < mid:
      return inverted ? reds[greenIndex] : greens[greenIndex];
    default:
      return N200;
  }
};

export default function ZScoreChip({
  min,
  max,
  mid,
  zScore,
  inverted = false,
}: Props): JSX.Element {
  const colors = getColorShade(
    min,
    max,
    mid || 0,
    parseFloat(zScore),
    inverted,
    false,
  );
  const classes = useStyles({ ...colors });
  return <Chip label={zScore} className={classes.chip} />;
}
