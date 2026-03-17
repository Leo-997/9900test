import {
    Grid,
} from '@mui/material';
import { Dispatch, SetStateAction, type JSX } from 'react';
import { IGene } from '../../types/Common.types';
import CustomTypography from '../Common/Typography';
import { PasteGeneInput } from './PasteGeneInput';

interface IPasteGeneListProps {
  selectedGeneList: IGene[];
  setSelectedGeneList: Dispatch<SetStateAction<IGene[]>>;
  setInvalidGenes: Dispatch<SetStateAction<IGene[]>>;
}

export default function PasteGeneList({
  selectedGeneList,
  setSelectedGeneList,
  setInvalidGenes,
}: IPasteGeneListProps): JSX.Element {
  return (
    <Grid container direction="column" width="500px" padding="0px 16px">
      <Grid>
        <CustomTypography variant="label">
          PASTE GENE LIST
        </CustomTypography>
        <CustomTypography variant="bodySmall">
          Add gene names, separated by semicolon ( ; ) or on their own
          individual lines separated by enter/return in the field below. This
          will be added to custom gene group allowing you to view all
          mutations / variants related to the genes of interest
        </CustomTypography>
      </Grid>
      <Grid>
        <PasteGeneInput
          selectedGeneList={selectedGeneList}
          setSelectedGeneList={setSelectedGeneList}
          setInvalidGenes={setInvalidGenes}
        />
      </Grid>
    </Grid>
  );
}
