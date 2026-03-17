import {
  ChipProps, Chip as MuiChip, styled, Tooltip,
} from '@mui/material';
import { ReactNode, type JSX } from 'react';
import CustomTypography from './Typography';

interface IProps extends ChipProps {
  label: ReactNode;
  maxWidth?: string;
  colour?: string;
  backgroundColour?: string;
  border?: string;
  fontWeight?: 'light' | 'regular' | 'medium' | 'bold';
  tooltipText?: NonNullable<ReactNode>;
  pill?: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Chip = styled(MuiChip)<IProps>(({
  theme,
  colour,
  backgroundColour,
  maxWidth,
  pill,
  border,
}) => ({
  borderRadius: pill ? '16px' : '4px',
  color: colour || theme.colours.chips.chipBlueText,
  backgroundColor: backgroundColour || theme.colours.chips.chipBlueBg,
  border,
  maxWidth,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '& .MuiChip-label': {
    padding: pill ? '2px 10px !important' : 'inherit',
  },
}));

export default function CustomChip({
  label,
  maxWidth,
  colour,
  backgroundColour,
  size = 'small',
  fontWeight = 'medium',
  tooltipText = '',
  pill = false,
  ...props
}: IProps): JSX.Element {
  return (
    <Tooltip title={tooltipText}>
      <Chip
        colour={colour}
        backgroundColour={backgroundColour}
        maxWidth={maxWidth}
        size={size}
        pill={pill}
        {...props}
        label={(
          <CustomTypography
            variant="bodySmall"
            fontWeight={fontWeight}
            truncate
            style={{
              color: colour,
            }}
          >
            {label}
          </CustomTypography>
        )}
      />
    </Tooltip>
  );
}
