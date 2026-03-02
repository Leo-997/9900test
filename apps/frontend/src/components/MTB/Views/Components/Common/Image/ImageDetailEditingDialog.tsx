import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { ISlideAttachment, UpdateSlideAttachmentDetails } from '@/types/MTB/MTB.types';
import {
  Box,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl,
  OutlinedInput,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, type JSX } from 'react';

const useStyles = makeStyles(() => ({
  dialogRoot: {
    borderRadius: '16px',
    justifyContent: 'space-between',
    width: '600px',
  },
  header: {
    width: '100%',
    padding: '32px 32px',
  },
  content: {
    padding: '0 32px',
  },
  footer: {
    padding: '32px 0',
  },
  saveBtn: {
    minWidth: '68px',
    marginLeft: '8px',
  },
  cancelBtn: {
    minWidth: '84px',
  },
  outlinedInput: {
    whiteSpace: 'pre-wrap',
    padding: '8px 10px',
    lineHeight: 1.5,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1E86FC',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&.Mui-focused  .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1E86FC',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: '#F44336',
    },
  },
}));

interface IProps {
  open: boolean;
  onClose: () => void;
  onSave: (detail: UpdateSlideAttachmentDetails) => void;
  file: ISlideAttachment;
}

export default function ImageDetailEditingDialog({
  open,
  onClose,
  onSave,
  file,
}: IProps): JSX.Element {
  const classes = useStyles();

  const initialDetail = {
    title: file.title,
    caption: file.caption || '',
  };

  const [detail, setDetail] = useState<UpdateSlideAttachmentDetails>(initialDetail);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.dialogRoot }}
    >
      <DialogTitle className={classes.header}>
        <CustomTypography variant="h5" fontWeight="medium">
          Edit attachment details
        </CustomTypography>
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          gap="24px"
        >
          <Box display="flex" flexDirection="column" justifyContent="flex-start">
            <CustomTypography
              variant="label"
              style={{ color: '#022034', marginBottom: '4px' }}
            >
              Title (Required)
            </CustomTypography>
            <FormControl variant="outlined">
              <OutlinedInput
                value={detail.title}
                placeholder="Title"
                multiline
                onChange={(event):void => setDetail(
                  (prev) => ({ ...prev, title: event.target.value }),
                )}
                className={classes.outlinedInput}
              />
            </FormControl>
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="flex-start">
            <CustomTypography
              variant="label"
              style={{ color: '#022034', marginBottom: '4px' }}
            >
              Caption
            </CustomTypography>
            <FormControl variant="outlined">
              <OutlinedInput
                value={detail.caption}
                placeholder="Caption"
                multiline
                onChange={(event):void => setDetail(
                  (prev) => ({ ...prev, caption: event.target.value }),
                )}
                className={classes.outlinedInput}
              />
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.footer}>
        <Box display="flex" gap="12px">
          <CustomButton
            variant="subtle"
            label="Cancel"
            className={classes.cancelBtn}
            onClick={(): void => {
              setDetail(initialDetail);
              onClose();
            }}
          />
          <CustomButton
            variant="bold"
            label="Save"
            disabled={!detail.title.trim()}
            className={classes.saveBtn}
            onClick={(): void => {
              onSave(detail);
            }}
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
}
