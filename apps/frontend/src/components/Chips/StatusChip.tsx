import { styled } from '@mui/material';
import { ReactNode, type JSX } from 'react';
import CustomChip from '../Common/Chip';

interface IStyleProps {
  backgroundColor: string;
  background?: string;
  opacity: number;
  maxWidth?: string;
}

const Chip = styled(CustomChip)<IStyleProps>(({
  colour, backgroundColor, background, opacity, maxWidth,
}) => ({
  borderRadius: '4px',
  color: colour,
  backgroundColor,
  background,
  maxWidth,
  height: 'auto !important',
  width: 'fit-content',
  opacity,
  '& .MuiChip-label': {
    padding: '2px 4px',
  },
}));

export interface IStatusChipProps {
  status: string;
  maxWidth?: string;
  maxHeight?: string;
  backgroundColor?: string;
  background?: string;
  color?: string;
  opacity?: number;
  size?: 'small' | 'medium';
  fontWeight?: 'medium' | 'bold' | 'light' | 'regular';
  tooltipText?: NonNullable<ReactNode>;
}

export default function StatusChip({
  status,
  maxWidth,
  maxHeight,
  backgroundColor = '#ECF0F3',
  background,
  color = 'rgba(0, 0, 0, 0.54)',
  opacity = 1,
  size = 'small',
  fontWeight = 'bold',
  tooltipText = '',
}: IStatusChipProps): JSX.Element {
  return (
    <Chip
      label={status?.toUpperCase() || 'UPCOMING'}
      size={size}
      sx={{
        maxWidth,
        maxHeight,
        backgroundColor,
        opacity,
        '& span': {
          color,
          fontSize: 12,
          fontWeight,
        },
      }}
      colour={color}
      backgroundColor={backgroundColor}
      background={background}
      maxWidth={maxWidth}
      opacity={opacity}
      tooltipText={tooltipText}
    />
  );
}
