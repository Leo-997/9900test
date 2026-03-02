import {
  Box, DialogContent, DialogTitle, IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import {
  ArrowLeftIcon,
  Maximize2Icon,
  Minimize2Icon,
  RotateCcwIcon,
  SquareArrowOutDownRightIcon,
  SquareArrowOutUpLeftIcon,
  XIcon,
} from 'lucide-react';
import { useState, type JSX } from 'react';
import { LinxPlot } from '../../../types/Plot.types';
import CustomTypography from '../../Common/Typography';
import ZoomPanImageContainer from '../../ZoomPanImage/ZoomPanImageContainer';
import LinxContent from './LinxContent';
import NewLinxPlotModal from './NewLinxPlotModal';

const useStyles = makeStyles(() => ({
  title: {
    paddingLeft: '25px',
    paddingTop: '11px',
  },
  icon: {
    marginLeft: 'auto',
    display: 'inline',
    top: 10,
  },
  closeIconExpand: {
    marginLeft: 'auto',
    display: 'inline',
    top: 10,
    marginRight: '25px',
  },
  modalExpanIcon: {
    display: 'inline',
    marginTop: '15px',
    width: '40px',
    height: '40px',
    background: '#FFFFFF',
    border: '1px solid #ECF0F3',
    boxSizing: 'border-box',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
    borderRadius: '100px',
    position: 'absolute',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F5F7',
    },
  },
  modalExpanIconReverse: {
    marginLeft: 'auto',
    display: 'inline',
    marginTop: '15px',
    width: '40px',
    height: '40px',
    background: '#FFFFFF',
    border: '1px solid #ECF0F3',
    boxSizing: 'border-box',
    borderRadius: '100px',
    transform: 'rotate(-180deg)',
    position: 'absolute',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F5F7',
    },
  },
}));

interface ILibraryViewProps {
  expandedView: boolean;
  isDock: boolean;
  toggleExpandedView: (state: boolean) => void;
  handleClose: () => void;
  toggleDock: (state: boolean) => void;
}

export default function LinxView({
  expandedView,
  isDock,
  toggleExpandedView,
  handleClose,
  toggleDock,
}: ILibraryViewProps): JSX.Element {
  const classes = useStyles();

  const [currentPlot, setCurrentPlot] = useState<string>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(true);
  const [plots, setPlots] = useState<LinxPlot[]>([]);

  const triggerRefetch = (): void => {
    setRefetch(true);
  };

  const goToLinxList = (): void => {
    setCurrentPlot('');
  };

  return (
    <>
      <DialogTitle
        style={{ position: 'initial' }}
        id="draggable-dialog-title"
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Box display="flex" alignItems="center">
            {currentPlot && (
              <IconButton
                className={clsx(classes.icon)}
                onClick={(): void => goToLinxList()}
              >
                <ArrowLeftIcon />
              </IconButton>
            )}
            <CustomTypography
              variant="h6"
              fontWeight="bold"
              className={classes.title}
            >
              Linx
            </CustomTypography>
          </Box>
          <Box>
            <IconButton
              className={classes.icon}
              onClick={(): void => triggerRefetch()}
            >
              <RotateCcwIcon />
            </IconButton>
            {expandedView ? (
              <IconButton
                className={classes.icon}
                onClick={(): void => toggleExpandedView(false)}
              >
                <Minimize2Icon />
              </IconButton>
            ) : (
              <IconButton
                className={classes.icon}
                onClick={(): void => toggleExpandedView(true)}
              >
                <Maximize2Icon />
              </IconButton>
            )}
            {!expandedView && !isDock && (
              <IconButton
                className={classes.icon}
                onClick={(): void => toggleDock(true)}
              >
                <SquareArrowOutUpLeftIcon />
              </IconButton>
            )}
            {!expandedView && isDock && (
              <IconButton
                className={classes.icon}
                onClick={(): void => toggleDock(false)}
              >
                <SquareArrowOutDownRightIcon />
              </IconButton>
            )}
            <IconButton
              className={classes.closeIconExpand}
              onClick={handleClose}
            >
              <XIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box style={{ height: '100%', width: '100%' }}>
          {currentPlot ? (
            <ZoomPanImageContainer
              url={currentPlot}
              title="Linx Plot"
            />
          ) : (
            <LinxContent
              refetch={refetch}
              plots={plots}
              setRefetch={setRefetch}
              setPlots={setPlots}
              setCurrentPlot={setCurrentPlot}
              setNewPlotModal={setModalOpen}
            />
          )}
        </Box>
      </DialogContent>
      <NewLinxPlotModal open={modalOpen} closeModal={(): void => { setModalOpen(false); }} />
    </>
  );
}
