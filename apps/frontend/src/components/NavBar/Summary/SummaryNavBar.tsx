import CustomChip from '@/components/Common/Chip';
import { CustomTabs } from '@/components/Common/Tabs';
import Gender from '@/components/VitalStatus/Gender';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import mapEvent from '@/utils/functions/mapEvent';
import {
    Grid, IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { XIcon } from 'lucide-react';
import { Dispatch, SetStateAction, type JSX } from 'react';
import { SummaryTabs } from '../../../types/Summary/Summary.types';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles(() => ({
  header: {
    zIndex: 500,
    borderRadius: 4,
    width: '100vw',
    margin: 0,
    height: '80px',
  },
}));

interface IProps {
  resourcesCategory: SummaryTabs;
  setResourcesCategory: Dispatch<SetStateAction<SummaryTabs>>;
  handleClose: () => void;
}

export default function SummaryNavBar({
  resourcesCategory,
  setResourcesCategory,
  handleClose,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { analysisSet, primaryBiosample } = useAnalysisSet();

  const canViewReport = useIsUserAuthorised('report.read');

  const isGermlineOnly = analysisSet.cohort === 'Cohort 13: Germline only';
  const isTSO = primaryBiosample?.sampleType === 'panel';

  return (
    <Grid container direction="row" justifyContent="space-between" wrap="nowrap" className={classes.header}>
      <Grid size={5} padding="16px 24px">
        <Grid container direction="row" alignItems="center" gap="8px" wrap="nowrap">
          <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
            Patient ID:
            &nbsp;
            {analysisSet.patientId}
          </CustomTypography>
          {analysisSet.vitalStatus && (
            <Gender vitalStatus={analysisSet.vitalStatus} gender={analysisSet.gender} />
          )}
          {isTSO && (
            <CustomChip
              label="TSO500"
              backgroundColour={corePalette.magenta10}
              colour={corePalette.magenta200}
            />
          )}
          {isGermlineOnly && (
            <CustomChip
              label="Germline Only"
              backgroundColour={corePalette.orange10}
              colour={corePalette.orange200}
            />
          )}
        </Grid>
        <Grid container direction="row" alignItems="center" wrap="nowrap" gap="10px">
          <CustomTypography variant="bodyRegular" truncate>
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
        </Grid>
      </Grid>
      <Grid size={6}>
        <Grid container direction="row" alignItems="center" style={{ height: '100%' }}>
          <CustomTabs
            variant="navigation"
            size="xlarge"
            value={resourcesCategory}
            tabs={[
              {
                label: 'Patient Profile',
                value: 'PATIENT',
              },
              {
                label: 'Molecular Profile',
                value: 'SUMMARY',
              },
              ...(canViewReport ? [{ label: 'Reports', value: 'REPORTS' }] : []),
            ]}
            onChange={(e, tab: SummaryTabs): void => setResourcesCategory(tab)}
          />
        </Grid>
      </Grid>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        minWidth="80px"
        size={1}
      >
        <IconButton onClick={handleClose}>
          <XIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}
