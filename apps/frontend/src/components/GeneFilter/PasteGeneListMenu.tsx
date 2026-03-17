import {
  Menu,
} from '@mui/material';
import { Dispatch, SetStateAction, type JSX } from 'react';
import { IGene } from '../../types/Common.types';
import PasteGeneList from './PasteGeneList';

interface IPasteGeneListModalProps {
  anchorElPasteGene: null | HTMLElement;
  setAnchorElPasteGene: Dispatch<SetStateAction<HTMLElement | null>>;
  selectedGeneList: IGene[];
  setSelectedGeneList: Dispatch<SetStateAction<IGene[]>>;
  setInvalidGenes: Dispatch<SetStateAction<IGene[]>>
}

export default function PasteGeneListModal({
  anchorElPasteGene,
  setAnchorElPasteGene,
  selectedGeneList,
  setSelectedGeneList,
  setInvalidGenes,
}: IPasteGeneListModalProps): JSX.Element {
  const handleClose = (): void => {
    setAnchorElPasteGene(null);
  };

  return (
    <Menu
      anchorEl={anchorElPasteGene}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={Boolean(anchorElPasteGene)}
      onClose={handleClose}
      autoFocus={false}
      disableAutoFocusItem={false}
      disableRestoreFocus
    >
      <PasteGeneList
        selectedGeneList={selectedGeneList}
        setSelectedGeneList={setSelectedGeneList}
        setInvalidGenes={setInvalidGenes}
      />
    </Menu>
  );
}
