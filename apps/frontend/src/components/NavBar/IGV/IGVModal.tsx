import {
  Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useMemo, useState, type JSX,
} from 'react';
import CustomAutocomplete from '@/components/Common/Autocomplete';
import CustomModal from '@/components/Common/CustomModal';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IBiosample, SampleType } from '@/types/Analysis/Biosamples.types';
import mapEvent from '@/utils/functions/mapEvent';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IGene } from '../../../types/Common.types';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles(() => ({
  snackbar: {
    maxWidth: '500px',
    minHeight: '64px',
    height: '100% !important',
  },
}));

interface IIGVModal {
  open: boolean;
  closeModal: () => void;
}

export default function IGVModal({
  open,
  closeModal,
}: IIGVModal): JSX.Element {
  const classes = useStyles();
  const {
    tumourBiosample, germlineBiosample, rnaBiosample, analysisSet,
  } = useAnalysisSet();
  const zeroDashSdk = useZeroDashSdk();

  const { enqueueSnackbar } = useSnackbar();
  const [locus, setLocus] = useState<string>('TP53');
  const [locusOptions, setLocusOptions] = useState<IGene[]>([]);
  const [analysisSetInputValue, setAnalysisSetInputValue] = useState<string>('');
  const [biosampleInputValue, setBiosampleInputValue] = useState<string>('');
  const [analysisSetList, setAnalysisSetList] = useState<IAnalysisSet[]>([]);
  const [biosampleList, setBiosampleList] = useState<IBiosample[]>([]);
  const [selectedSets, setSelectedSets] = useState<IAnalysisSet[]>([analysisSet]);
  const [selectedSamples, setSelectedSamples] = useState<IBiosample[]>([
    ...(tumourBiosample ? [tumourBiosample] : []),
    ...(germlineBiosample ? [germlineBiosample] : []),
    ...(rnaBiosample ? [rnaBiosample] : []),
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const updateLocusOptions = useCallback(async (loc = '') => {
    try {
      const loci = await zeroDashSdk.gene.getGenes({ gene: loc });
      setLocusOptions(loci);
    } catch (err) {
      console.error(err);
      setLocusOptions([]);
    }
  }, [zeroDashSdk.gene]);

  const sampleTypes: SampleType[] = useMemo(() => ['rnaseq', 'wgs', 'panel'], []);

  const getAnalysisSets = useCallback((search?: string) => {
    zeroDashSdk
      .curation
      .analysisSets
      .getAnalysisSets(
        { search: search ? [search] : undefined },
        1,
        20,
      ).then(setAnalysisSetList);
  }, [zeroDashSdk.curation.analysisSets]);

  const getBiosamples = useCallback((search?: string) => {
    zeroDashSdk
      .curation
      .biosamples
      .getBiosamples(
        {
          search: search ? [search] : undefined,
          sampleTypes,
        },
        1,
        20,
      ).then(setBiosampleList);
  }, [zeroDashSdk.curation.biosamples, sampleTypes]);

  const handleSelectLocus = (loc: string): void => {
    setLocus(loc);
  };

  const changeLocusWithInput = (
    event: object,
    value: string,
  ): Promise<void> => updateLocusOptions(value);

  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      const resp = await zeroDashSdk.igv.getSampleLinks({
        sampleIds: selectedSamples.map((s) => s.biosampleId),
      });

      // Generate file structure
      const xml = '<?xml version="1.0" ?>\n'
        + `<Global name="${tumourBiosample?.patientId}" genome="hg38" locus="${locus}" version="3">\n`
        + '\t<Resources>\n'
        + `${resp.links.map((link) => `\t\t<Resource name="${link.biosampleId}" path="${link.pathUrl.replace(/&/g, '&amp;')}" index="${link.indexUrl.replace(/&/g, '&amp;')}" ${link.coverageUrl !== undefined ? `coverage="${link.coverageUrl.replace(/&/g, '&amp;')}"` : ''}/>\n`).join('')}`
        + '\t</Resources>\n'
        + '</Global>';

      const element = document.createElement('a');
      const file = new Blob([xml], {
        type: 'application/xml',
      });
      element.href = URL.createObjectURL(file);
      element.download = `${tumourBiosample?.patientId}.xml`;
      document.body.appendChild(element);
      element.click();
      element.remove();

      if (resp.invalidSamples.length > 0) {
        enqueueSnackbar(
          (
            <p>
              File generated, but missing samples:
              <br />
              {resp.invalidSamples.map((m) => (
                <>
                  {m}
                  <br />
                </>
              ))}
            </p>
          ),
          {
            variant: 'warning',
            className: classes.snackbar,
          },
        );
      } else {
        enqueueSnackbar('XML Session file generated successfully', { variant: 'success' });
      }

      setLoading(false);
      closeModal();
    } catch {
      enqueueSnackbar('Error loading IGV files. Please try again', { variant: 'error' });
      setLoading(false);
    }
  };

  // Fetch initial locus list
  useEffect(() => {
    updateLocusOptions();
  }, [updateLocusOptions]);

  // Fetch initial sample list
  useEffect(() => {
    getAnalysisSets();
  }, [getAnalysisSets]);

  useEffect(() => {
    getBiosamples();
  }, [getBiosamples]);

  return (
    <CustomModal
      title="Generate XML Session File"
      open={open}
      onClose={closeModal}
      buttonText={{ cancel: 'Close', confirm: 'Generate Session File' }}
      confirmDisabled={loading}
      onConfirm={handleSubmit}
      variant="create"
      content={(
        <Grid container direction="column" gap="16px">
          <Grid container direction="row" justifyContent="space-between">
            <Grid size={12}>
              <CustomTypography variant="label">
                Tumour and normal bam/bai files will be added for each sample selected
                (in addition to the current Sample)
                <br />
              </CustomTypography>
            </Grid>
          </Grid>
          <Grid container direction="row" spacing={2} size={10}>
            <Grid size={6}>
              <CustomTypography variant="label" truncate>Current Case</CustomTypography>
              <CustomTypography truncate>{`${analysisSet.patientId} - ${mapEvent(analysisSet.sequencedEvent, true)}`}</CustomTypography>
            </Grid>
            <Grid size={3}>
              <CustomAutocomplete<IGene, false, true, false>
                label="Locus"
                id="get-locus-autocomplete"
                options={locusOptions}
                defaultValue={{ gene: 'TP53', geneId: 60 }}
                getOptionLabel={(option: IGene): string => option.gene || ''}
                isOptionEqualToValue={(option: IGene, value: IGene): boolean => (
                  option.gene === value.gene
                )}
                onInputChange={changeLocusWithInput}
                onChange={(e, val): void => handleSelectLocus(val?.gene || '')}
                clearOnBlur
                disableClearable
              />
            </Grid>
          </Grid>
          <Grid container direction="row" style={{ marginTop: '54px' }}>
            <CustomTypography variant="label">
              The IGV session file will be generated for the samples shown in the
              &lsquo;select by biosample ID&rsquo; dropdown
            </CustomTypography>
          </Grid>
          <Grid container direction="row">
            <Grid size={10}>
              <Grid container direction="row" justifyContent="flex-end" spacing={2}>
                <Grid size={6}>
                  <CustomAutocomplete
                    label="Select by Event"
                    options={analysisSetList}
                    getOptionLabel={(option: IAnalysisSet): string => `${option.patientId} - ${mapEvent(option.sequencedEvent, true)}`}
                    getOptionKey={(option): string => option.analysisSetId}
                    inputValue={analysisSetInputValue}
                    onInputChange={(e, v, reason): void => {
                      if (reason === 'input') {
                        setAnalysisSetInputValue(v);
                        getAnalysisSets(v);
                      }
                    }}
                    disableClearable
                    disableCloseOnSelect
                    multiple
                    value={selectedSets}
                    onChange={(event, value, reason, details): void => {
                      setSelectedSets(value);
                      if (reason === 'selectOption') {
                        setSelectedSamples((prev) => {
                          const newSamples = [
                            ...prev,
                            ...(details
                              ?.option
                              .biosamples
                              ?.filter((b) => sampleTypes.includes(b.sampleType)) || []),
                          ];
                          return newSamples.filter((elem, index, self) => (
                            self.findIndex((e) => e.biosampleId === elem.biosampleId) === index
                          ));
                        });
                      } else if (reason === 'removeOption') {
                        setSelectedSamples((prev) => prev.filter((elem) => (
                          !details?.option.biosamples?.map((b) => b.biosampleId)
                            .includes(elem.biosampleId)
                        )));
                      }
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <CustomAutocomplete
                    label="Select by Biosample ID"
                    options={biosampleList}
                    getOptionLabel={(option: IBiosample): string => option.biosampleId}
                    getOptionKey={(option): string => option.biosampleId}
                    inputValue={biosampleInputValue}
                    onInputChange={(e, v, reason): void => {
                      if (reason === 'input') {
                        setBiosampleInputValue(v);
                        getBiosamples(v);
                      }
                    }}
                    disableCloseOnSelect
                    disableClearable
                    multiple
                    value={selectedSamples}
                    onChange={(e, v): void => {
                      setSelectedSamples(v);
                      setSelectedSets(
                        (prev) => prev
                          .filter((a) => (
                            a.biosamples
                              ?.filter((b) => sampleTypes.includes(b.sampleType))
                              .every((b) => v.map((vb) => vb.biosampleId).includes(b.biosampleId))
                          )),
                      );
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    />
  );
}
