import NavBar from '@/components/MTB/NavBar/Modal/NavBar';
import { Dialog } from '@mui/material';
import { ItemSelectLayout } from '../../../../../../layouts/FullScreenLayout/ItemSelectLayout';
import ReportsContent from '../../../../../NavBar/Reports/ReportsContent';
import ReportsLeftPane from '../../../../../Reports/Components/Navigation/ReportsLeftPane';

import type { JSX } from "react";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export default function ReportsDialog({
  open,
  onClose,
}: IProps): JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      fullWidth
      disableRestoreFocus
      disableAutoFocus
      disableEnforceFocus
      disableEscapeKeyDown
      slotProps={{
        paper: {
          sx: {
            width: '100vw',
            maxWidth: '100vw',
            height: '100vh',
            maxHeight: '100vh',
            borderRadius: 0,
          },
        },
      }}
    >
      <ItemSelectLayout
        mainContent={<ReportsContent />}
        navBar={(
          <NavBar returnFn={onClose} />
        )}
        leftPaneNodes={(
          <ReportsLeftPane />
        )}
      />
    </Dialog>
  );
}
