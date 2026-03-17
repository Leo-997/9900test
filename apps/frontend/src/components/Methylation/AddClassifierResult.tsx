import { Autocomplete, Grid, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useState, type JSX,
} from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IClassifierGroup } from '../../types/Methylation.types';
import AddCircularButton from '../Buttons/AddCircularButton';
import CustomModal from '../Common/CustomModal';
import CustomOutlinedInput from '../Common/Input';
import LabelledInputWrapper from '../Common/LabelledInputWrapper';
import type { IClassifierVersion } from '@/types/Classifiers.types';

interface IAddClassifierResultProps {
  getMethData: () => Promise<void>;
}

export default function AddClassifierResult({
  getMethData,
}: IAddClassifierResultProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const {
    methBiosample,
  } = useAnalysisSet();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: methBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [classifiers, setClassifiers] = useState<IClassifierVersion[]>([]);
  const [classifierGroups, setClassifierGroups] = useState<IClassifierGroup[]>([]);
  const [selectedClassifier, setSelectedClassifier] = useState<IClassifierVersion | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<IClassifierGroup | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;

  const onOpen = (): void => {
    setModalOpen(true);
  };

  const onClose = (): void => {
    setModalOpen(false);
  };

  const handleAddNewClassifierItem = async (): Promise<void> => {
    // when there is an valid new classifier item:
    try {
      if (
        methBiosample?.biosampleId
        && selectedGroup?.methGroupId
        && selectedClassifier?.id && score
      ) {
        await zeroDashSdk.methylation.createNewClassifierItem(
          methBiosample.biosampleId,
          {
            group: selectedGroup?.methGroupId,
            score,
            version: selectedClassifier?.id,
            interpretation: score >= 0.8 ? 'MATCH' : 'NO MATCH',
          },
        );
        setModalOpen(false);
        await getMethData();
      }
    } catch {
      enqueueSnackbar('Could not create classifier items, please try again', { variant: 'error' });
    }
  };

  const changeClassWithInput = useCallback(async (
    value: string,
  ): Promise<void> => {
    if (selectedClassifier) {
      try {
        const resp = await zeroDashSdk.methylation.getClassifierGroups({
          classifierId: selectedClassifier.id,
          search: value,
        });
        setClassifierGroups(resp);
      } catch {
        enqueueSnackbar('Could not load classifier groups, please try again.', { variant: 'error' });
      }
    }
  }, [selectedClassifier, zeroDashSdk.methylation, enqueueSnackbar]);

  useEffect(() => {
    async function getClassifiers(): Promise<void> {
      try {
        const resp = await zeroDashSdk.methylation.getClassifiers();
        setClassifiers(resp);
      } catch {
        enqueueSnackbar('Could not load classifier version options', { variant: 'error' });
      }
    }
    getClassifiers();
  }, [enqueueSnackbar, zeroDashSdk.methylation]);

  useEffect(() => {
    if (selectedClassifier) {
      changeClassWithInput('');
    } else {
      setSelectedGroup(null);
      setScore(null);
      setClassifierGroups([]);
    }
  }, [changeClassWithInput, selectedClassifier]);

  return (
    <>
      {canEdit
      && !isReadOnly
      && (
        <AddCircularButton onClick={onOpen} />
      )}
      <CustomModal
        title="Add Classifier Result"
        open={modalOpen}
        onClose={onClose}
        content={(
          <Grid container direction="column" gap="8px" spacing="16px">
            <Grid size={8}>
              <LabelledInputWrapper
                label="Classifier"
              >
                <Autocomplete
                  options={classifiers}
                  getOptionLabel={(classifier): string => `${classifier.description} version ${classifier.version}`}
                  getOptionKey={(classifier): string => classifier.id}
                  isOptionEqualToValue={
                    (option, value): boolean => option.id === value.id
                  }
                  renderInput={(params): JSX.Element => (
                    <TextField {...params} variant="outlined" />
                  )}
                  onChange={(e, value): void => setSelectedClassifier(value)}
                />
              </LabelledInputWrapper>
            </Grid>
            <Grid container width="100%">
              <Grid size={8}>
                <LabelledInputWrapper
                  label="Class"
                >
                  <Autocomplete
                    options={classifierGroups}
                    getOptionLabel={(option): string => option.groupName}
                    getOptionKey={(classifier): string => classifier.methGroupId}
                    isOptionEqualToValue={
                    (option, value): boolean => option.methGroupId === value.methGroupId
                  }
                    renderInput={(params): JSX.Element => (
                      <TextField {...params} variant="outlined" />
                    )}
                    onInputChange={(e, v) => { changeClassWithInput(v); }}
                    onChange={(e, value): void => setSelectedGroup(value)}
                  />
                </LabelledInputWrapper>
              </Grid>
              <Grid size={4}>
                <CustomOutlinedInput
                  label="Score"
                  type="number"
                  inputProps={{ step: '0.1', min: 0, max: 1 }}
                  onChange={(e): void => setScore(Number(e.target.value))}
                  error={score !== null && (score > 1 || score < 0)}
                  errorMessage={score !== null && (score > 1 || score < 0) ? 'Score must be between 0 and 1' : undefined}
                />
              </Grid>
            </Grid>
          </Grid>
        )}
        variant="create"
        confirmDisabled={
          !score
          || selectedClassifier === null
          || classifierGroups.length === 0
        }
        buttonText={{ confirm: 'Add classifier' }}
        onConfirm={() => { handleAddNewClassifierItem(); }}
      />
    </>
  );
}
