import { FabProps, Fab as MuiFab, styled } from '@mui/material';
import { CircularButtonIcon } from '../CustomIcons/CircularButtonIcon';

import type { JSX } from "react";

const Fab = styled(MuiFab)(() => ({
  width: '90px',
  height: '90px',
  position: 'fixed',
  bottom: '45px',
  right: '45px',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@media (max-width: 1440px)': {
    marginRight: '60px',
  },
}));

const FabIcon = styled(CircularButtonIcon)(() => ({
  position: 'relative',
  top: '8px',
  width: '130%',
  height: '130%',
}));

export default function AddCircularButton({
  onClick,
  ...rest
}: Partial<FabProps>): JSX.Element {
  return (
    <Fab
      aria-label="add"
      onClick={onClick}
      {...rest}
    >
      <FabIcon />
    </Fab>
  );
}
