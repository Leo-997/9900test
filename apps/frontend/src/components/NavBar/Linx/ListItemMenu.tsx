import { Menu, MenuItem } from '@mui/material';
import type { JSX } from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '../../../contexts/CurationContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { LinxPlot } from '../../../types/Plot.types';

interface IListItemMenuProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  plot: LinxPlot;
  deletePlot: (plot: LinxPlot) => void;
}

export function ListItemMenu({
  anchorEl,
  handleClose,
  plot,
  deletePlot,
}: IListItemMenuProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly } = useCuration();

  const canEdit = useIsUserAuthorised('curation.sample.download', isAssignedCurator);

  const handleDownload = async (linxPlot: LinxPlot): Promise<void> => {
    const urls = await zeroDashSdk.filetracker.generateDownloadURLs([linxPlot.fileId]);
    const element = document.createElement('a');
    element.href = urls[0].url;
    element.download = 'plot.png';
    element.target = '_blank';
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <>
        <MenuItem
          onClick={(): void => {
            handleDownload(plot);
            handleClose();
          }}
          disabled={!canEdit}
        >
          Download
        </MenuItem>
        <MenuItem
          onClick={(): void => {
            deletePlot(plot);
            handleClose();
          }}
          disabled={!canEdit || isReadOnly}
        >
          Delete
        </MenuItem>
      </>
    </Menu>
  );
}
