import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import {
  Popover,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IGene } from '../../types/Common.types';
import CustomAutocomplete from '../Common/Autocomplete';
import { TPMPlotDialog } from '../RNASeq/TMPPlotDialog/TPMPlotDialog';

const useStyles = makeStyles(() => ({
  autocompleteRoot: {
    paddingTop: '3px !important',
    paddingBottom: '3px !important',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1E86FC',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1E86FC',
    },
  },
  autoCompletePopperDisablePortal: {
    position: 'relative',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiPaper-elevation1': {
      boxShadow: 'none',
    },
  },
}));

interface IProps {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
}

export default function RNAExpressionGeneSelection({
  open,
  anchorEl,
  onClose,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { rnaBiosample } = useAnalysisSet();

  const [geneOptions, setGeneOptions] = useState<IGene[]>([]);
  const [selectedGene, setSelectedGene] = useState<IGene | null>(null);

  const updateGeneOptions = useCallback(async (gene = 'A') => {
    try {
      const genes = await zeroDashSdk.gene.getGenes({ gene });
      setGeneOptions(genes);
    } catch (err) {
      console.error(err);
      setGeneOptions([]);
    }
  }, [zeroDashSdk.gene]);

  useEffect(() => {
    updateGeneOptions();
  }, [updateGeneOptions]);

  const handleSaveGeneratedPlot = async (file: File): Promise<void> => {
    if (selectedGene?.geneId && rnaBiosample?.biosampleId) {
      await zeroDashSdk.plots.postRNASeqGenePlot(
        file,
        rnaBiosample.biosampleId,
        selectedGene.geneId,
      );
      // make sure the row will appear in the tab
      await zeroDashSdk.rna.updateRnaSeq(
        { outlier: true },
        rnaBiosample.biosampleId,
        selectedGene.geneId,
      );
    }
  };

  return (
    <>
      <Popover
        open={open}
        onClose={onClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            width: '300px',
            padding: '8px 8px 8px 8px',
          },
        }}
      >
        <CustomAutocomplete
          open
          disablePortal
          options={geneOptions}
          getOptionLabel={(gene): string => gene.gene}
          onInputChange={(e, value): void => {
            updateGeneOptions(value);
          }}
          value={selectedGene}
          isOptionEqualToValue={(o): boolean => o.geneId === selectedGene?.geneId}
          onChange={(e, gene): void => setSelectedGene(gene)}
          classes={{
            inputRoot: classes.autocompleteRoot,
            popperDisablePortal: classes.autoCompletePopperDisablePortal,
          }}
        />
      </Popover>
      {selectedGene && (
        <TPMPlotDialog
          handleClose={(): void => {
            setSelectedGene(null);
            onClose();
          }}
          geneName={selectedGene.gene}
          geneId={selectedGene.geneId}
          handleSave={handleSaveGeneratedPlot}
        />
      )}
    </>
  );
}
