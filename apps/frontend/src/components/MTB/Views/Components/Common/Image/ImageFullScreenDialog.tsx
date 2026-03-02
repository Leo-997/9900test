import {
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Slide,
    SlideProps,
} from '@mui/material';
import { MinimizeIcon } from 'lucide-react';
import { forwardRef, ReactElement, Ref, type JSX } from 'react';
import CustomTypography from '../../../../../Common/Typography';
import ZoomPanImageContainer from '../../../../../ZoomPanImage/ZoomPanImageContainer';
import { ISlideAttachment } from '../../../../../../types/MTB/MTB.types';

const transition = forwardRef((
  props: SlideProps & { children?: ReactElement<any> },
  ref: Ref<unknown>,
) => <Slide direction="up" ref={ref} {...props} />);

interface IProps {
  open: boolean;
  onClose: () => void;
  file: ISlideAttachment;
}

export default function ImageFullScreenDialog({
  open,
  onClose,
  file,
}: IProps): JSX.Element {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slots={{
        transition,
      }}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            height: '100%',
            maxHeight: '100%',
            maxWidth: '100%',
            borderRadius: 0,
          },
        },
      }}
    >
      <DialogTitle id="max-width-dialog-title">
        <Grid container justifyContent="space-between" alignItems="center" width="100%">
          <Grid>
            <CustomTypography variant="bodyRegular">
              {file.title}
            </CustomTypography>
          </Grid>
          <Grid>
            <IconButton onClick={onClose}>
              <MinimizeIcon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent style={{ height: '100%', overflow: 'hidden' }}>
        <ZoomPanImageContainer url={file.url || ''} title={file.title} />
      </DialogContent>
    </Dialog>
  );
}
