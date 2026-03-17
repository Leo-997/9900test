import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import {
  Box, DialogContent, DialogTitle, IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  Maximize2Icon, Minimize2Icon, SquareArrowOutDownRightIcon, SquareArrowOutUpLeftIcon, XIcon,
} from 'lucide-react';
import { useEffect, useState, type JSX } from 'react';
import { CIRCOS_PLOT_DATA } from '../../../constants/plots';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import CustomTypography from '../../Common/Typography';
import PlotInfoToolTip from '../../QCPlots/PlotInfoToolTip';
import ZoomPanImageContainer from '../../ZoomPanImage/ZoomPanImageContainer';

const useStyles = makeStyles(() => ({
  title: {
    paddingLeft: '25px',
    paddingTop: '20px',
  },
  expandIcon: {
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
  stickIconExpand: {
    marginLeft: 'auto',
    display: 'inline',
    top: 10,
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

interface ICircosViewProps {
  expandedView: boolean;
  isDock: boolean;
  toggleExpandedView: (state: boolean) => void;
  handleClose: () => void;
  toggleDock: (state: boolean) => void;
}

export default function CircosView({
  expandedView,
  isDock,
  toggleExpandedView,
  handleClose,
  toggleDock,
}: ICircosViewProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { tumourBiosample } = useAnalysisSet();

  const [plot, setPlot] = useState<string>();

  useEffect(() => {
    async function getCircosPlots(): Promise<void> {
      if (tumourBiosample?.biosampleId) {
        const data = await zeroDashSdk.plots.getCircosPlots(
          tumourBiosample.biosampleId,
        );

        if (data) setPlot(data.circos);
      }
    }

    getCircosPlots();
  }, [tumourBiosample?.biosampleId, zeroDashSdk.plots]);

  return (
    <>
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          width="100%"
        >
          <CustomTypography variant="h6" fontWeight="bold" className={classes.title}>
            Circos Plot
          </CustomTypography>
          <Box>
            <PlotInfoToolTip
              legendTitle="Circos Info"
              legendData={CIRCOS_PLOT_DATA.CIRCOS}
              className={classes.expandIcon}
            />

            {expandedView ? (
              <IconButton
                className={classes.expandIcon}
                onClick={(): void => toggleExpandedView(false)}
              >
                <Minimize2Icon />
              </IconButton>
            ) : (
              <IconButton
                className={classes.expandIcon}
                onClick={(): void => toggleExpandedView(true)}
              >
                <Maximize2Icon />
              </IconButton>
            )}
            {!expandedView && !isDock && (
              <IconButton
                className={classes.stickIconExpand}
                onClick={(): void => toggleDock(true)}
              >
                <SquareArrowOutUpLeftIcon />
              </IconButton>
            )}
            {!expandedView && isDock && (
              <IconButton
                className={classes.stickIconExpand}
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
          <ZoomPanImageContainer
            url={plot || ''}
            title="Circos Plot"
          />
        </Box>
      </DialogContent>
    </>
  );
}
