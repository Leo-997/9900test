import { ActiveSlideProvider } from '../../../contexts/ActiveSlideContext';
import { MTBArchiveProvider } from '../../../contexts/MTBArchiveContext';
import { ArchiveTabs } from '../../../types/MTB/Archive.types';
import { MTBArchiveDialog } from './Components/Archive/MTBArchiveDialog';

import type { JSX } from "react";

interface IProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: ArchiveTabs;
  isReportArchive?: boolean;
}

export default function MTBArchive({
  open,
  onClose,
  defaultTab = 'SLIDES',
  isReportArchive = false,
}: IProps): JSX.Element {
  return (
    <ActiveSlideProvider>
      <MTBArchiveProvider
        isReportArchive={isReportArchive}
      >
        <MTBArchiveDialog open={open} onClose={onClose} defaultTab={defaultTab} />
      </MTBArchiveProvider>
    </ActiveSlideProvider>
  );
}
