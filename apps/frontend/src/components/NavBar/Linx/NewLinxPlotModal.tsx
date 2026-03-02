import ChipsList from '@/components/Chips/ChipsList';
import CustomAutocomplete from '@/components/Common/Autocomplete';
import CustomModal from '@/components/Common/CustomModal';
import CustomGeneNameMenu from '@/components/GeneFilter/CustomGeneNameMenu';
import { GeneListsMenu } from '@/components/GeneFilter/GeneListsMenu';
import PasteGeneListMenu from '@/components/GeneFilter/PasteGeneListMenu';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import {
    Grid,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { Chromosome, IGene } from '../../../types/Common.types';
import { ISelectOption } from '../../../types/misc.types';
import CustomButton from '../../Common/Button';
import CustomTypography from '../../Common/Typography';
import AddGenesButtons from '../../GeneFilter/AddGenesButtons';

interface INewLinxPlotModal {
  open: boolean;
  closeModal: () => void;
}

export default function NewLinxPlotModal({
  open,
  closeModal,
}: INewLinxPlotModal): JSX.Element {
  const { primaryBiosample } = useAnalysisSet();
  const zeroDashSdk = useZeroDashSdk();

  const [selectedGenes, setSelectedGenes] = useState<IGene[]>([]);
  const [invalidGenes, setInvalidGenes] = useState<IGene[]>([]);

  const [anchorElGeneName, setAnchorElGeneName] = useState<null | HTMLElement>(
    null,
  );
  const [anchorElPresetList, setAnchorElPresetList] = useState<null | HTMLElement>(null);
  const [anchorElPasteGeneList, setAnchorElPasteGeneList] = useState<null | HTMLElement>(null);
  const [chromosome, setChromosome] = useState<Chromosome | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const getChromosomeOptions = (): ISelectOption<Chromosome>[] => {
    const allChromosomes: Chromosome[] = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13',
      '14', '15', '16', '17', '18', '19', '20', '21', '22', 'M', 'X', 'Y',
    ];

    const options: {name: Chromosome, value: Chromosome}[] = [];
    allChromosomes.forEach((chr) => {
      options.push({ name: chr, value: chr });
    });

    return options;
  };

  const handleDeleteSelectedGene = (geneId: string): void => {
    const updatedGenelist = selectedGenes.filter(
      (item: IGene) => item.gene !== geneId,
    );
    setSelectedGenes(updatedGenelist);
  };

  const handleDeleteInvalidGene = (geneId: string): void => {
    const updatedGenelist = invalidGenes.filter(
      (item: IGene) => item.gene !== geneId,
    );
    setInvalidGenes(updatedGenelist);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (primaryBiosample?.biosampleId) {
        await zeroDashSdk.plots.generateLinxPlot(
          primaryBiosample.biosampleId,
          selectedGenes,
          chromosome || undefined,
        );
      }
      enqueueSnackbar('Plot has been submitted and will be generated shortly', { variant: 'success' });
      closeModal();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('There was an issue generating the plot, please try again later', { variant: 'error' });
    }
  };

  const clearLists = (): void => {
    setSelectedGenes([]);
    setInvalidGenes([]);
  };

  useEffect(() => {
    if (open) {
      setChromosome(null);
      setSelectedGenes([]);
      setInvalidGenes([]);
    }
  }, [open]);

  return (
    <>
      <CustomModal
        open={open}
        onClose={closeModal}
        title="Generate LINX Plot"
        content={(
          <>
            <Grid container direction="column">
              <Grid container direction="row" justifyContent="space-between">
                <Grid size={12}>
                  <CustomTypography variant="label">
                    If a chromosome is not specified,
                    LINX will attempt to find the most relevant cluster ID for the plot.
                    If no cluster ID is found,
                    LINX will default to the chromosome of the first selected gene.
                  </CustomTypography>
                </Grid>
              </Grid>
              <Grid container direction="row" justifyContent="space-between">
                <Grid size={7}>
                  <CustomTypography variant="label">Sample ID</CustomTypography>
                  <CustomTypography>{primaryBiosample?.biosampleId}</CustomTypography>
                </Grid>
                <Grid size={4}>
                  <CustomAutocomplete<ISelectOption<Chromosome>, false, false, false>
                    label="Chromosome"
                    options={getChromosomeOptions()}
                    getOptionLabel={(option): string => option.name}
                    onChange={(e, newValue): void => setChromosome(newValue?.value || null)}
                  />
                </Grid>
              </Grid>
              <Grid container direction="row">
                <Grid size={4} style={{ paddingTop: '8px' }}>
                  <CustomTypography variant="label">
                    {`GENE(S)${selectedGenes.length > 0 ? ` | ${selectedGenes.length} GENES` : ''}`}
                  </CustomTypography>
                </Grid>
                <Grid size={8}>
                  <AddGenesButtons
                    anchorElGeneName={anchorElGeneName}
                    anchorElPresetList={anchorElPresetList}
                    viewPastedGeneList={anchorElPasteGeneList}
                    handleAddGene={(e): void => setAnchorElGeneName(e.currentTarget)}
                    handlePasteGene={(e): void => setAnchorElPasteGeneList(e.currentTarget)}
                    handleAddGeneList={(e): void => setAnchorElPresetList(e.currentTarget)}
                  />
                </Grid>
              </Grid>
              {
                invalidGenes.length > 0
                && (
                  <Grid container direction="row">
                    <Grid size={12}>
                      <ChipsList
                        type="error"
                        chips={invalidGenes.map((g) => ({
                          label: g.gene,
                          key: g.gene,
                        }))}
                        handleDelete={handleDeleteInvalidGene}
                        successTitle="CUSTOM GENE LIST"
                        errorTitle="THE FOLLOWING GENES COULD NOT BE ADDED AS THEY COULD NOT BE VALIDATED"
                      />
                    </Grid>
                  </Grid>
                )
              }
              {
                selectedGenes.length > 0
                && (
                  <Grid container direction="row">
                    <Grid size={12}>
                      <ChipsList
                        type="success"
                        chips={selectedGenes.map((g) => ({
                          label: g.gene,
                          key: g.gene,
                        }))}
                        handleDelete={handleDeleteSelectedGene}
                        successTitle="SELECTED GENES"
                      />
                    </Grid>
                  </Grid>
                )
              }
            </Grid>
            <Grid container direction="row">
              <CustomButton
                variant="subtle"
                label="Clear Genes"
                onClick={clearLists}
                disabled={(selectedGenes.length === 0 && invalidGenes.length === 0)}
              />
            </Grid>
          </>
        )}
        buttonText={{ confirm: 'Submit' }}
        variant="create"
        onConfirm={handleSubmit}
        confirmDisabled={selectedGenes.length === 0 && chromosome === null}
      />
      <CustomGeneNameMenu
        anchorElGeneName={anchorElGeneName}
        setAnchorElGeneName={setAnchorElGeneName}
        selectedGeneList={selectedGenes}
        setSelectedGeneList={setSelectedGenes}
      />
      <GeneListsMenu
        anchorEl={anchorElPresetList}
        setAnchorEl={setAnchorElPresetList}
        selectedGeneList={selectedGenes}
        setSelectedGeneList={setSelectedGenes}
      />
      <PasteGeneListMenu
        anchorElPasteGene={anchorElPasteGeneList}
        setAnchorElPasteGene={setAnchorElPasteGeneList}
        selectedGeneList={selectedGenes}
        setSelectedGeneList={setSelectedGenes}
        setInvalidGenes={setInvalidGenes}
      />
    </>
  );
}
