import { GermlineConsentChip } from '@/components/Chips/GermlineConsentChip';
import CustomChip from '@/components/Common/Chip';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useClinical } from '@/contexts/ClinicalContext';
import { corePalette } from '@/themes/colours';
import mapEvent from '@/utils/functions/mapEvent';
import {
  Box,
  AppBar as MuiAppBar,
  Toolbar as MuiToolbar,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChevronLeft } from 'lucide-react';
import CustomTypography from '../../../Common/Typography';

import type { JSX } from "react";

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  height: '80px',
  backgroundColor: theme.colours.core.offBlack100,
  color: theme.colours.core.white,
  boxShadow: 'none',
  position: 'relative',
}));

const Toolbar = styled(MuiToolbar)({
  height: '100%',
  width: '100vw',
  padding: '0 32px !important',
});

const useStyles = makeStyles(() => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 'auto',
    marginLeft: 'auto',
    paddingLeft: 21,
  },
  sampleId: {
    color: '#D0D9E2',
    marginRight: 5,
  },
  patientId: {
    color: '#FFFFFF',
    fontWeight: 500,
    marginRight: '10px',
  },
  link: {
    color: '#FFFFFF',
    textDecoration: 'underline',
    cursor: 'pointer',
    gap: '10px',
    '&:hover': {
      color: '#FFFFFF',
    },
    '&:focus': {
      color: '#FFFFFF',
    },
  },
  clinicalStatusChip: {
    height: '22px',
    border: '0.01em solid #D0D9E2',
    borderRadius: '4px',
    backgroundColor: '#030313',
    color: '#FAFBFC',
    textTransform: 'uppercase',
    fontSize: '11px',
    marginRight: '10px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& span': {
      padding: '0 6px',
    },
  },
}));

interface INavBarProps {
  status?: string;
  returnTo?: string;
  returnFn?: () => void;
}

export default function NavBar({
  status,
  returnTo,
  returnFn,
}: INavBarProps): JSX.Element {
  const classes = useStyles();
  const { analysisSet, demographics } = useAnalysisSet();
  const { clinicalVersion } = useClinical();

  return (
    <AppBar>
      <Toolbar>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          onClick={returnFn}
          className={classes.link}
        >
          <ChevronLeft />
          <CustomTypography
            variant="bodyRegular"
            sx={{
              color: corePalette.white,
            }}
          >
            Return
            {returnTo ? ` to: ${returnTo}` : ''}
          </CustomTypography>
        </Box>
        <Box className={classes.header}>
          <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center" width="100%">
            <CustomTypography variant="titleRegular" color={corePalette.white} marginRight="8px">
              Patient ID:
              {' '}
              {analysisSet.patientId}
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" gap="8px">
            <CustomTypography truncate variant="bodyRegular" color={corePalette.grey50}>
              {mapEvent(analysisSet.sequencedEvent, true)}
            </CustomTypography>
            {status && (
              <CustomChip
                label={clinicalVersion.status}
                className={classes.clinicalStatusChip}
                colour={corePalette.grey10}
                backgroundColour={corePalette.offBlack200}
                sx={{
                  marginLeft: '8px',
                  border: `1px solid ${corePalette.grey10}`,
                }}
              />
            )}
            {demographics && (
              <GermlineConsentChip germlineConsent={demographics} />
            )}
          </Box>
        </Box>
        <Box width="250px" />
      </Toolbar>
    </AppBar>
  );
}
