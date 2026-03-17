import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState, type JSX } from 'react';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { IGene } from '@/types/Common.types';
import {
    Autocomplete,
    Grid, TextField,
} from '@mui/material';
import { FilePlus } from 'lucide-react';
import AddCircularButton from '../Buttons/AddCircularButton';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import CustomButton from '../Common/Button';
import CustomModal from '../Common/CustomModal';
import { CustomFileUpload } from '../Common/FileUpload';
import LabelledInputWrapper from '../Common/LabelledInputWrapper';
import { TPMPlotDialog } from './TMPPlotDialog/TPMPlotDialog';

export default function AddGene(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { rnaBiosample } = useAnalysisSet();

  const [geneAddOpen, setGeneAdd] = useState(false);
  const [geneOptions, setGeneOptions] = useState<Array<IGene>>([]);
  const [selectedGene, setSelectedGene] = useState<IGene | null>(null);
  const [plotOpen, setPlotOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onOpen = (): void => {
    setGeneAdd(true);
  };

  const onClose = (): void => {
    setGeneAdd(false);
    setSelectedFile(null);
    setSelectedGene(null);
  };

  const updateGeneOptions = useCallback(async (gene = 'A') => {
    try {
      const genes = await zeroDashSdk.gene.getGenes({ gene });
      setGeneOptions(genes);
    } catch (err) {
      setGeneOptions([]);
    }
  }, [zeroDashSdk.gene]);

  const uploadFile = async (): Promise<void> => {
    if (!selectedGene) {
      enqueueSnackbar('Please select a gene and file', { variant: 'error' });
    } else if (!rnaBiosample?.biosampleId) {
      enqueueSnackbar("Sample doesn't have an RNASeq id assigned yet", {
        variant: 'error',
      });
    } else if (!selectedFile) {
      enqueueSnackbar('Please upload a file before submitting', {
        variant: 'error',
      });
    } else {
      try {
        await zeroDashSdk.plots.postRNASeqGenePlot(
          selectedFile,
          rnaBiosample.biosampleId,
          selectedGene.geneId,
        );
        // make sure the row will appear in the tab
        await zeroDashSdk.rna.updateRnaSeq(
          { outlier: true },
          rnaBiosample.biosampleId,
          selectedGene.geneId,
        );
        onClose();
      } catch (err) {
        enqueueSnackbar('Could not upload file, please try again', { variant: 'error' });
      }
    }
  };

  // get default gene option when in initialization
  useEffect(() => {
    updateGeneOptions();
  }, [updateGeneOptions]);

  return (
    <>
      <AddCircularButton onClick={onOpen} />
      <CustomModal
        title="Add Gene"
        open={geneAddOpen}
        onClose={onClose}
        content={(
          <Grid container width="100%" spacing="8px" alignItems="flex-end">
            <Grid size={3}>
              <LabelledInputWrapper label="Gene">
                {geneAddOpen && (
                  <Autocomplete
                    options={geneOptions}
                    getOptionKey={(option: IGene): string => `add-gene-option-${option.geneId}-${option.gene}`}
                    getOptionLabel={(option: IGene): string => option.gene || ''}
                    onInputChange={(e, val): Promise<void> => updateGeneOptions(val)}
                    renderInput={(params): JSX.Element => (
                      <TextField {...params} fullWidth />
                    )}
                    onChange={(e, val): void => setSelectedGene(val)}
                    clearOnBlur
                    disableClearable
                    isOptionEqualToValue={
                      (option: IGene, val: IGene): boolean => option.gene === val.gene
                    }
                  />
                )}
              </LabelledInputWrapper>
            </Grid>
            <Grid size={selectedFile ? 9 : 6}>
              <CustomFileUpload
                key={selectedFile?.name ?? 'empty-file-selector'}
                label="Upload file or generate a new plot"
                size="small"
                value={selectedFile ? [selectedFile] : []}
                onChange={(files): void => setSelectedFile(files[0])}
                disabled={!selectedGene?.geneId}
              />
            </Grid>
            {!selectedFile && (
              <Grid size={3}>
                <CustomButton
                  label="Generate a plot"
                  variant="bold"
                  disabled={!selectedGene?.geneId}
                  onClick={(): void => setPlotOpen(true)}
                  startIcon={<FilePlus />}
                />
              </Grid>
            )}
            {plotOpen && selectedGene && (
              <TPMPlotDialog
                handleClose={(): void => setPlotOpen(false)}
                geneName={selectedGene.gene}
                geneId={selectedGene.geneId}
                handleSave={async (file): Promise<void> => setSelectedFile(file)}
              />
            )}
          </Grid>
        )}
        variant="create"
        buttonText={{ cancel: 'Discard', confirm: 'Add gene' }}
        confirmDisabled={!selectedFile}
        onConfirm={uploadFile}
      />
    </>
  );
}
