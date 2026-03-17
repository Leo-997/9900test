import { combinationTypes } from '@/constants/HTS/hts';
import { useCuration } from '@/contexts/CurationContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IDrugScreen } from '@/types/Drugs/Screen.types';
import { CombinationTypes, IHTSDrugCombination } from '@/types/HTS.types';
import { Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { v4 } from 'uuid';
import AddCircularButton from '../Buttons/AddCircularButton';
import CustomAutocomplete from '../Common/Autocomplete';
import CustomModal from '../Common/CustomModal';
import CustomOutlinedInput from '../Common/Input';
import LabelledInputWrapper from '../Common/LabelledInputWrapper';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

interface IProps {
  biosampleId: string;
  screens: IDrugScreen[];
  onCreateCombination: (newCombination: IHTSDrugCombination) => void;
}

export default function AddCombinationModal({
  screens,
  biosampleId,
  onCreateCombination,
}: IProps): JSX.Element {
  const { isAssignedCurator } = useCuration();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState<boolean>(false);
  const [combination, setCombination] = useState<Partial<IHTSDrugCombination>>({
    id: v4(),
  });

  const canAddCombination = useIsUserAuthorised('curation.sample.hts.write', isAssignedCurator);

  const createCombination = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...createCombinationBody } = combination;
    if (
      createCombinationBody.screenId1
      && createCombinationBody.screenId2
      && createCombinationBody.combinationEffect
    ) {
      try {
        // casting here because for some reason even though we are checking
        // that the properties are set, typescript still thinks they can be undefined
        const newId = await zeroDashSdk.hts.createDrugCombination(
          biosampleId,
          createCombinationBody as Omit<IHTSDrugCombination, 'id'>,
        );
        onCreateCombination({
          ...createCombinationBody,
          id: newId,
        } as IHTSDrugCombination);
        setOpen(false);
      } catch {
        enqueueSnackbar('Could not create new combination, please try again', { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    if (combination.screenId1) {
      zeroDashSdk.hts.getHTSResultById(biosampleId, combination.screenId1)
        .then((resp) => (
          setCombination((prev) => ({
            ...prev,
            effectCmaxScreen1: resp.effectCmax,
            effectCssScreen1: resp.effectCss,
          }))
        ));
    } else {
      setCombination((prev) => ({
        ...prev,
        effectCmaxScreen1: null,
        effectCssScreen1: null,
      }));
    }
  }, [biosampleId, combination.screenId1, zeroDashSdk.hts]);

  useEffect(() => {
    if (combination.screenId2) {
      zeroDashSdk.hts.getHTSResultById(biosampleId, combination.screenId2)
        .then((resp) => (
          setCombination((prev) => ({
            ...prev,
            effectCmaxScreen2: resp.effectCmax,
            effectCssScreen2: resp.effectCss,
          }))
        ));
    } else {
      setCombination((prev) => ({
        ...prev,
        effectCmaxScreen2: null,
        effectCssScreen2: null,
      }));
    }
  }, [biosampleId, combination.screenId2, zeroDashSdk.hts]);

  return (
    <>
      {canAddCombination && (
        <AddCircularButton
          onClick={(): void => setOpen(true)}
        />
      )}
      <CustomModal
        open={open}
        onClose={(): void => setOpen(false)}
        buttonText={{
          confirm: 'Create combination',
        }}
        confirmDisabled={
          !combination.screenId1
          || !combination.screenId2
          || !combination.combinationEffect
        }
        onConfirm={createCombination}
        title="Add drug combination"
        content={(
          <Grid key={combination.id} container direction="column" spacing={1}>
            <Grid
              spacing={2}
              container
              direction="column"
            >
              <Grid container>
                <Grid size={4}>
                  <CustomAutocomplete
                    label="Drug 1 *"
                    getOptionKey={(o): string => o.id}
                    options={
                      screens.sort(
                        (a, b) => a.drugName.toLowerCase().localeCompare(b.drugName.toLowerCase()),
                      )
                    }
                    getOptionLabel={(screen): string => screen.drugName}
                    onChange={(e, v): void => {
                      setCombination((prev) => ({ ...prev, screenId1: v?.id }));
                    }}
                  />
                </Grid>
                <Grid size={4}>
                  <CustomOutlinedInput
                    label="Drug 1 % effect at CSS"
                    type="number"
                    value={combination.effectCssScreen1}
                    onChange={(e): void => {
                      setCombination((prev) => ({
                        ...prev,
                        effectCssScreen1: parseFloat(e.target.value),
                      }));
                    }}
                  />
                </Grid>
                <Grid size={4}>
                  <CustomOutlinedInput
                    label="Drug 1 % effect at Cmax"
                    type="number"
                    value={combination.effectCmaxScreen1}
                    onChange={(e): void => {
                      setCombination((prev) => ({
                        ...prev,
                        effectCmaxScreen1: parseFloat(e.target.value),
                      }));
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container>
                <Grid size={4}>
                  <CustomAutocomplete
                    label="Drug 2 *"
                    getOptionKey={(o): string => o.id}
                    options={
                      screens.sort(
                        (a, b) => a.drugName.toLowerCase().localeCompare(b.drugName.toLowerCase()),
                      )
                    }
                    getOptionLabel={(screen): string => screen.drugName}
                    onChange={(e, v): void => {
                      setCombination((prev) => ({ ...prev, screenId2: v?.id }));
                    }}
                  />
                </Grid>
                <Grid size={4}>
                  <CustomOutlinedInput
                    label="Drug 2 % effect at CSS"
                    type="number"
                    value={combination.effectCssScreen2}
                    onChange={(e): void => {
                      setCombination((prev) => ({
                        ...prev,
                        effectCssScreen2: parseFloat(e.target.value),
                      }));
                    }}
                  />
                </Grid>
                <Grid size={4}>
                  <CustomOutlinedInput
                    label="Drug 2 % effect at Cmax"
                    type="number"
                    value={combination.effectCmaxScreen2}
                    onChange={(e): void => {
                      setCombination((prev) => ({
                        ...prev,
                        effectCmaxScreen2: parseFloat(e.target.value),
                      }));
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container>
                <Grid size={4}>
                  <LabelledInputWrapper label="Combination effect">
                    <AutoWidthSelect
                      options={combinationTypes.map((type) => ({
                        name: type,
                        value: type,
                      }))}
                      onChange={(e): void => setCombination((prev) => ({
                        ...prev,
                        combinationEffect: e.target.value as CombinationTypes,
                      }))}
                    />
                  </LabelledInputWrapper>
                </Grid>
                <Grid size={4}>
                  <CustomOutlinedInput
                    label="Combination % effect at CSS"
                    type="number"
                    value={combination.effectCssCombo}
                    onChange={(e): void => {
                      setCombination((prev) => ({
                        ...prev,
                        effectCssCombo: parseFloat(e.target.value),
                      }));
                    }}
                  />
                </Grid>
                <Grid size={4}>
                  <CustomOutlinedInput
                    label="Combination % effect at Cmax"
                    type="number"
                    value={combination.effectCmaxCombo}
                    onChange={(e): void => {
                      setCombination((prev) => ({
                        ...prev,
                        effectCmaxCombo: parseFloat(e.target.value),
                      }));
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      />
    </>
  );
}
