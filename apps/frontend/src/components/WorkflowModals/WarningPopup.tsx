import React, { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';

import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextareaAutosize,
  Box,
} from '@mui/material';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@mui/styles';
import CustomTypography from '../Common/Typography';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import CustomModal from '../Common/CustomModal';
import RNAMasterUpdateModalContent from '../RNASeq/RNAMasterUpdateModalContent';

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 16,
    overflowY: 'unset',
    margin: 0,
  },
  wrapper: {
    width: '100%',
    padding: '5px 25px 30px 25px',
    gap: '24px',
  },
  overline: {
    marginTop: '25px',
    marginBottom: '10px',
  },
  textarea: {
    width: '100%',
    padding: '20px',
    fontFamily: 'Roboto',
    fontSize: '16px',
    border: '1px solid rgba(208, 217, 226, 1)',
    borderRadius: '4px',
    minHeight: '210px',
    maxHeight: '210px',
  },
  section: {
    width: '100%',
  },
  rna: {
    paddingBottom: '20px',
  },
}));
interface IProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  updateToNextState: () => void;
}

export default function WarningPopup({
  isOpen,
  setIsOpen,
  updateToNextState,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const {
    analysisSet, primaryBiosample, metrics, rnaBiosample,
  } = useAnalysisSet();
  const { curationStatus } = useCuration();
  const { enqueueSnackbar } = useSnackbar();

  const [contaminationText, setContaminationText] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [value, setValue] = React.useState('');
  const [needsNote, setNeedsNote] = useState({
    contamination: false,
    status: false,
  });
  const [selectedSubcat2, setSelectedSubcat2] = useState<string|undefined>(
    analysisSet?.zero2Subcategory2,
  );

  const handleClose = (): void => {
    setDialogOpen(false);
    setIsOpen(false);
    setSelectedSubcat2(undefined);
  };

  const handleContaminationTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setContaminationText(event.target.value);
  };

  const handleStatusTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setStatusText(event.target.value);
  };

  const handleValidation = async (): Promise<void> => {
    await zeroDashSdk.curation.validation.addWarningAcknowledgement(
      analysisSet.analysisSetId,
      {
        contaminationNote: contaminationText === '' ? null : contaminationText,
        statusNote: statusText === '' ? null : statusText,
      },
    );
    updateToNextState();
    setIsOpen(false);
    setDialogOpen(false);

    if (selectedSubcat2 !== undefined && rnaBiosample?.biosampleId) {
      try {
        zeroDashSdk.rna.regenerateTPMPlots(rnaBiosample?.biosampleId, selectedSubcat2);
      } catch {
        enqueueSnackbar('Cannot update plots, please try again.', { variant: 'error' });
      }
    }
  };

  const checkDisabled = (
    (needsNote.contamination && contaminationText === '')
      || (needsNote.status && statusText === '')
      || value === 'No'
      || value === ''
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue((event.target as HTMLInputElement).value);
  };

  useEffect(() => {
    async function checkWarning(): Promise<void> {
      if (isOpen) {
        if (curationStatus?.status === 'Ready to Start') {
          const summary = metrics?.find(
            (metric) => metric.biosampleId === primaryBiosample?.biosampleId,
          );
          if (summary?.qcStatus !== 'PASS') {
            setNeedsNote((n) => ({
              ...n,
              status: true,
            }));
          }
          if (summary?.amberQC !== 'PASS') {
            setNeedsNote((n) => ({
              ...n,
              contamination: true,
            }));
          }
          setDialogOpen(true);
        } else {
          updateToNextState();
          setIsOpen(false);
          setDialogOpen(false);
        }
      }
    }
    checkWarning();
  }, [
    curationStatus?.status,
    isOpen,
    metrics,
    primaryBiosample?.biosampleId,
    setIsOpen,
    updateToNextState,
  ]);

  return (
    <CustomModal
      open={dialogOpen}
      onClose={handleClose}
      variant="create"
      buttonText={{
        confirm: 'Validate & start curation',
      }}
      confirmDisabled={checkDisabled}
      onConfirm={handleValidation}
      title="Validate & Start Curation"
      content={(
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="flex-start"
          align-content="flex-start"
          className={classes.wrapper}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="flex-start"
            align-content="flex-start"
          >
            <CustomTypography variant="titleRegular">
              Is the Purity / Ploidy fit correct?
            </CustomTypography>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="flex-start"
              align-content="flex-start"
              marginBottom="25px"
              className={classes.section}
            >
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="gender"
                  name="gender1"
                  value={value}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="No"
                    control={<Radio color="primary" />}
                    label="No"
                  />
                  <FormControlLabel
                    value="Yes"
                    control={<Radio color="primary" />}
                    label="Yes"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
          {needsNote.status && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="flex-start"
              align-content="flex-start"
              className={classes.section}
            >
              <CustomTypography variant="titleRegular">
                Ignore purple QC status?
              </CustomTypography>
              <CustomTypography variant="label" className={classes.overline}>REASON *</CustomTypography>
              <TextareaAutosize
                className={classes.textarea}
                onChange={(e): void => handleStatusTextChange(e)}
                value={statusText || ''}
              />
            </Box>
          )}
          {needsNote.contamination && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="flex-start"
              align-content="flex-start"
              className={classes.section}
            >
              <CustomTypography variant="titleRegular">
                Ignore contamination warning?
              </CustomTypography>
              <CustomTypography variant="label" className={classes.overline}>REASON *</CustomTypography>
              <TextareaAutosize
                className={classes.textarea}
                onChange={(e): void => handleContaminationTextChange(e)}
                value={contaminationText || ''}
              />
            </Box>
          )}
          { rnaBiosample?.biosampleId && !analysisSet?.zero2Subcategory2 && (
            <Box className={classes.section}>
              <CustomTypography variant="titleRegular" className={classes.rna}>
                Select ZERO2 Subcategory2 for RNA-Seq expression plots?
              </CustomTypography>
              <RNAMasterUpdateModalContent
                setSelectedSubcat2={setSelectedSubcat2}
                warning={false}
              />
            </Box>
          )}
        </Box>
        )}
    />
  );
}
