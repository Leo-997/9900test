import CustomAutocomplete from '@/components/Common/Autocomplete';
import CustomModal from '@/components/Common/CustomModal';
import CustomOutlinedInput from '@/components/Common/Input';
import LabelledInputWrapper from '@/components/Common/LabelledInputWrapper';
import { corePalette } from '@/themes/colours';
import {
  Box,
  FilterOptionsState,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Fuse from 'fuse.js';
import { useSnackbar } from 'notistack';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
} from 'react';
import axios from 'axios';
import { yesNoOptions } from '../../../../../../../constants/options';
import { useZeroDashSdk } from '../../../../../../../contexts/ZeroDashSdkContext';
import {
  IDrugMetadata,
  IEditDrug,
  IExternalDrug,
  IUpdateDrug,
} from '../../../../../../../types/Drugs/Drugs.types';
import { boolToStr, strToBool } from '../../../../../../../utils/functions/bools';
import Select from '../../../../../../Input/Select';

const useStyles = makeStyles(() => ({
  dialogRoot: {
    minWidth: '800px',
    borderRadius: '16px',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    padding: '24px 24px 16px 32px',
  },
  content: {
    padding: '24px 32px',
  },
  footer: {
    padding: '24px 0',
  },
  btnBox: {
    marginRight: '32px',
  },
  saveBtn: {
    minWidth: '68px',
    marginLeft: '8px',
  },
  cancelBtn: {
    minWidth: '84px',
  },
  tabContentWrapper: {
    height: 'calc(100% - 172px)',
    overflowX: 'hidden',
  },
  autocomplete: {
    minHeight: '40px',
    paddingTop: '4px !important',
    paddingBottom: '4px !important',
  },
  autocompleteOption: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&[data-focus="true"]': {
      backgroundColor: '#F3F7FF',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&[aria-selected="true"]': {
      backgroundColor: '#F3F7FF',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&[aria-selected="true"]:hover': {
      backgroundColor: '#EBEBEB',
    },
  },
  autocompleteTag: {
    backgroundColor: corePalette.green10,
    color: corePalette.green150,
    border: `1px solid ${corePalette.green150}`,
    fontWeight: 700,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiChip-deleteIcon': {
      color: corePalette.green150,
    },
  },
  outlinedInput: {
    height: '40px',
  },
  select: {
    height: '40px',
  },
  helperText: {
    margin: '4px',
    height: '1em',
    opacity: 0,
    transition: 'opacity 0.3s cubic-bezier(.19, 1, .22, 1)',
  },
  helperTextVisible: {
    opacity: 1,
  },
}));

interface IDrugEditingProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  existingDrug?: IExternalDrug;
  updateActiveDrugDetail: (updatedDrug: IExternalDrug) => void;
}
export default function DrugDetailEditingModal({
  open,
  setOpen,
  existingDrug,
  updateActiveDrugDetail,
}: IDrugEditingProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const [drugNameExists, setDrugNameExists] = useState<boolean>(false);

  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [classOptions, setClassOptions] = useState<IDrugMetadata[]>([]);
  const [targetOptins, setTargetOptions] = useState<IDrugMetadata[]>([]);
  const [pathwayOptions, setPathwayOptions] = useState<IDrugMetadata[]>([]);

  const modifiedKeysRef = useRef<Set<keyof IEditDrug>>(new Set());

  const [editDrug, setEditDrug] = useState<IEditDrug>(existingDrug ?? {
    name: '',
    classes: [],
    targets: [],
    pathways: [],
  });

  const updateEditDrug = <T extends keyof IEditDrug>
    (key: T, val: IEditDrug[T]): void => {
    setEditDrug((prev) => ({
      ...prev,
      [key]: val,
    }));
    modifiedKeysRef.current.add(key);
  };

  const handleCreateDrug = useCallback(async (): Promise<void> => {
    try {
      const resp = await zeroDashSdk.services.drugs.addDrug({
        ...editDrug,
        classes: editDrug.classes.map((c) => c.id),
        pathways: editDrug.pathways.map((p) => p.id),
        targets: editDrug.targets.map((t) => t.id),
      });
      updateActiveDrugDetail({
        ...editDrug,
        id: resp.drugId,
        versionId: resp.versionId,
        version: 1,
        latestVersion: 1,
        isValidated: false,
      });
      setOpen(false);
      enqueueSnackbar(`Drug '${editDrug.name}' is created.`, { variant: 'success' });
    } catch (err) {
      if (
        axios.isAxiosError(err) && err.response?.data?.message?.includes('already exists')
      ) {
        setDrugNameExists(true);
        enqueueSnackbar(
          `Drug '${editDrug.name}' already exists. Please use a different name.`,
          { variant: 'error' },
        );
      } else {
        enqueueSnackbar(`Could not create new drug '${editDrug.name}', please try again.`, { variant: 'error' });
      }
    }
  }, [
    zeroDashSdk.services.drugs,
    editDrug,
    updateActiveDrugDetail,
    setOpen,
    enqueueSnackbar,
  ]);

  const handleUpdateDrug = useCallback(async (): Promise<void> => {
    try {
      const updatedDrug: IUpdateDrug = {};
      modifiedKeysRef.current.forEach((key) => {
        if (key === 'classes') {
          updatedDrug.classes = editDrug.classes.map((c) => c.id);
        } else if (key === 'pathways') {
          updatedDrug.pathways = editDrug.pathways.map((p) => p.id);
        } else if (key === 'targets') {
          updatedDrug.targets = editDrug.targets.map((t) => t.id);
        } else {
          updatedDrug[key] = editDrug[key];
        }
      });
      const resp = await zeroDashSdk.services.drugs.updateDrug(
        existingDrug?.versionId as string,
        updatedDrug,
      );
      updateActiveDrugDetail({
        ...editDrug,
        id: existingDrug?.id as string,
        versionId: resp.versionId,
        version: resp.version,
        latestVersion: resp.version,
        isValidated: false,
      });
      setOpen(false);
      enqueueSnackbar(`Details of drug '${editDrug.name}' is updated.`, { variant: 'success' });
    } catch {
      enqueueSnackbar(`Could not update details of drug '${editDrug.name}', please try again.`, { variant: 'error' });
    }
  }, [
    setOpen,
    editDrug,
    enqueueSnackbar,
    existingDrug,
    updateActiveDrugDetail,
    zeroDashSdk.services.drugs,
  ]);

  const updateDrugNameAndCompanyOptions = useCallback(
    async () => {
      try {
        const resp = await zeroDashSdk.services.drugs.getDrugs({});
        const drugNames = [...new Set(resp.map((drug) => drug.name))];
        const companyNames = [
          ...new Set(
            resp
              .map((drug) => drug.company)
              .filter((name) => !!name),
          ),
        ].sort();
        setNameOptions(drugNames);
        setCompanyOptions(companyNames as string[]);
      } catch (err) {
        setNameOptions([]);
        setCompanyOptions([]);
      }
    },
    [zeroDashSdk.services.drugs],
  );

  const updateClassOptions = useCallback(
    async () => {
      try {
        const resp = await zeroDashSdk.services.drugs.getDrugClasses({});
        setClassOptions(resp);
      } catch (err) {
        setClassOptions([]);
      }
    },
    [zeroDashSdk.services.drugs],
  );

  const updateTargetOptions = useCallback(
    async () => {
      try {
        const resp = await zeroDashSdk.services.drugs.getTargets();
        setTargetOptions(resp);
      } catch (err) {
        setTargetOptions([]);
      }
    },
    [zeroDashSdk.services.drugs],
  );

  const updatePathwayOptions = useCallback(
    async () => {
      try {
        const resp = await zeroDashSdk.services.drugs.getPathways();
        setPathwayOptions(resp);
      } catch (err) {
        setPathwayOptions([]);
      }
    },
    [zeroDashSdk.services.drugs],
  );

  const cancelEdit = (): void => {
    setOpen(false);
    setEditDrug(existingDrug ?? {
      name: '',
      classes: [],
      targets: [],
      pathways: [],
    });
    modifiedKeysRef.current = new Set();
  };

  const fuzzyFilterOptions = <T extends string | IDrugMetadata>(
    options: T[],
    state: FilterOptionsState<T>,
  ): T[] => {
    if (state.inputValue === '') {
      return options;
    }
    return new Fuse(options, {
      isCaseSensitive: false,
      includeScore: true,
      minMatchCharLength: 1,
      shouldSort: true,
      keys: ['name'],
    })
      .search(state.inputValue)
      .map((option) => option.item);
  };

  useEffect(() => {
    updateDrugNameAndCompanyOptions();
    updateClassOptions();
    updateTargetOptions();
    updatePathwayOptions();
  }, [
    updateDrugNameAndCompanyOptions,
    updateClassOptions,
    updateTargetOptions,
    updatePathwayOptions,
  ]);

  useEffect(() => {
    setDrugNameExists(nameOptions.some(
      (name) => name.toLowerCase() === editDrug.name.toLowerCase(),
    ));
  }, [editDrug, existingDrug, nameOptions]);

  return (
    <CustomModal
      open={open}
      variant="create"
      buttonText={{
        cancel: existingDrug ? 'Discard changes' : 'Cancel',
        confirm: existingDrug ? 'Update details' : 'Add drug',
      }}
      onClose={cancelEdit}
      onConfirm={existingDrug ? handleUpdateDrug : handleCreateDrug}
      confirmDisabled={editDrug.name === '' || (!existingDrug && drugNameExists) || editDrug.classes.length === 0}
      title={existingDrug ? `Edit ${editDrug.name} details` : 'Create a new drug'}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          gap="24px"
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            gap="24px"
          >
            {!existingDrug && (
            <Box display="flex" flexDirection="column" justifyContent="flex-start">
              <CustomOutlinedInput
                label="Drug Name *"
                value={editDrug.name}
                placeholder="Input a drug name"
                error={drugNameExists}
                onChange={(event):void => updateEditDrug('name', event.target.value)}
                className={classes.outlinedInput}
                errorMessage={drugNameExists ? 'Drug name already exists' : ''}
              />
            </Box>
            )}
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="flex-start"
              gap="24px"
            >
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                flex={8}
              >
                <CustomAutocomplete
                  label="Company"
                  value={editDrug.company}
                  options={companyOptions}
                  inputPlaceholder="Select or input a company name"
                  filterOptions={fuzzyFilterOptions}
                  onChange={(event, newValue):void => updateEditDrug('company', newValue)}
                  onInputChange={(event, newValue):void => updateEditDrug('company', newValue)}
                  freeSolo
                />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                flex={4}
              >
                <LabelledInputWrapper label="Paediatric Dose">
                  <Select
                    variant="outlined"
                    options={yesNoOptions}
                    value={boolToStr(editDrug.hasPaediatricDose)}
                    onChange={(event): void => updateEditDrug('hasPaediatricDose', strToBool(event.target.value as string))}
                  />
                </LabelledInputWrapper>
              </Box>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="flex-start">
            <CustomAutocomplete
              label="Classes *"
              multiple
              options={classOptions}
              getOptionLabel={(option): string => option.name}
              isOptionEqualToValue={(option, value):boolean => option.id === value.id}
              filterSelectedOptions
              filterOptions={fuzzyFilterOptions}
              disableCloseOnSelect
              value={editDrug.classes}
              onChange={(event, selectedOptions):void => updateEditDrug('classes', selectedOptions)}
            />
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="flex-start">
            <CustomAutocomplete
              label="Targets"
              multiple
              options={targetOptins}
              getOptionLabel={(option):string => option.name}
              filterSelectedOptions
              filterOptions={fuzzyFilterOptions}
              disableCloseOnSelect
              value={editDrug.targets}
              onChange={(event, selectedOptions):void => updateEditDrug('targets', selectedOptions)}
            />
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="flex-start">
            <CustomAutocomplete
              label="Pathways"
              multiple
              options={pathwayOptions}
              getOptionLabel={(option):string => option.name}
              filterSelectedOptions
              filterOptions={fuzzyFilterOptions}
              disableCloseOnSelect
              value={editDrug.pathways}
              onChange={(event, selectedOptions):void => updateEditDrug('pathways', selectedOptions)}
            />
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap="24px"
          >
            <Box display="flex" flexDirection="column" justifyContent="flex-start">
              <LabelledInputWrapper label="FDA Approved">
                <Select
                  variant="outlined"
                  className={classes.select}
                  options={yesNoOptions}
                  value={boolToStr(editDrug.fdaApproved)}
                  onChange={(e): void => updateEditDrug('fdaApproved', strToBool(e.target.value as string))}
                />
              </LabelledInputWrapper>
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="flex-start">
              <LabelledInputWrapper label="ARTG Approved">
                <Select
                  variant="outlined"
                  className={classes.select}
                  options={yesNoOptions}
                  value={boolToStr(editDrug.artgApproved)}
                  onChange={(e): void => updateEditDrug('artgApproved', strToBool(e.target.value as string))}
                />
              </LabelledInputWrapper>
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="flex-start">
              <LabelledInputWrapper label="TGA Approved">
                <Select
                  variant="outlined"
                  className={classes.select}
                  options={yesNoOptions}
                  value={boolToStr(editDrug.tgaApproved)}
                  onChange={(e): void => updateEditDrug('tgaApproved', strToBool(e.target.value as string))}
                />
              </LabelledInputWrapper>
            </Box>
          </Box>
        </Box>
      )}
    />
  );
}
