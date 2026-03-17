import {
  Dialog, DialogContent, DialogProps, DialogTitle, IconButton,
} from '@mui/material';
import { ReactNode, type JSX } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { XIcon } from 'lucide-react';
import CustomTypography from './Typography';

const useStyles = makeStyles(() => ({
  dialogPaper: {
    maxWidth: '100vw',
    minWidth: '1000px',
    maxHeight: 'calc(100vh - 64px)',
    minHeight: '700px',
    borderRadius: '16px',
    position: 'relative',
    overflow: 'visible',
  },
  dialogTitle: {
    backgroundColor: '#F3F5F7',
    paddingLeft: '40px',
    height: '66px',
    alignItems: 'center',
    display: 'flex',
    borderRadius: '16px 16px 0 0',
  },
  closeButton: {
    position: 'absolute',
    right: '-20px',
    top: '-20px',
  },
  titleWithAdornment: {
    '& h2': {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
  },
}));

interface IProps extends Omit<DialogProps, 'content'> {
  title: string;
  content: ReactNode;
  overrideClasses?: string;
  titleEndAdornment?: ReactNode;
}

export default function CustomDialog({
  open,
  onClose,
  title,
  content,
  overrideClasses,
  titleEndAdornment,
  ...rest
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{
        paper: classes.dialogPaper,
      }}
      className={overrideClasses}
      {...rest}
    >
      <DialogTitle className={clsx({
        [classes.dialogTitle]: true,
        [classes.titleWithAdornment]: titleEndAdornment,
      })}
      >
        <CustomTypography variant="h5">
          {title}
        </CustomTypography>
        {titleEndAdornment}
        <IconButton
          onClick={(e): void => onClose?.(e, 'backdropClick')}
          sx={{
            marginLeft: 'auto',
          }}
        >
          <XIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}
