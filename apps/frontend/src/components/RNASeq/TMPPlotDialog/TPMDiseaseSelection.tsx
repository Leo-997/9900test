import {
  Autocomplete,
  Box, Checkbox, FormControlLabel, TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  Dispatch, ReactNode, SetStateAction, useEffect, useState, type JSX,
} from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { useCuration } from '../../../contexts/CurationContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { ISelectOption } from '../../../types/misc.types';
import ItemButton from '../../Buttons/ItemButton';
import CustomButton from '../../Common/Button';
import ColumnHeading from '../../CurationCards/Common/ColumnHeading';

interface IProps {
  geneName: string;
  title: ReactNode;
  setUrl: Dispatch<SetStateAction<string | undefined>>;
  handleSave: (file: File) => Promise<void>;
  loading: boolean;
  interactiveMode?: boolean;
  showCategory: boolean;
  setShowCategory: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  selectedSubcat2: string | undefined;
  setSelectedSubcat2: Dispatch<SetStateAction<string | undefined>>;
  selectedCategory: string | undefined;
  setSelectedCategory: Dispatch<SetStateAction<string | undefined>>;
}

export function TPMDiseaseSelection({
  geneName,
  title,
  setUrl,
  handleSave,
  loading,
  showCategory,
  setShowCategory,
  setLoading,
  interactiveMode,
  selectedSubcat2,
  setSelectedSubcat2,
  selectedCategory,
  setSelectedCategory,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const { analysisSet, rnaBiosample } = useAnalysisSet();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: rnaBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [plot, setPlot] = useState<File>();
  const [hideCohort, setHideCohort] = useState<boolean>(false);
  const [subcat2Search, setSubcat2Search] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [subcat2, setSubcat2] = useState<string[]>([]);

  const canEdit = useIsUserAuthorised('curation.sample.download', isAssignedCurator);

  const generatePlot = async (): Promise<void> => {
    setLoading(true);
    if (rnaBiosample?.biosampleId && selectedSubcat2) {
      try {
        const generatedPlot = await zeroDashSdk.rna.generateTPMPlot({
          rnaSeqId: rnaBiosample?.biosampleId,
          gene: geneName,
          zero2Subcat2: selectedSubcat2,
          showCategory,
          zero2Category: showCategory ? selectedCategory : 'Cohort',
          hideCohort: showCategory && hideCohort,
        });
        setPlot(
          new File(
            [generatedPlot],
            `${rnaBiosample?.biosampleId}-${geneName}-${selectedSubcat2}.png`,
          ),
        );
        setUrl(URL.createObjectURL(generatedPlot));
      } catch (err) {
        enqueueSnackbar('There was an error generating the plot', { variant: 'error' });
      }
    }
    setLoading(false);
  };

  const savePlot = async (): Promise<void> => {
    if (plot) {
      try {
        await handleSave(plot);
        enqueueSnackbar('Plot saved!', { variant: 'success' });
      } catch (err) {
        enqueueSnackbar('There was an error saving the plot', { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    zeroDashSdk.curation.analysisSets.getZero2Categories()
      .then((resp) => setCategories(resp));
  }, [zeroDashSdk.curation.analysisSets]);

  useEffect(() => {
    zeroDashSdk.curation.analysisSets.getZero2Subcategory2()
      .then((resp) => setSubcat2(resp));
  }, [zeroDashSdk.curation.analysisSets]);

  useEffect(() => {
    if (!showCategory) {
      setSelectedCategory(analysisSet?.zero2Category);
    }
  }, [showCategory, analysisSet?.zero2Category, setSelectedCategory]);

  return (
    <ItemButton
      isActive
      mainText={title}
      additionalContent={(
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          gap="16px"
          paddingTop="16px"
        >
          <Box>
            <ColumnHeading text="ZERO2 Subcategory 2" />
            <Autocomplete
              id="get-subcat2-autocomplete"
              options={
                subcat2
                  .filter((o) => o.toLowerCase().includes(subcat2Search.toLowerCase()))
                  .map((d) => ({ name: d, value: d }))
              }
              defaultValue={{
                name: analysisSet.zero2Subcategory2,
                value: analysisSet.zero2Subcategory2,
              }}
              getOptionLabel={(option: ISelectOption<string>): string => option.name || ''}
              isOptionEqualToValue={(option, value): boolean => option.value === value.value}
              onInputChange={(e, val): void => setSubcat2Search(val)}
              onChange={(e, val): void => setSelectedSubcat2(val.value)}
              renderInput={(params): ReactNode => (
                <TextField {...params} variant="outlined" fullWidth />
              )}
              clearOnBlur
              disableClearable
            />
          </Box>
          <FormControlLabel
            value={showCategory}
            control={(
              <Checkbox
                checked={showCategory}
                onChange={(): void => setShowCategory((p) => !p)}
              />
            )}
            label="Show category"
            labelPlacement="end"
          />
          {showCategory && (
            <>
              <Box>
                <ColumnHeading text="ZERO2 Category" />
                <Autocomplete
                  id="get-category-autocomplete"
                  options={
                    categories
                      .filter((o) => o.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map((d) => ({ name: d, value: d }))
                  }
                  defaultValue={{
                    name: analysisSet.zero2Category,
                    value: analysisSet.zero2Category,
                  }}
                  getOptionLabel={(option: ISelectOption<string>): string => option.name || ''}
                  isOptionEqualToValue={(option, value): boolean => option.value === value.value}
                  onInputChange={(e, val): void => setCategorySearch(val)}
                  onChange={(e, val): void => setSelectedCategory(val.value)}
                  renderInput={(params): ReactNode => (
                    <TextField {...params} variant="outlined" fullWidth />
                  )}
                  clearOnBlur
                  disableClearable
                />
              </Box>
              { !interactiveMode && (
              <FormControlLabel
                value={hideCohort}
                control={(
                  <Checkbox
                    checked={hideCohort}
                    onChange={(): void => setHideCohort((p) => !p)}
                  />
                )}
                label="Hide cohort"
                labelPlacement="end"
              />
              )}
            </>
          )}
          { !interactiveMode && (
          <Box display="flex" width="100%" gap="16px">
            <CustomButton
              variant="bold"
              label="Generate plot"
              size="small"
              onClick={generatePlot}
              disabled={!selectedSubcat2}
              loading={loading}
              style={{ minWidth: '120px' }}
            />
            {canEdit && !isReadOnly && (
              <CustomButton
                variant="outline"
                label="Save"
                size="small"
                onClick={savePlot}
                disabled={!plot}
                style={{ minWidth: '65px' }}
              />
            )}
          </Box>
          )}
        </Box>
      )}
    />
  );
}
