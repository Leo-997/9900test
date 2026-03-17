import {
    classificationOptions, cytoCNTypeOptions, yesNoOptions,
} from '@/constants/options';
import { reportOptions } from '@/constants/Reports/reports';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { Chromosome, Classification, IReportableVariant } from '@/types/Common.types';
import {
    Arm, IArmRanges, ICreateCytobandBody, ISampleCytoband,
} from '@/types/Cytogenetics.types';
import { ISelectOption } from '@/types/misc.types';
import { ReportType } from '@/types/Reports/Reports.types';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { getBandNumber } from '@/utils/functions/getBandNumber';
import { getCytobandRange } from '@/utils/functions/getCytobandRange';
import getUpdatedReportableValue from '@/utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '@/utils/functions/reportable/getUpdatedReportsValue';
import { isClassified } from '@/utils/functions/reportable/isClassified';
import { toFixed } from '@/utils/math/toFixed';
import {
    Grid,
    InputAdornment,
    styled,
    TextField,
    Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RotateCcwIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { FlashingDotsAnimation } from '../Animations/FlashingDotsAnimation';
import CustomAutocomplete from '../Common/Autocomplete';
import CustomModal from '../Common/CustomModal';
import CustomOutlinedInput from '../Common/Input';
import LabelledInputWrapper from '../Common/LabelledInputWrapper';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const AutoWidthSelectFull = styled(AutoWidthSelect)(() => ({
  width: '100%',
}));

const useStyles = makeStyles(() => ({
  modal: {
    margin: 'auto',
    height: '100%',
    maxHeight: '450px',
  },
  dialogContent: {
    padding: '16px 32px 16px 16px',
  },
  label: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  cnType: {
    width: '215px',
  },
  autocompleteRoot: {
    height: '48px',
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
  },
  autoCompleteOption: {
    '&.MuiAutocomplete-option[data-focus="true"]': {
      backgroundColor: '#F3F7FF',
    },
    '&.MuiAutocomplete-option[aria-selected="true"]': {
      backgroundColor: '#F3F7FF',
    },
  },
  numberInput: {
    '& input[type=number]::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '& input[type=number]::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
  },
  submitButton: {
    height: '48px',
    width: '100%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  footer: {
    padding: '32px 0 32px 16px',
    height: '76px',
    position: 'sticky',
    bottom: '0px',
    backgroundColor: '#FFFFFF',
    justifyContent: 'end',
  },
  footerWithDeleteBtn: {
    justifyContent: 'space-between',
  },
  btnBox: {
    marginRight: '32px',
  },
  saveBtn: {
    minWidth: '68px',
    marginLeft: '8px',
  },
  btn: {
    height: '48px',
  },
  refreshIconAdornment: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

interface ICytobandModalProps {
  biosampleId: string | undefined;
  isGermline: boolean;
  open: boolean;
  closeModal: () => void;
  arm: Arm;
  armCytobands: ISampleCytoband[];
  chromosome: Chromosome;
  selectedCytoband: ISampleCytoband | null;
  handleUpdateCytobands: () => Promise<void>;
  selectedReports?: ReportType[] | null;
}

interface IEditableFields {
  cytoStart: string;
  cytoEnd: string;
  copyNumber: number;
  cnType: string;
  classification: Classification | null;
  reportable: boolean | null;
  inReports: ReportType[];
  targetable: boolean | null;
}

interface IComputedCN {
  avgCN: number | null;
  minCN: number | null;
  maxCN: number | null;
}

const emptyComputedCN = {
  avgCN: null,
  minCN: null,
  maxCN: null,
};

export default function CytobandModal({
  biosampleId,
  isGermline,
  open,
  closeModal,
  arm,
  armCytobands,
  chromosome,
  selectedCytoband,
  handleUpdateCytobands,
  selectedReports,
}: ICytobandModalProps): JSX.Element {
  const classes = useStyles();

  const zeroDashSdk = useZeroDashSdk();
  const { analysisSet, demographics } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();

  const [editableFields, setEditableFields] = useState<IEditableFields>({
    cytoStart: '',
    cytoEnd: '',
    copyNumber: 0,
    cnType: '',
    classification: null,
    reportable: null,
    inReports: [],
    targetable: null,
  });
  const [cytoStartOptions, setCytoStartOptions] = useState<IArmRanges[]>([]);
  const [cytoStartValue, setCytoStartValue] = useState<IArmRanges | null>(null);
  const [cytoEndValue, setCytoEndValue] = useState<IArmRanges | null>(null);
  const [computedCN, setComputedCN] = useState<IComputedCN>(emptyComputedCN);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [disabledBtnTooltip, setDisabledBtnTooltip] = useState<string>('');
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const variantType = isGermline ? 'GERMLINE_CYTO' : 'CYTOGENETICS';

  const isDefaultCytoband = (): boolean => {
    if (selectedCytoband?.avgCN || selectedCytoband?.avgCN === 0) {
      return true;
    }
    return false;
  };

  const fetchAvgCopyNum = useCallback(async (
    startRange: string,
    endRange: string,
    overrideCN?: boolean,
  ): Promise<void> => {
    if (biosampleId && !isGermline) {
      try {
        setLoading(true);
        // Get start/end ranges converted to number type
        // and if endRange is empty string, end range will be equal to start range
        const [start, end] = [startRange, endRange].map(
          (r) => (r.length ? getBandNumber(r, arm) : getBandNumber(startRange, arm)),
        );
        // For the purpose of getAverageCopyNumber(), 'start' is always the lowest cytoband range
        // and 'end' is the highest range, regardless of arm type.
        const sortedRanges = [start, end].sort((a, b) => {
          if (a === b) {
            return 0;
          }
          if (arm === 'p') {
            return -1;
          }
          return 1;
        });

        const resp = await zeroDashSdk.cytogenetics.somatic.getAverageCopyNumber(
          biosampleId,
          {
            chr: chromosome,
            arm,
            start: sortedRanges[0],
            end: sortedRanges[1],
          },
        );
        setComputedCN({
          avgCN: resp.avgCN,
          minCN: resp.minCN,
          maxCN: resp.maxCN,
        });
        if (overrideCN) {
          setEditableFields((prev) => ({
            ...prev,
            copyNumber: resp.avgCN,
          }));
        }
      } catch {
        setComputedCN(emptyComputedCN);
      } finally {
        setLoading(false);
      }
    }
  }, [biosampleId, isGermline, zeroDashSdk.cytogenetics.somatic, chromosome, arm]);

  // useEffect for fetching Cytoband Start input menu options from db
  useEffect(() => {
    const fetchCytobandStartOptions = async (): Promise<void> => {
      try {
        if (biosampleId) {
          const getChromosomeBands = isGermline
            ? zeroDashSdk.cytogenetics.germline.getChromosomeBands
            : zeroDashSdk.cytogenetics.somatic.getChromosomeBands;
          const resp = await getChromosomeBands(
            biosampleId,
            {
              chr: chromosome,
              arm,
            },
          );

          setCytoStartOptions(resp);
          if (resp.length && selectedCytoband) {
            setCytoStartValue(resp.find((o) => o.chromosomeBand === getCytobandRange('start', selectedCytoband.cytoband)) as IArmRanges);
            setCytoEndValue(resp.find((o) => o.chromosomeBand === getCytobandRange('end', selectedCytoband.cytoband)) || null);
          }
        }
      } catch {
        setCytoStartOptions([]);
      }
    };

    fetchCytobandStartOptions();
  }, [
    arm,
    biosampleId,
    chromosome,
    isGermline,
    selectedCytoband,
    zeroDashSdk.cytogenetics.germline.getChromosomeBands,
    zeroDashSdk.cytogenetics.somatic.getChromosomeBands,
  ]);

  // useEffect for pre-filling modal's fields with selected cytoband's data
  useEffect(() => {
    // Case: custom cytoband or edited default cytoband
    if (
      selectedCytoband
      && (selectedCytoband.customCn || selectedCytoband.customCn === 0)
      && selectedReports
    ) {
      setEditableFields({
        cytoStart: getCytobandRange('start', selectedCytoband.cytoband),
        cytoEnd: getCytobandRange('end', selectedCytoband.cytoband),
        copyNumber: Number(toFixed(selectedCytoband.customCn, 2)),
        cnType: selectedCytoband.cnType,
        classification: selectedCytoband.classification,
        reportable: selectedCytoband.reportable,
        inReports: selectedReports,
        targetable: selectedCytoband.targetable,
      });
      return;
    }
    // Case: unedited default cytoband
    if (
      selectedCytoband
      && (selectedCytoband.avgCN || selectedCytoband.avgCN === 0)
      && selectedReports
    ) {
      setEditableFields({
        cytoStart: getCytobandRange('start', selectedCytoband.cytoband),
        cytoEnd: getCytobandRange('end', selectedCytoband.cytoband),
        copyNumber: Number(toFixed(selectedCytoband.avgCN, 2)),
        cnType: selectedCytoband.cnType,
        classification: selectedCytoband.classification,
        reportable: selectedCytoband.reportable,
        inReports: selectedReports,
        targetable: selectedCytoband.targetable,
      });
    }
  }, [selectedCytoband, selectedReports]);

  // useEffect for calculating average copy number on modal open
  useEffect(() => {
    if (selectedCytoband) {
      fetchAvgCopyNum(
        getCytobandRange('start', selectedCytoband.cytoband),
        getCytobandRange('end', selectedCytoband.cytoband),
      );
    }
  }, [fetchAvgCopyNum, selectedCytoband]);

  // useEffect for disabling 'Add/Save' submit button.
  useEffect(() => {
    // Case: no cytoband start range
    if (!cytoStartValue) {
      setDisabledBtnTooltip('You must specify a start cytoband to submit.');
      return;
    }
    // Case: selected range is equal to other cytoband's range
    const selectedRange = `${editableFields.cytoStart}${editableFields.cytoEnd ? `;${editableFields.cytoEnd}` : ''}`;
    // If editing, filter out edited cytoband from cytobands array before next validation check
    const filteredCytobands = selectedCytoband
      ? armCytobands.filter((c) => c.cytoband !== selectedCytoband.cytoband)
      : armCytobands;
    // New range can't be equal to an existing custom cytoband
    const isSelectedRangeEqual = filteredCytobands.some((c) => {
      const start = getCytobandRange('start', c.cytoband);
      const end = getCytobandRange('end', c.cytoband);
      const wholeRange = end ? `${start};${end}` : start;
      return wholeRange === selectedRange;
    });
    if (isSelectedRangeEqual) {
      setDisabledBtnTooltip('Cannot have two cytobands sharing start and end ranges');
      return;
    }
    setDisabledBtnTooltip('');
  }, [armCytobands, cytoStartValue, editableFields, selectedCytoband]);

  const handleInputChange = (
    newValue: Classification | boolean | ReportType[] | string | number | null,
    key: string,
  ): void => {
    setEditableFields((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleClassificationAndReportableChange = (
    inputValue: Partial<IReportableVariant>,
  ): void => {
    const newValue = {
      ...inputValue,
      reportable: getUpdatedReportableValue(
        inputValue,
        editableFields.reportable,
      ),
    };

    const newReports: ReportType[] = [];
    newReports.push(...getUpdatedReportsValue({
      reportable: newValue.reportable,
      defaultValue: editableFields.inReports,
      variantType: isGermline ? 'GERMLINE_CYTO' : undefined,
      germlineConsent: demographics,
    }));
    if (inputValue.classification !== undefined) {
      handleInputChange(inputValue.classification, 'classification');
    }
    handleInputChange(newValue.reportable, 'reportable');
    handleInputChange(newReports, 'inReports');
  };

  const handleRenderSelectValue = (
    selected: string,
    options: ISelectOption<Classification | 'Yes' | 'No' | 'Select Status' | ''>[],
  ):ReactNode => {
    if (selected === '') {
      return <span />;
    }
    const selectedOption = options.find((option) => option.value === selected);
    return selectedOption ? selectedOption.name : '';
  };

  const handleSaveCytoband = async (): Promise<void> => {
    if (biosampleId) {
      setSaving(true);
      const newCytobandRange = `${editableFields.cytoStart}${editableFields.cytoEnd ? `;${editableFields.cytoEnd}` : ''}`;
      // Editing a cytoband
      if (selectedCytoband) {
        try {
          const updateCytoband = isGermline
            ? zeroDashSdk.cytogenetics.germline.updateCytoband
            : zeroDashSdk.cytogenetics.somatic.updateCytoband;
          await updateCytoband(
            biosampleId,
            chromosome,
            selectedCytoband.cytoband,
            {
              // If editing a default cytoband, don't overwrite its ranges with 'newCytobandRange'
              // , as it will delete its middle ranges.
              cytoband: isDefaultCytoband() ? selectedCytoband.cytoband : newCytobandRange,
              // If editing a default cytoband, only update its customCN if !== than avgCN
              customCn:
                isDefaultCytoband()
                && (
                  toFixed(editableFields.copyNumber, 2)
                  === toFixed(selectedCytoband.avgCN as number, 2)
                )
                  ? null
                  : editableFields.copyNumber,
              cnType: editableFields.cnType,
              classification: editableFields.classification,
              reportable: editableFields.reportable,
              targetable: editableFields.targetable,
            },
          );

          // If editing custom cyto and ranges were modified,
          // delete records on reportable_variants table with old ranges
          if (!isDefaultCytoband() && selectedCytoband.cytoband !== newCytobandRange) {
            zeroDashSdk.reportableVariants.updateReportableVariant(
              analysisSet.analysisSetId,
              biosampleId,
              {
                variantType,
                variantId: selectedCytoband.cytoband,
                reports: [],
              },
            );
          }

          zeroDashSdk.reportableVariants.updateReportableVariant(
            analysisSet.analysisSetId,
            biosampleId,
            {
              variantType,
              variantId: isDefaultCytoband() ? selectedCytoband.cytoband : newCytobandRange,
              reports: editableFields.inReports,
            },
          );
        } catch {
          enqueueSnackbar(`Cannot update ${isGermline ? 'germline' : 'somatic'} cytoband data, please try again.`, { variant: 'error' });
          setSaving(false);
          return;
        }
      }
      // Creating a new custom cytoband
      if (!selectedCytoband) {
        try {
          const newCytoband: ICreateCytobandBody = {
            chr: chromosome,
            arm,
            cytoband: newCytobandRange,
            customCn: editableFields.copyNumber,
            cnType: editableFields.cnType,
            classification: editableFields.classification,
            reportable: editableFields.reportable,
            targetable: editableFields.targetable,
          };
          const createCytoband = isGermline
            ? zeroDashSdk.cytogenetics.germline.createCytoband
            : zeroDashSdk.cytogenetics.somatic.createCytoband;

          await createCytoband(
            biosampleId,
            newCytoband,
          );

          if (editableFields.inReports.length) {
            await zeroDashSdk.reportableVariants.updateReportableVariant(
              analysisSet.analysisSetId,
              biosampleId,
              {
                variantType,
                variantId: newCytobandRange,
                reports: editableFields.inReports,
              },
            );
          }
        } catch {
          enqueueSnackbar('Cannot create new cytoband, please try again.', { variant: 'error' });
          setSaving(false);
          return;
        }
      }
      // // Update cytobands list
      handleUpdateCytobands();
      setSaving(false);
    }
  };

  const handleCytoStartChange = (newValue: IArmRanges | null): void => {
    // Update state with newValue
    setEditableFields((prev) => ({
      ...prev,
      cytoStart: newValue?.chromosomeBand ?? '',
    }));
    setCytoStartValue(newValue);

    // Data validation
    // Case: newValue === null
    // Empty Cyto End input and reset copy number calculation
    if (!newValue) {
      setEditableFields((prev) => ({
        ...prev,
        cytoEnd: '',
        copyNumber: 0,
      }));
      setCytoEndValue(null);
      setComputedCN(emptyComputedCN);
      return;
    }
    // Case: newValue is incompatible with Cytoband End value
    let endRange = editableFields.cytoEnd;
    if (
      newValue && editableFields.cytoEnd
      && (
        (arm === 'p' && getBandNumber(newValue.chromosomeBand, arm) < getBandNumber(editableFields.cytoEnd, arm))
        || (arm === 'q' && getBandNumber(newValue.chromosomeBand, arm) > getBandNumber(editableFields.cytoEnd, arm))
        || newValue.chromosomeBand === editableFields.cytoEnd
      )
    ) {
      setEditableFields((prev) => ({
        ...prev,
        cytoEnd: '',
      }));
      setCytoEndValue(null);
      endRange = '';
    }
    // Calculate new average copy number
    fetchAvgCopyNum(
      newValue.chromosomeBand,
      endRange,
      true,
    );
  };

  const handleCytoEndChange = (newValue: IArmRanges | null): void => {
    setEditableFields((prev) => ({
      ...prev,
      cytoEnd: newValue?.chromosomeBand ?? '',
    }));
    setCytoEndValue(newValue);
    fetchAvgCopyNum(
      editableFields.cytoStart,
      newValue?.chromosomeBand ?? '',
      true,
    );
  };

  const getCytoEndOptions = (startRange: IArmRanges | null): IArmRanges[] => {
    if (startRange === null) {
      return [];
    }
    const cytoEndOptions = arm === 'p'
      ? cytoStartOptions.filter(
        (o) => getBandNumber(o.chromosomeBand, arm) < getBandNumber(startRange.chromosomeBand, arm),
      ) : cytoStartOptions.filter(
        (o) => getBandNumber(o.chromosomeBand, arm) > getBandNumber(startRange.chromosomeBand, arm),
      );
    return cytoEndOptions;
  };

  const handleCNOnBlur = (copyNumber: number): void => {
    if (copyNumber < 0) {
      handleInputChange(Math.abs(copyNumber), 'copyNumber');
    }
  };

  const handleDeleteCytoband = async (): Promise<void> => {
    if (biosampleId && selectedCytoband) {
      setDeleting(true);
      try {
        const deleteCytoband = isGermline
          ? zeroDashSdk.cytogenetics.germline.deleteCytoband
          : zeroDashSdk.cytogenetics.somatic.deleteCytoband;
        await deleteCytoband(
          biosampleId,
          chromosome,
          selectedCytoband?.cytoband,
        );
        await zeroDashSdk.reportableVariants.updateReportableVariant(
          analysisSet.analysisSetId,
          biosampleId,
          {
            variantType,
            variantId: selectedCytoband?.cytoband,
            reports: [],
          },
        );
      } catch {
        enqueueSnackbar('Could not delete cytoband, please try again.', { variant: 'error' });
        setDeleting(false);
        return;
      }
      // Update cytobands list
      handleUpdateCytobands();
      setDeleting(false);
    }
  };

  const getEndAdorment = (): JSX.Element | boolean => {
    if (loading) {
      return (
        <InputAdornment position="end">
          <FlashingDotsAnimation colour="#022034" />
        </InputAdornment>
      );
    }
    if (
      (computedCN && (computedCN.avgCN || computedCN.avgCN === 0))
      && (editableFields.copyNumber !== computedCN.avgCN)
      && !loading
    ) {
      return (
        <InputAdornment
          className={classes.refreshIconAdornment}
          position="end"
          onClick={(): void => setEditableFields((prev) => ({
            ...prev,
            copyNumber: computedCN.avgCN as number,
          }))}
        >
          <CustomTypography tooltipText="Revert to calculated copy number">
            <RotateCcwIcon />
          </CustomTypography>
        </InputAdornment>
      );
    }
    return false;
  };

  return (
    <>
      <CustomModal
        open={open}
        onClose={closeModal}
        title={`${selectedCytoband ? `Edit ${getCytobandRange('start', selectedCytoband.cytoband)};${getCytobandRange('end', selectedCytoband.cytoband)}` : 'Create'} Arm ${arm.toUpperCase()} Cytoband`}
        content={(
          <Grid container direction="column" spacing={2}>
            <Grid
              className={classes.dialogContent}
              container
              direction="column"
              width="fit-content"
              minWidth="100%"
            >
              <Grid
                container
                wrap="nowrap"
                justifyContent="space-between"
              >
                <Grid
                  size={4}
                >
                  <Tooltip
                    title={isDefaultCytoband() ? 'Cannot modify range for a default cytoband' : ''}
                    placement="top"
                  >
                    <span>
                      <CustomAutocomplete
                        id="set-cytoband-start-range-autocomplete"
                        label="Cytoband Start"
                        options={cytoStartOptions}
                        getOptionLabel={(option: IArmRanges): string => option.chromosomeBand || ''}
                        isOptionEqualToValue={(
                          option,
                          value,
                        ): boolean => option?.chromosomeBand === value?.chromosomeBand}
                        renderInput={(params): ReactNode => (
                          <TextField {...params} variant="outlined" placeholder="Select cytoband start" />
                        )}
                        onChange={(e, val): void => (handleCytoStartChange(val))}
                        value={cytoStartValue}
                        disabled={isDefaultCytoband()}
                      />
                    </span>
                  </Tooltip>
                </Grid>
                <Grid
                  size={4}
                >
                  <Tooltip
                    title={isDefaultCytoband() ? 'Cannot modify range for a default cytoband' : ''}
                    placement="top"
                  >
                    <span>
                      <CustomAutocomplete
                        label="Cytoband End"
                        id="set-cytoband-start-range-autocomplete"
                        options={getCytoEndOptions(cytoStartValue)}
                        getOptionLabel={(option: IArmRanges): string => option.chromosomeBand || ''}
                        isOptionEqualToValue={(
                          option,
                          value,
                        ): boolean => option?.chromosomeBand === value?.chromosomeBand}
                        onChange={(e, val): void => (handleCytoEndChange(val))}
                        renderInput={(params): JSX.Element => (
                          <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Select Cytoband End"
                          />
                        )}
                        disabled={
                          cytoStartValue === null
                          || getCytoEndOptions(cytoStartValue).length < 1
                          || isDefaultCytoband()
                        }
                        value={cytoEndValue}
                      />
                    </span>
                  </Tooltip>
                </Grid>
                <Grid
                  size={4}
                >
                  <Tooltip
                    title={
                      computedCN.minCN !== null
                      && computedCN.maxCN !== null
                        ? `Min: ${computedCN.minCN} | Max: ${computedCN.maxCN}`
                        : ''
                    }
                    placement="top"
                  >
                    <CustomOutlinedInput
                      label="Copy Number"
                      disabled={loading}
                      type="number"
                      inputProps={{
                        min: 0,
                        step: 0.1,
                      }}
                      value={editableFields.copyNumber}
                      onChange={(e): void => handleInputChange(Number(e.target.value), 'copyNumber')}
                      onBlur={(e): void => handleCNOnBlur(Number(e.target.value))}
                      endAdornment={getEndAdorment()}
                    />
                  </Tooltip>
                </Grid>
                <Grid
                  size={4}
                >
                  <LabelledInputWrapper label="CN Type">
                    <AutoWidthSelectFull
                      options={cytoCNTypeOptions}
                      value={editableFields.cnType}
                      onChange={(e): void => handleInputChange(e.target.value as string, 'cnType')}
                    />
                  </LabelledInputWrapper>
                </Grid>
              </Grid>

              <Grid
                container
                wrap="nowrap"
                justifyContent="space-between"
              >
                <Grid
                  size={4}
                >
                  <LabelledInputWrapper label="Classification">
                    <AutoWidthSelectFull
                      options={classificationOptions}
                      value={editableFields.classification}
                      onChange={(e): void => handleClassificationAndReportableChange(
                        { classification: e.target.value as Classification },
                      )}
                      renderValue={
                        (selected): ReactNode => handleRenderSelectValue(
                          selected as string,
                          classificationOptions,
                        )
                      }
                    />
                  </LabelledInputWrapper>
                </Grid>
                <Grid
                  size={4}
                >
                  <LabelledInputWrapper label="Reportable">
                    <AutoWidthSelectFull
                      options={yesNoOptions}
                      value={boolToStr(editableFields.reportable)}
                      onChange={(e): void => handleClassificationAndReportableChange(
                        { reportable: strToBool(e.target.value as string) },
                      )}
                      disabled={
                        !isClassified(editableFields)
                      }
                      renderValue={
                        (selected): ReactNode => handleRenderSelectValue(
                          selected as string,
                          yesNoOptions,
                        )
                      }
                    />
                  </LabelledInputWrapper>
                </Grid>
                <Grid
                  size={4}
                >
                  <LabelledInputWrapper label="Show in reports">
                    <AutoWidthSelectFull
                      multiple
                      options={reportOptions}
                      value={editableFields.inReports}
                      renderValue={(): ReactNode => {
                        const reportsAbbreviations = editableFields.inReports
                          .map(
                            (report) => reportOptions.find(
                              (option) => option.value === report,
                            )?.abbreviation,
                          )
                          .sort()
                          .join(', ');
                        return (
                          <CustomTypography truncate>
                            {reportsAbbreviations}
                          </CustomTypography>
                        );
                      }}
                      onChange={(e): void => {
                        const newReports = e.target.value as ReportType[];
                        handleInputChange(newReports, 'inReports');
                      }}
                      disabled={
                        !isClassified(editableFields)
                        || editableFields.reportable !== true
                      }
                    />
                  </LabelledInputWrapper>
                </Grid>
                <Grid
                  size={4}
                >
                  <LabelledInputWrapper label="Targetable">
                    <AutoWidthSelectFull
                      options={yesNoOptions}
                      value={boolToStr(editableFields.targetable)}
                      onChange={(e): void => handleInputChange(strToBool(e.target.value as string), 'targetable')}
                      renderValue={
                        (selected): ReactNode => handleRenderSelectValue(
                          selected as string,
                          yesNoOptions,
                        )
                      }
                    />
                  </LabelledInputWrapper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
        showActions={{
          cancel: true,
          confirm: true,
          secondary: Boolean(selectedCytoband && !isDefaultCytoband()),
        }}
        variant="create"
        buttonText={{
          cancel: 'Cancel',
          confirm: selectedCytoband ? 'Save' : 'Add',
          secondary: 'Delete',
        }}
        onConfirm={(): void => {
          handleSaveCytoband();
          closeModal();
        }}
        onSecondary={(): void => setOpenDeleteModal(true)}
        tooltipText={disabledBtnTooltip}
        confirmDisabled={disabledBtnTooltip.length > 0 || saving}
      />
      <CustomModal
        title="Delete cytoband"
        content={'Are you sure you want to delete this cytoband?\nThis action cannot be undone.'}
        open={openDeleteModal}
        onClose={(): void => {
          setOpenDeleteModal(false);
        }}
        onConfirm={async (): Promise<void> => {
          await handleDeleteCytoband();
          setOpenDeleteModal(false);
          closeModal();
        }}
        variant="alert"
        buttonText={{
          cancel: 'No, don\'t delete',
          confirm: 'Yes, delete',
        }}
        confirmDisabled={deleting}
      />
    </>
  );
}
