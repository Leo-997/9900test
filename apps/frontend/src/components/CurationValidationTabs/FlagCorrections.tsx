import {
  Badge,
  Box,
  IconButton,
  LinearProgress,
  Popover,
} from '@mui/material';
import { useMemo, useRef, useState, type JSX } from 'react';

import { makeStyles } from '@mui/styles';

import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import clsx from 'clsx';
import { Flag, FlagIcon } from 'lucide-react';
import CorrectionsList from './CorrectionsList';

import { useCuration } from '../../contexts/CurationContext';
import CustomButton from '../Common/Button';
import CustomTypography from '../Common/Typography';
import CorrectionFlagModal from '../CorrectionFlag/CorrectionFlagModal';
import NoFlagIcon from '../CustomIcons/NoFlagIcon';
import FlagFailedSampleDialog from './FlagFailedSampleDialog';

type Props = {
  isCompactMode?: boolean;
};

const useStyles = makeStyles(() => ({
  barWrapper: {
    display: 'flex',
    zIndex: 10,
    flexDirection: 'column',
    width: 475,
    maxHeight: 850,
    marginTop: 32,
  },
  noFlagContainer: {
    height: 330,
    padding: '24px',
  },
  textContainer1: {
    font: 'Roboto',
    font_weight: 500,
    fontSize: 24,
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 24,
    marginRight: 24,
    textAlign: 'center',
  },
  noFlagIcon: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  textContainer2: {
    font: 'Roboto',
    fontSize: 14,

    marginBottom: 20,
    marginLeft: 38,
    marginRight: 38,
    textAlign: 'center',
  },
  compactMode: {
    marginLeft: 'auto',
  },
  dotNoFlags: {
    display: 'none',
  },
  dotFlags: {
    backgroundColor: corePalette.orange100,
  },
  dotAllFlagsCorrected: {
    backgroundColor: corePalette.green150,
  },
  uptoDateText: {
    fontWeight: 700,
    marginBottom: 14,
  },
  colourPrimary: {
    marginTop: 15,
    backgroundColor: corePalette.grey30,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    gap: '16px',
  },
}));

export default function FlagCorrections({
  isCompactMode,
}: Props): JSX.Element {
  const { allFlagsCorrected, correctionFlags, isAssignedCurator } = useCuration();
  const classes = useStyles();

  const [flagsPopperOpen, setFlagsPopperOpen] = useState<boolean>(false);
  const [newFlagOpen, setNewFlagOpen] = useState<boolean>(false);
  const [failedSampleOpen, setFailedSampleOpen] = useState<boolean>(false);

  const canFlag = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator);

  const anchorRef = useRef<HTMLButtonElement>(null);
  const totalCorrected = useMemo<number>(() => (
    correctionFlags.filter((c) => c.isCorrected).length
  ), [correctionFlags]);

  const handleToggle = (): void => {
    setFlagsPopperOpen((prev) => !prev);
  };

  return (
    <Box className={isCompactMode ? classes.compactMode : ''}>
      <IconButton ref={anchorRef} onClick={handleToggle} sx={{ marginRight: '8px', color: corePalette.offBlack100 }}>
        <Badge
          badgeContent=" "
          variant="dot"
          overlap="circular"
          classes={{
            badge: clsx({
              [classes.dotNoFlags]: correctionFlags.length === 0,
              [classes.dotAllFlagsCorrected]: correctionFlags.length !== 0 && allFlagsCorrected,
              [classes.dotFlags]: correctionFlags.length !== 0 && !allFlagsCorrected,
            }),
          }}
        >
          <FlagIcon width="20px" height="20px" fill={flagsPopperOpen ? 'currentColor' : 'none'} />
        </Badge>
      </IconButton>

      <Popover
        open={flagsPopperOpen}
        anchorEl={anchorRef.current}
        onClose={((): void => setFlagsPopperOpen(false))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {correctionFlags.length ? (
          <Box display="flex" flexDirection="column">
            <div style={{ padding: 26 }}>
              <CustomTypography variant="h6" className={classes.uptoDateText}>
                {allFlagsCorrected
                  ? 'Corrections up to date'
                  : 'Corrections in progress'}
              </CustomTypography>
              <CustomTypography variant="label">
                {allFlagsCorrected
                  ? `${correctionFlags.length} corrections addressed`
                  : `${totalCorrected} of ${correctionFlags.length} corrected`}
              </CustomTypography>
              <LinearProgress
                classes={{
                  colorPrimary: classes.colourPrimary,
                }}
                sx={{
                  backgroundColor: allFlagsCorrected ? corePalette.green150 : corePalette.orange100,
                }}
                variant="determinate"
                value={(totalCorrected / correctionFlags.length) * 100}
              />
            </div>
            <CorrectionsList />
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            className={classes.noFlagContainer}
          >
            <Box className={classes.noFlagIcon}>
              <NoFlagIcon />
            </Box>
            <Box>
              <CustomTypography className={classes.textContainer1}>
                No flags added
              </CustomTypography>
            </Box>
            <Box>
              <CustomTypography className={classes.textContainer2}>
                Nothing has been flagged for correction for this sample
              </CustomTypography>
            </Box>
          </Box>
        )}
        <Box
          display="flex"
          className={classes.actions}
        >
          <CustomButton
            size="medium"
            label="Flag sample as failed"
            variant="warning"
            onClick={(): void => setFailedSampleOpen(true)}
            disabled={!canFlag}
          />
          <CustomButton
            startIcon={<Flag />}
            size="medium"
            label="Flag for corrections"
            onClick={(): void => setNewFlagOpen(true)}
            variant="bold"
            disabled={!canFlag}
          />
        </Box>
      </Popover>
      {failedSampleOpen && (
        <FlagFailedSampleDialog
          open={failedSampleOpen}
          setOpen={setFailedSampleOpen}
        />
      )}
      {newFlagOpen && (
        <CorrectionFlagModal
          open={newFlagOpen}
          onClose={(): void => setNewFlagOpen(false)}
        />
      )}
    </Box>
  );
}
