import { Grid } from '@mui/material';
import { PlusIcon, XIcon } from 'lucide-react';
import { MouseEventHandler, type JSX } from 'react';
import CustomButton from '../Common/Button';

interface IAddGenesButtonsProps {
  anchorElGeneName: null | HTMLElement;
  anchorElPresetList: null | HTMLElement;
  viewPastedGeneList: boolean | null | HTMLElement;
  handleAddGene: MouseEventHandler<HTMLButtonElement>;
  handlePasteGene: MouseEventHandler<HTMLButtonElement>;
  handleAddGeneList: MouseEventHandler<HTMLButtonElement>;
  buttonClassOverride?: string;
}

export default function AddGenesButtons({
  anchorElGeneName,
  anchorElPresetList,
  viewPastedGeneList,
  handleAddGene,
  handlePasteGene,
  handleAddGeneList,
  buttonClassOverride = '',
}: IAddGenesButtonsProps): JSX.Element {
  return (
    <Grid container direction="row" style={{ marginTop: '16px' }}>
      <Grid size={{ sm: 4 }} style={{ display: 'flex', justifyContent: 'center' }}>
        <CustomButton
          variant="text"
          label="Add Gene"
          onClick={handleAddGene}
          className={buttonClassOverride}
          startIcon={anchorElGeneName ? <XIcon /> : <PlusIcon />}
        />
      </Grid>
      <Grid size={{ sm: 4 }} style={{ display: 'flex', justifyContent: 'center' }}>
        <CustomButton
          variant="text"
          label="Add gene list"
          onClick={handleAddGeneList}
          className={buttonClassOverride}
          startIcon={anchorElPresetList ? <XIcon /> : <PlusIcon />}
        />
      </Grid>
      <Grid size={{ sm: 4 }} style={{ display: 'flex', justifyContent: 'center' }}>
        <CustomButton
          variant="text"
          label="Paste gene list"
          onClick={handlePasteGene}
          className={buttonClassOverride}
          startIcon={viewPastedGeneList ? <XIcon /> : <PlusIcon />}
        />
      </Grid>
    </Grid>
  );
}
