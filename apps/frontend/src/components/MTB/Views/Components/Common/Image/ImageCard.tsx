import { ReactNode, useState, type JSX } from 'react';
import {
  Box,
  CardContent,
  IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { corePalette } from '@/themes/colours';
import { ImageIcon, MaximizeIcon } from 'lucide-react';
import { ISlideAttachment } from '../../../../../../types/MTB/MTB.types';
import ImageFullScreenDialog from './ImageFullScreenDialog';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    padding: '0px !important',
    '&:last-child': {
      padding: '0px',
    },
  },
  imageStyle: {
    width: '100%',
    left: '0px',
    top: '0px',
    display: 'block',
    borderRadius: '4px',
    border: '1px solid #D0D9E2',
    background: '#F3F5F7',
  },
  cardTitle: {
    color: '#022034',
    fontWeight: 700,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
  },
  dialogTitle: {
    padding: '21px 40px 0 40px',
  },
  modal: {
    height: '100%',
    width: '100%',
  },
  expandImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 18,
    padding: '5px',
    margin: '1px',
    backgroundColor: '#FFFFFF',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: '#F1F1F1',
    },
  },
  icon: {
    backgroundColor: '#FFFFFF',
    fontSize: 18,
    padding: '5px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: '#F1F1F1',
    },
  },
  missingImg: {
    color: '#5E6871',
    fontSize: '40px',
  },
}));

interface IProps {
  file: ISlideAttachment;
  actions?: ReactNode;
}

export default function ImageCard({
  file,
  actions,
}: IProps): JSX.Element {
  const classes = useStyles();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <CardContent className={classes.root}>
      {file.url ? (
        <img
          className={classes.imageStyle}
          src={file.url}
          alt={file.title}
        />
      ) : (
        <div
          style={{ position: 'relative' }}
          className={classes.imageStyle}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="0px"
            paddingTop="50%"
            paddingBottom="50%"
          >
            <ImageIcon className={classes.missingImg} />
          </Box>
        </div>
      )}
      {/* Class name here is used for MTB export */}
      <div className="img-actions" style={{ position: 'absolute', width: '100%' }}>
        {actions || (
          <IconButton
            component="span"
            className={classes.expandImage}
            onClick={(): void => setModalOpen(true)}
            sx={{ backgroundColor: corePalette.white }}
          >
            <MaximizeIcon />
          </IconButton>
        )}
      </div>
      <ImageFullScreenDialog
        open={modalOpen}
        onClose={(): void => setModalOpen(false)}
        file={file}
      />
    </CardContent>
  );
}
