import SplitPageDialog, { ISplitPageDialogRef } from '@/layouts/FullScreenLayout/SplitPageDialog';
import { useClinical } from '@/contexts/ClinicalContext';
import { useRef, useEffect, type JSX } from 'react';
import { ArchiveTabs } from '@/types/MTB/Archive.types';
import { useMTBArchive } from '@/contexts/MTBArchiveContext';
import NavBar from '@/components/MTB/NavBar/Modal/NavBar';
import ArchiveRightPanel from './ArchiveRightPanel';
import ArchiveLeftPanel from './ArchiveLeftPanel';

interface IProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: ArchiveTabs;
}

export function MTBArchiveDialog({
  open,
  onClose,
  defaultTab = 'SLIDES',
}: IProps): JSX.Element {
  const {
    clinicalVersion,
  } = useClinical();
  const { selectedSample } = useMTBArchive();

  const dialogRef = useRef<ISplitPageDialogRef | null>(null);

  useEffect(() => {
    if (selectedSample && dialogRef.current) {
      dialogRef.current.collapseLeftPanel();
    }
  }, [selectedSample]);

  return (
    <SplitPageDialog
      ref={dialogRef}
      navBar={(
        <NavBar
          status={clinicalVersion.status}
          returnFn={onClose}
        />
      )}
      open={open}
      onClose={onClose}
      flexibleWidths
      leftPanelContent={(
        <ArchiveLeftPanel />
      )}
      rightPanelContent={(
        <ArchiveRightPanel defaultTab={defaultTab} />
      )}
    />
  );
}
