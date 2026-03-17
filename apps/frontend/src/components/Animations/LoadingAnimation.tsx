/* eslint-disable @typescript-eslint/naming-convention */
import {
  Box, styled, SxProps, Theme,
} from '@mui/material';
import { ReactNode, type JSX } from 'react';
import { corePalette } from '@/themes/colours';

interface IStyleProps {
  dotColour?: string;
  baseColour?: string;
}

const Wrapper = styled(Box)(() => ({
  position: 'relative',
  width: '128px',
  height: '70px',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
}));

const MessageWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 'fit-content',
  top: 'calc(50% + 20px)',
  left: '50%',
  color: theme.colours.core.grey50,
  transform: 'translate(-50%, -50%)',
}));

const Dot = styled(Box)<IStyleProps>(({ dotColour }) => ({
  position: 'absolute',
  width: '10px',
  height: '10px',
  borderRadius: '50px 50px',
  background: dotColour,
  WebkitAnimation: 'loading-spin 1.5s linear infinite',
  animation: 'loading-spin 1.5s linear infinite',
  transformOrigin: 'center center',
  zIndex: 10,

  // Animation - Spin
  '@keyframes loading-spin': {
    '0%': {
      transform: 'translateY(0px) scale(1)',
    },
    '25%': {
      transform: 'translateY(30px) scale(2)',
    },
    '50%': {
      transform: 'translateY(60px) scale(1)',
    },
    '75%': {
      transform: 'translateY(30px) scale(0.3)',
    },
    '100%': {
      transform: 'translateY(0px) scale(1)',
    },
  },
  '@-webkit-keyframes loading-spin': {
    '0%': {
      transform: 'translateY(0px) scale(1)',
    },
    '25%': {
      transform: 'translateY(30px) scale(2)',
    },
    '50%': {
      transform: 'translateY(60px) scale(1)',
    },
    '75%': {
      transform: 'translateY(30px) scale(0.3)',
    },
    '100%': {
      transform: 'translateY(0px) scale(1)',
    },
  },
}));

const Base = styled(Box)<IStyleProps>(({ baseColour }) => ({
  position: 'absolute',
  width: '1px',
  height: '10px',
  top: '30px',
  background: baseColour,
  WebkitAnimation: 'loading-flex 1.5s linear infinite',
  animation: 'loading-flex 1.5s linear infinite',
  transformOrigin: 'center center',

  // Animation - Flex
  '@keyframes loading-flex': {
    '0%': {
      transform: 'scaleY(5)',
    },
    '25%': {
      transform: 'scaleY(1)',
    },
    '50%': {
      transform: 'scaleY(5)',
    },
    '75%': {
      transform: 'scaleY(1)',
    },
    '100%': {
      transform: 'scaleY(5)',
    },
  },
  '@-webkit-keyframes loading-flex': {
    '0%': {
      transform: 'scaleY(5)',
    },
    '25%': {
      transform: 'scaleY(1)',
    },
    '50%': {
      transform: 'scaleY(5)',
    },
    '75%': {
      transform: 'scaleY(1)',
    },
    '100%': {
      transform: 'scaleY(5)',
    },
  },
}));

type DotNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type BaseNumbers = 1 | 2 | 3 | 4 | 5;

interface IProps {
  msg?: ReactNode | string;
  dotColour?: string;
  baseColour?: string;
}

export default function LoadingAnimation({
  msg,
  dotColour = corePalette.offBlack100,
  baseColour = corePalette.offBlack100,
}: IProps): JSX.Element {
  const dots: DotNumbers[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const bases: BaseNumbers[] = [1, 2, 3, 4, 5];

  const dotSx: Record<DotNumbers, SxProps<Theme>> = {
    1: {
      WebkitAnimation: 'loading-spin 1.5s linear infinite',
      animation: 'loading-spin 1.5s linear infinite',
    },
    2: {
      WebkitAnimation: 'loading-spin 1.5s -0.75s linear infinite',
      animation: 'loading-spin 1.5s -0.75s linear infinite',
    },
    3: {
      left: '30px',
      WebkitAnimation: 'loading-spin 1.5s -1.3s linear infinite',
      animation: 'loading-spin 1.5s -1.3s linear infinite',
    },
    4: {
      left: '30px',
      WebkitAnimation: 'loading-spin 1.5s -0.55s linear infinite',
      animation: 'loading-spin 1.5s -0.55s linear infinite',
    },
    5: {
      left: '60px',
      WebkitAnimation: 'loading-spin 1.5s -1.1s linear infinite',
      animation: 'loading-spin 1.5s -1.1s linear infinite',
    },
    6: {
      left: '60px',
      WebkitAnimation: 'loading-spin 1.5s -0.35s linear infinite',
      animation: 'loading-spin 1.5s -0.35s linear infinite',
    },
    7: {
      left: '90px',
      WebkitAnimation: 'loading-spin 1.5s -0.9s linear infinite',
      animation: 'loading-spin 1.5s -0.9s linear infinite',
    },
    8: {
      left: '90px',
      WebkitAnimation: 'loading-spin 1.5s -0.15s linear infinite',
      animation: 'loading-spin 1.5s -0.15s linear infinite',
    },
    9: {
      left: '120px',
      WebkitAnimation: 'loading-spin 1.5s -0.7s linear infinite',
      animation: 'loading-spin 1.5s -0.7s linear infinite',
    },
    10: {
      left: '120px',
      WebkitAnimation: 'loading-spin 1.5s 0.05s linear infinite',
      animation: 'loading-spin 1.5s 0.05s linear infinite',
    },
  };

  const baseSx: Record<BaseNumbers, SxProps<Theme>> = {
    1: {
      left: '5px',
      WebkitAnimation: 'loading-flex 1.5s linear infinite',
      animation: 'loading-flex 1.5s linear infinite',
    },
    2: {
      left: '35px',
      WebkitAnimation: 'loading-flex 1.5s -1.3s linear infinite',
      animation: 'loading-flex 1.5s -1.3s linear infinite',
    },
    3: {
      left: '65px',
      WebkitAnimation: 'loading-flex 1.5s -1.1s linear infinite',
      animation: 'loading-flex 1.5s -1.1s linear infinite',
    },
    4: {
      left: '95px',
      WebkitAnimation: 'loading-flex 1.5s -0.9s linear infinite',
      animation: 'loading-flex 1.5s -0.9s linear infinite',
    },
    5: {
      left: '125px',
      WebkitAnimation: 'loading-flex 1.5s -0.75s linear infinite',
      animation: 'loading-flex 1.5s -0.75s linear infinite',
    },
  };

  return (
    <Box width="100%" height="100%">
      <Wrapper>
        {dots.map((key) => (
          <Dot
            dotColour={dotColour}
            key={key}
            sx={dotSx[key]}
          />
        ))}
        {bases.map((key) => (
          <Base key={key} sx={baseSx[key]} baseColour={baseColour} />
        ))}
      </Wrapper>
      {msg && (
        <MessageWrapper>
          {msg}
        </MessageWrapper>
      )}
    </Box>
  );
}
