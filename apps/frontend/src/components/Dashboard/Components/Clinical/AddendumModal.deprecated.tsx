/** THIS FILE IS DEPRECATED */
import { Dispatch, SetStateAction, useState, type JSX } from 'react';

import clsx from 'clsx';

import {
  Box,
  Dialog,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material';

import CustomTypography from '@/components/Common/Typography';
import { makeStyles } from '@mui/styles';
import { XIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { addendumOptions } from '../../../../constants/options';
import { useZeroDashSdk } from '../../../../contexts/ZeroDashSdkContext';
import { IClinicalDashboardSample } from '../../../../types/Dashboard.types';
import { ISelectOption } from '../../../../types/misc.types';
import { AddendumType } from '../../../../types/MTB/Addendum.types';
import CustomButton from '../../../Common/Button';

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 16,
    overflowY: 'unset',
    margin: 0,
  },
  modal: {
    maxWidth: '800px',
  },
  closeButton: {
    position: 'absolute',
    right: '-15px',
    top: '-15px',
    width: '40px',
    height: '40px',
    padding: '0px',
    minWidth: '40px',
  },
  dialogTitle: {
    backgroundColor: '#F3F5F7',
    height: '66px',
    width: '100%',
    paddingLeft: '45px',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  overline: {
    marginTop: '25px',
    marginBottom: '10px',
  },
  dialogContent: {
    height: '100%',
    width: '100%',
    padding: '45px',
  },
  header: {
    padding: 8,
  },
  input: {
    height: '44px',
    width: '100%',
  },
  footer: {
    height: '90px',
    width: '100%',
    borderTop: '1px solid rgb(236, 240, 243)',
  },
  selectButton: {
    height: '44px',
    width: '230px',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    color: '#022034',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-icon': {
      color: '#022034',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-select:focus': {
      backgroundColor: '#FFFFFF',
      color: '#022034',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-select:hover': {
      backgroundColor: '#FFFFFF',
      color: '#022034',
    },
  },
  select: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
  selectItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '8px',
    height: '44px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F7FF',
    },
  },
}));

interface IProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  data: IClinicalDashboardSample;
  updateSamples?: (newItem: IClinicalDashboardSample) => void;
}

export default function AddendumModal({
  isOpen,
  setIsOpen,
  data,
  updateSamples,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const zeroDashSdk = useZeroDashSdk();

  const [addendumType, setAddendumType] = useState<AddendumType>('general');
  const [title, setTitle] = useState<string>('General addendum title');
  const [note, setNote] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const checkHTSReady = (val: AddendumType): boolean => {
    if (val === 'general') return false;

    // TODO fix this when HTS addendum work is done
    // return !data.htsId;
    return false;
  };

  const handleAddendumTypeChange = (
    e: SelectChangeEvent<unknown>,
  ): void => {
    setAddendumType(e.target.value as AddendumType);
    setTitle(e.target.value === 'general'
      ? 'General addendum title'
      : 'High throughput drug screen');
  };

  const submitAddendum = async (): Promise<void> => {
    setLoading(true);
    try {
      const clinicalData = await zeroDashSdk.mtb.clinical.getClinicalVersionById(
        data.clinicalVersionId,
      );
      await zeroDashSdk.mtb.addendum.createAddendum({
        title,
        note,
        addendumType,
        clinicalHistory: clinicalData.clinicalHistory,
        clinicalVersionId: data.clinicalVersionId,
      });
      if (updateSamples) {
        updateSamples({
          ...data,
          clinicalStatus: 'In Progress',
        });
      }
      enqueueSnackbar(`${addendumType.toUpperCase().replace('ENERAL', 'eneral')} addendum created for patient ${data.patientId}`, { variant: 'success' });
      setIsOpen(false);
    } catch (e) {
      enqueueSnackbar('Could not create addendum, please try again', { variant: 'error' });
    }
    setLoading(false);
  };

  return (
    <Dialog
      open={isOpen}
      fullWidth
      classes={{ paper: clsx(classes.root, classes.modal) }}
    >
      <IconButton
        onClick={(): void => setIsOpen(false)}
        className={classes.closeButton}
      >
        <XIcon />
      </IconButton>
      {/* Header */}
      <Box
        className={classes.dialogTitle}
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <CustomTypography variant="bodyRegular">Create an addendum for the given sample</CustomTypography>
      </Box>
      {/* Content */}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        className={classes.dialogContent}
      >
        {/* Title */}
        <CustomTypography variant="titleRegular" fontWeight="medium">
          {data.patientId}
        </CustomTypography>
        {/* Type Input */}
        <CustomTypography variant="label" className={classes.overline}>ADDENDUM TYPE</CustomTypography>
        <Select
          id="addendum-type-select"
          variant="outlined"
          className={classes.selectButton}
          MenuProps={{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            MenuListProps: { className: classes.select },
          }}
          value={addendumType}
          onChange={handleAddendumTypeChange}
        >
          {addendumOptions.map(({ name, value }: ISelectOption<AddendumType>) => (
            <MenuItem
              value={value}
              className={classes.selectItem}
              disabled={checkHTSReady(value)}
            >
              <CustomTypography variant="bodyRegular">
                {checkHTSReady(value) ? `${name} (data not ready)` : name}
              </CustomTypography>
            </MenuItem>
          ))}
        </Select>
        {/* Title Input */}
        <CustomTypography variant="label" className={classes.overline}>TITLE</CustomTypography>
        <OutlinedInput
          className={classes.input}
          value={title}
          onChange={(e): void => setTitle(e.target.value)}
          placeholder="Enter title here"
        />
        {/* Note Input */}
        <CustomTypography variant="label" className={classes.overline}>NOTE</CustomTypography>
        <OutlinedInput
          className={classes.input}
          style={{ height: '100%' }}
          value={note}
          onChange={(e): void => setNote(e.target.value)}
          multiline
          placeholder="Enter note here"
        />
      </Box>
      {/* Footer */}
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        gap="24px"
        className={classes.footer}
      >
        <CustomButton
          style={{ width: '224px' }}
          variant="subtle"
          size="medium"
          label="Discard"
          onClick={(): void => setIsOpen(false)}
        />
        <CustomButton
          style={{ width: '224px', marginLeft: '24px' }}
          variant="bold"
          size="medium"
          label="Create"
          loading={loading}
          onClick={submitAddendum}
        />
      </Box>
    </Dialog>
  );
}
