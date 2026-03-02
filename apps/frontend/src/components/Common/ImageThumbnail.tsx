import { forwardRef, useState, type JSX } from 'react';
import clsx from 'clsx';
import Dialog from '@mui/material/Dialog';
import {
    IconButton,
    Slide,
    Card,
    SlideProps,
    DialogTitle,
    Grid,
    DialogContent,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ImageIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react';
import { corePalette } from '@/themes/colours';
import CustomTypography from './Typography';
import ZoomPanImageContainer from '../ZoomPanImage/ZoomPanImageContainer';

const useStyles = makeStyles(() => ({
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  cardMedia: {
    width: '100%',
    objectFit: 'contain',
    backgroundColor: '#F3F5F7',
  },
  plotStyle: {
    position: 'relative',
    height: '100%',
    width: '100%',
    backgroundColor: '#F3F5F7',
    border: '1px solid #D0D9E2',
    borderRadius: 4,
  },
  missingImg: {
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    color: '#5E6871',
    top: '50%',
    left: '50%',
    fontSize: 40,
  },
}));

type ImageThumbnailProps = {
  imageUrl: string;
  headerTitle?: string;
  className?: string;
};

const transition = forwardRef((
  props: SlideProps & {
    children?: React.ReactElement<any>;
  },
  ref: React.Ref<unknown>,
) => (
  <Slide direction="up" ref={ref} {...props} />
));

export default function ImageThumbnail({
  imageUrl,
  headerTitle,
  className,
}: ImageThumbnailProps): JSX.Element {
  const classes = useStyles();
  const [plotOpen, setPlotOpen] = useState(false);

  const handleClose = (): void => {
    setPlotOpen(false);
  };

  return (
    <>
      <Card elevation={0} className={clsx(classes.card, className)}>
        {imageUrl ? (
          <>
            <img className={classes.plotStyle} src={imageUrl} alt="" />
            <IconButton
              component="span"
              onClick={(): void => setPlotOpen(true)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: corePalette.white,
                zIndex: 10,
              }}
            >
              <MaximizeIcon />
            </IconButton>
          </>
        ) : (
          <div className={classes.plotStyle}>
            <ImageIcon className={classes.missingImg} />
          </div>
        )}
      </Card>
      <Dialog
        fullScreen
        open={plotOpen}
        onClose={handleClose}
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
        <DialogTitle>
          <Grid container justifyContent="space-between" alignItems="center" width="100%">
            <Grid>
              <CustomTypography variant="h6" fontWeight="bold">
                {headerTitle ?? ''}
              </CustomTypography>
            </Grid>
            <Grid>
              <IconButton onClick={handleClose}>
                <MinimizeIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <ZoomPanImageContainer url={imageUrl} title={headerTitle ?? ''} />
        </DialogContent>
      </Dialog>
    </>
  );
}
