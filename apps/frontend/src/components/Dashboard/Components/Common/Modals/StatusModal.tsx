import {
  Box,
  MenuItem,
  Select,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  Dispatch, ReactNode, SetStateAction, useRef, useState, type JSX,
} from 'react';
import CustomModal from '@/components/Common/CustomModal';
import CustomTypography from '@/components/Common/Typography';
import { IRTERef, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { failedStatusReasons } from '@/constants/Curation/navigation';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { ClinicalStatus } from '@/types/MTB/ClinicalStatus.types';
import { CurationStatus, FailedStatusReason } from '@/types/Samples/Sample.types';
import Gender from '../../../../VitalStatus/Gender';

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 16,
    overflowY: 'unset',
    margin: 0,
    maxHeight: 'calc(100vh - 250px)',
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
  },
  commentEditor: {
    maxHeight: '100px',
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

    '& .MuiSelect-icon': {
      color: '#022034',
    },

    '& .MuiSelect-select:focus': {
      backgroundColor: '#FFFFFF',
      color: '#022034',
    },

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

    '&:hover': {
      background: '#F3F7FF',
    },
  },
}));

type ModalData = {
  patientId: string;
  vitalStatus: string;
  gender: string;
};

interface IProps<T extends CurationStatus | ClinicalStatus> {
  data: ModalData;
  type: 'Curation' | 'Clinical';
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  updateStatus: (
    comment: string,
    newStatus: T,
    failedStatusReason?: FailedStatusReason,
  ) => Promise<void>;
  getStatuses: () => ReactNode;
}

export default function StatusModal<T extends CurationStatus | ClinicalStatus>({
  data,
  type,
  isOpen,
  setIsOpen,
  updateStatus,
  getStatuses,
}: IProps<T>): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [comment, setComment] = useState<string>('');
  const [status, setStatus] = useState<T>();
  const [
    failedStatusReason,
    setFailedStatusReason,
  ] = useState<FailedStatusReason | undefined>(undefined);

  const editorRef = useRef<IRTERef | null>(null);

  const canAddClinicalComments = useIsUserAuthorised('clinical.sample.write');
  const canAddCurationComments = useIsUserAuthorised('curation.sample.write');

  const handleValidation = async (): Promise<void> => {
    try {
      await updateStatus(comment, status as T, failedStatusReason);
      enqueueSnackbar('Sample status updated successfully', { variant: 'success' });
      setIsOpen(false);
    } catch (e) {
      enqueueSnackbar('Failed to update sample status, please try again', { variant: 'error' });
      console.error(e);
    }
  };

  const checkDisabled = (): boolean => (
    !comment
    || !status
    || (
      type === 'Curation'
      && status === 'Failed'
      && !failedStatusReason
    )
  );

  const canAddComments = (): boolean => (
    type === 'Curation'
      ? canAddCurationComments
      : canAddClinicalComments
  );

  return (
    <CustomModal
      title="Update case status"
      open={isOpen}
      onClose={(): void => setIsOpen(false)}
      buttonText={{ confirm: 'Add comment and update status' }}
      confirmDisabled={checkDisabled()}
      onConfirm={handleValidation}
      content={(
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
            : Update status
          </CustomTypography>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="10px"
          >
            <CustomTypography display="inline">
              Patient Id:
              &nbsp;
              {data.patientId}
            </CustomTypography>
            {data.vitalStatus && <Gender vitalStatus={data.vitalStatus} gender={data.gender} />}
          </Box>
          <Box display="flex" justifyContent="space-between" width="100%">
            {/* Status Input */}
            <Box display="flex" flexDirection="column">
              <CustomTypography variant="label" className={classes.overline}>
                {type.toUpperCase()}
                &nbsp;
                STATUS *
              </CustomTypography>
              <Select
                key="case-status-select"
                variant="outlined"
                className={classes.selectButton}
                MenuProps={{
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  MenuListProps: { className: classes.select },
                }}
                value={status}
                onChange={(e): void => {
                  setStatus(e.target.value as T);
                  setFailedStatusReason(undefined);
                }}
              >
                {getStatuses()}
              </Select>
            </Box>
            {status === 'Failed' && (
            <Box display="flex" flexDirection="column">
              <CustomTypography variant="label" className={classes.overline}>
                {type.toUpperCase()}
                &nbsp;
                Failed status reason *
              </CustomTypography>
              <Select
                key="case-status-select"
                variant="outlined"
                className={classes.selectButton}
                MenuProps={{
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  MenuListProps: { className: classes.select },
                }}
                value={failedStatusReason}
                onChange={(e): void => setFailedStatusReason(e.target.value)}
              >
                {failedStatusReasons.map((reason) => (
                  <MenuItem key={reason} value={reason} className={classes.selectItem}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            )}
          </Box>
          {/* Comment Input */}
          {canAddComments() && (
            <Box display="flex" width="100%">
              <RichTextEditor
                ref={editorRef}
                classNames={{
                  editor: classes.commentEditor,
                }}
                title={(
                  <CustomTypography variant="label" className={classes.overline}>
                    COMMENT *
                  </CustomTypography>
                )}
                mode="autoSave"
                disablePlugins={['table', 'evidence', 'inline-citation']}
                onChange={
                  (value): void => setComment(editorRef.current?.isEmpty() ? '' : JSON.stringify(JSON.parse(value).value))
                }
              />
            </Box>
          )}
        </Box>
      )}
    />
  );
}
