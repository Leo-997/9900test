import { CSSProperties, type JSX } from 'react';

import { Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { toFixed } from '../../utils/math/toFixed';

type Props = {
  min: number;
  max: number;
  value: number;
  style?: CSSProperties;
  secondaryValue?: number;
};

type ChipStyleProps = {
  backgroundColor: string;
  color: string;
  fontWeight?: number;
};

const useStyles = makeStyles({
  chip: ({ backgroundColor, color }: ChipStyleProps) => ({
    height: 28,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor,
    color,
    minWdth: 66,
  }),
  label: {
    width: '100%',
  },
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
    backgroundColor: '#6F60E4',
    color: '#FFF',
  },
};

const getColorShade = (
  min: number,
  max: number,
  value: number,
): ChipStyleProps => {
  const { reds, greens, N200 } = colorShades;
  const middle = 2.00;
  switch (true) {
    case value === middle:
      return N200;
    case value >= max:
      return reds['800'];
    case value <= min:
      return greens['800'];
    case value > middle:
      const highScaleFactor: number = (max - min) / 8;
      const redIndex = (Math.ceil((value - middle) / highScaleFactor)
        * 100) as keyof typeof reds;
      const redNormalisedIndex = Math.max(Math.min(redIndex, 800), 100);
      return reds[redNormalisedIndex];
    case value < middle:
      const lowScaleFactor: number = (max - min) / 8;
      const greenIndex = (Math.ceil((middle - value) / lowScaleFactor)
        * 100) as keyof typeof greens;
      const greenNormalisedIndex = Math.max(Math.min(greenIndex, 800), 100);
      return greens[greenNormalisedIndex];
    default:
      return { backgroundColor: '', color: '' };
  }
};

export default function ArmCNChip({
  max,
  min,
  value,
  style,
  secondaryValue,
}: Props): JSX.Element {
  const colors = getColorShade(min, max, parseFloat(toFixed(value, 2)));
  const classes = useStyles({ ...colors });
  return (
    <Chip
      label={secondaryValue ? `${toFixed(value, 2)} (${toFixed(secondaryValue, 2)})` : `${toFixed(value, 2)}`}
      className={classes.chip}
      style={style}
    />
  );
}
