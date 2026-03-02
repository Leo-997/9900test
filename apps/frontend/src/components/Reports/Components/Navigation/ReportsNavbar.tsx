import {
  Box,
  AppBar as MuiAppBar,
  Toolbar as MuiToolbar,
  styled,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import type { JSX } from 'react';
import CustomChip from '@/components/Common/Chip';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import mapEvent from '@/utils/functions/mapEvent';
import { usePatient } from '../../../../contexts/PatientContext';
import CustomButton from '../../../Common/Button';
import CustomTypography from '../../../Common/Typography';
import ZeroLogoWithRec from '../../../CustomIcons/ZeroLogoWithRec';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  height: '80px',
  backgroundColor: theme.colours.core.white,
  color: theme.colours.core.offBlack100,
  boxShadow: 'none',
  position: 'relative',
  zIndex: 0,
}));

const Toolbar = styled(MuiToolbar)(({ theme }) => ({
  borderBottom: `1px solid ${theme.colours.core.grey50}`,
  overflow: 'hidden',
  height: '100%',
  padding: 0,

  '&.MuiToolbar-gutters': {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export default function ReportsNavbar(): JSX.Element {
  const { patient } = usePatient();
  const { analysisSet } = useAnalysisSet();

  return (
    <AppBar>
      <Toolbar>
        <Box borderRight={`1px solid ${corePalette.grey50}`}>
          <Link to="/reports" style={{ padding: '0px' }}>
            <ZeroLogoWithRec props={{ style: { width: '76px', height: '80px' } }} fill={corePalette.white} />
          </Link>
        </Box>
        <Box display="flex" flexDirection="column" paddingLeft="24px">
          <CustomTypography variant="titleRegular" fontWeight="medium">
            Patient ID:
            {' '}
            {patient?.patientId}
          </CustomTypography>
          <Box display="flex" gap="8px" alignItems="center">
            <CustomTypography truncate>
              Event:
              {' '}
              {mapEvent(analysisSet.sequencedEvent, true)}
            </CustomTypography>
            {analysisSet.zero2FinalDiagnosis && (
              <CustomChip
                size="medium"
                label={analysisSet.zero2FinalDiagnosis}
                backgroundColour={corePalette.green10}
                colour={corePalette.green300}
              />
            )}
          </Box>
        </Box>
        <Box display="flex" gap="10px" marginLeft="auto" paddingRight="64px" alignItems="center">
          <Link to={`/${patient?.patientId}/${analysisSet.analysisSetId}/curation`} target="_blank">
            <CustomButton
              variant="outline"
              label="Go to Curation"
              size="small"
              endIcon={
                <ArrowUpRightIcon />
              }
            />
          </Link>
          <Link to={`/${patient?.patientId}/${analysisSet.analysisSetId}/clinical/latest/mtb/OVERVIEW`} target="_blank">
            <CustomButton
              variant="outline"
              label="Go to Clinical"
              size="small"
              endIcon={
                <ArrowUpRightIcon />
              }
            />
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
