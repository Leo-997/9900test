import {
  Box, ButtonProps, Button as MuiButton, styled,
} from '@mui/material';
import { forwardRef, ReactNode, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import { FlashingDotsAnimation } from '../Animations/FlashingDotsAnimation';

const IconWrapper = styled('div')(() => ({
  width: '20px',
  height: '20px',
  '& > svg': {
    width: '20px',
    height: '20px',
  },
}));

interface IProps extends ButtonProps {
  label: ReactNode;
  loading?: boolean;
}

const CustomButton = forwardRef<HTMLButtonElement, IProps>((
  {
    label,
    startIcon,
    endIcon,
    loading = false,
    disabled = false,
    onClick,
    ...props
  },
  ref,
): JSX.Element => {
  const getAnimationColour = (): string => {
    switch (props.variant) {
      case 'bold':
        return corePalette.white;
      case 'subtle':
        return corePalette.offBlack100;
      case 'outline':
        return corePalette.green150;
      case 'text':
        return corePalette.green150;
      case 'warning':
        return corePalette.red100;
      default:
        return corePalette.white;
    }
  };

  return (
    <MuiButton
      disabled={disabled}
      onClick={loading ? undefined : onClick}
      ref={ref}
      {...props}
    >
      {loading ? (
        <FlashingDotsAnimation colour={getAnimationColour()} />
      ) : (
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          columnGap="8px"
          width="100%"
        >
          {startIcon && <IconWrapper>{startIcon}</IconWrapper>}
          <span>{label}</span>
          {endIcon && <IconWrapper>{endIcon}</IconWrapper>}
        </Box>
      )}
    </MuiButton>
  );
});

export default CustomButton;
