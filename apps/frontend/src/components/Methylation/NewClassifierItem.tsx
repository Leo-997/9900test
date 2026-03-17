import { Box, SelectChangeEvent } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import React, {
  useCallback, useEffect, useState, type JSX,
} from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IClassifierGroup, IClassifierResult } from '../../types/Methylation.types';
import CustomAutocomplete from '../Common/Autocomplete';
import ColumnHeading from '../CurationCards/Common/ColumnHeading';
import OutlinedInput from '../Input/OutlinedTextInput';
import Select from '../Input/Select';
import type { IClassifierVersion } from '@/types/Classifiers.types';

const useStyles = makeStyles(() => ({
  groupInputContainer: {
    width: '80%',
  },
  scoreInputContainer: {
    width: '20%',
    minWidth: '150px',
  },
  heading: {
    marginBottom: '14px',
  },
  autocompleteRoot: {

    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1E86FC',
    },

    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1E86FC',
    },
  },
  autoCompleteOption: {

    '&.MuiAutocomplete-option[data-focus="true"]': {
      backgroundColor: '#F3F7FF',
    },

    '&.MuiAutocomplete-option[aria-selected="true"]': {
      backgroundColor: '#F3F7FF',
    },
  },
  classifierVersion: {
    overflowY: 'auto',
    width: '100%',
    height: '56px',

    '&.MuiOutlinedInput-root': {

      '&:hover fieldset': {
        borderColor: '#1E86FC',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#1E86FC',
      },

      '& .MuiSelect-select': {

        '&:hover': {
          backgroundColor: '#FFF',
        },

        '&:focus': {
          border: 'none',
        },
      },

    },
  },

  versionItem: {
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
  },
}));

interface IProps {
  item: IClassifierResult;
  updateNewMethylationInputs: (data: IClassifierResult) => void;
}

export function NewClassifierItem({
  item,
  updateNewMethylationInputs,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const [classifiers, setClassifiers] = useState<IClassifierVersion[]>([]);
  const [selectedClassifier, setSelectedClassifier] = useState<string>();
  const [classifierGroups, setClassifierGroups] = useState<IClassifierGroup[]>([]);

  const changeClassWithInput = useCallback(async (
    value: string,
  ): Promise<void> => {
    if (selectedClassifier) {
      try {
        const resp = await zeroDashSdk.methylation.getClassifierGroups({
          classifierId: selectedClassifier,
          search: value,
        });
        setClassifierGroups(resp);
      } catch {
        enqueueSnackbar('Could not load classifier groups, please try again.', { variant: 'error' });
      }
    }
  }, [selectedClassifier, zeroDashSdk.methylation, enqueueSnackbar]);

  const handleClassifierChange = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    const classifierId = event.target.value as string;
    setSelectedClassifier(classifierId);
    updateNewMethylationInputs({ ...item, version: classifierId });
  };

  const handleOnChangeOptions = (
    event: React.ChangeEvent<{
      name?: string;
      value: string;
    }>,
  ): void => {
    const { name, value } = event.target;
    if (name === 'score') {
      updateNewMethylationInputs({
        ...item,
        interpretation: parseFloat(value) >= 0.8 ? 'MATCH' : 'NO MATCH',
        score: parseFloat(value),
      });
    }
  };

  const handleGroupChange = (
    value: { name: string, id: string },
  ): void => {
    updateNewMethylationInputs({
      ...item,
      group: value.id,
    });
  };

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
    }
  }, [changeClassWithInput, selectedClassifier]);

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      rowGap={32}
    >
      <Box
        width="100%"
        display="flex"
        flexDirection="row"
        columnGap={32}
      >
        <Select
          options={classifiers.map((classifier) => ({
            name: `${classifier.description} version ${classifier.version}`,
            value: classifier.id,
          }))}
          headerTitle="Classifier Version"
          className={classes.classifierVersion}
          inputContainerClassName={classes.groupInputContainer}
          onChange={handleClassifierChange}
        />
        <div className={classes.scoreInputContainer} />
      </Box>
      <Box
        width="100%"
        display="flex"
        flexDirection="row"
        columnGap={32}
      >
        <Box
          className={classes.groupInputContainer}
          display="flex"
          flexDirection="column"
        >
          <ColumnHeading className={classes.heading} text="Class" />
          <CustomAutocomplete
            id="get-class-autocomplete"
            options={
              classifierGroups
                .map((g) => ({
                  name: g.groupName,
                  id: g.methGroupId,
                }))
            }
            getOptionLabel={(option: { name: string, id: string }): string => option.name || ''}
            isOptionEqualToValue={(
              option: { name: string, id: string },
              value: { name: string, id: string },
            ): boolean => option.name === value.name}
            className={classes.versionItem}
            classes={{
              inputRoot: classes.autocompleteRoot,
              option: classes.autoCompleteOption,
            }}
            onInputChange={(e, v): void => {
              changeClassWithInput(v);
            }}
            onChange={(event, value): void => handleGroupChange(value)}
            clearOnBlur
            disableClearable
          />
        </Box>
        <OutlinedInput
          headerTitle="Calibrated Score"
          inputContainerClassName={classes.scoreInputContainer}
          value={item.score || undefined}
          name="score"
          onChange={handleOnChangeOptions}
        />
      </Box>
    </Box>
  );
}
