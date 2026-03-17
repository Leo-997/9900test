import { Box, styled } from '@mui/material';

import type { JSX } from 'react';

interface IStyleProps {
  colour?: string;
  location?: 'center' | 'right' | 'left';
}

const Dot = styled(Box)<IStyleProps>(({ theme, colour, location }) => ({
  position: 'relative',
  width: '4px',
  height: '4px',
  borderRadius: '2px',
  backgroundColor: colour || theme.colours.core.white,
  color: colour || theme.colours.core.white,
  ...(location === 'left' && {
    animation: 'dotFlashing 1s infinite alternate',
    animationDelay: '0s',
  }),
  ...(location === 'center' && {
    animation: 'dotFlashing 1s infinite linear alternate',
    animationDelay: '0.5s',
  }),
  ...(location === 'right' && {
    animation: 'dotFlashing 1s infinite linear alternate',
    animationDelay: '1s',
  }),

  '@keyframes dotFlashing': {
    '0%': {
      opacity: 1,
    },
    '50%, 100%': {
      opacity: 0.2,
    },
  },
}));

interface IFlashingDotsAnimationProps {
  colour?: string;
}

export function FlashingDotsAnimation({
  colour,
}: IFlashingDotsAnimationProps): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      <Dot location="left" colour={colour} />
      <Dot location="center" colour={colour} />
      <Dot location="right" colour={colour} />

    </div>
  );
}
