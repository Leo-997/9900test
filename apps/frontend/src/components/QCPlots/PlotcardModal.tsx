import {
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Slide,
    SlideProps,
} from '@mui/material';
import { Minimize2Icon } from 'lucide-react';
import { forwardRef, ReactElement, Ref, type JSX } from 'react';
import CustomTypography from '../Common/Typography';
import ZoomPanImageContainer from '../ZoomPanImage/ZoomPanImageContainer';
import PlotInfoToolTip, { PlotLegendItem } from './PlotInfoToolTip';

const transition = forwardRef((
  props: SlideProps & { children?: ReactElement<any> },
  ref: Ref<unknown>,
) => <Slide direction="up" ref={ref} {...props} />);

interface IProps {
  title: string;
  url: string[];
  legendTitle: string;
  legendData: PlotLegendItem[];
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export default function PlotCardModal({
  title,
  url,
  legendTitle,
  legendData,
  open,
  openModal,
  closeModal,
}: IProps): JSX.Element {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={openModal}
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
              {title}
            </CustomTypography>
          </Grid>
          <Grid>
            <PlotInfoToolTip legendTitle={legendTitle} legendData={legendData} />
            <IconButton
              onClick={(): void => closeModal()}
            >
              <Minimize2Icon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent style={{ height: '100%', overflow: 'hidden' }}>
        <ZoomPanImageContainer url={url} title={title} />
      </DialogContent>
    </Dialog>
  );
}
