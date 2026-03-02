import { PaperProps, Paper } from '@mui/material';
import Draggable from 'react-draggable';

import type { JSX } from "react";

export function DraggablePaperComponent(paperProps: PaperProps): JSX.Element {
  return (
    <Draggable
      handle="#draggable-dialog"
      cancel='[class*="MuiDialogContent-root"]'
    >
      <Paper {...paperProps} />
    </Draggable>
  );
}
