import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: corePalette.offWhite100,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  selectedChip: {
    backgroundColor: corePalette.green10,
    color: corePalette.green300,
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  },
  field: {
    minWidth: 0,
  },
  fieldLabel: {
    marginBottom: '4px',
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  metaChip: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
    fontWeight: 500,
  },
}));

interface IProps {
  label: string;
  sample: IAnalysisSet;
  onClear: () => void;
}

const getDiagnosisLabel = (sample: IAnalysisSet): string => (
  sample.zero2FinalDiagnosis
  || sample.histologicDiagnosis
  || sample.diagnosisEvent
  || '-'
);

export default function ComparisonSelectedSampleCard({
  label,
  sample,
  onClear,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box>
          <Chip
            className={classes.selectedChip}
            label={`${label} selected`}
            size="small"
          />
          <CustomTypography variant="titleRegular" fontWeight="medium" mt="8px">
            {sample.analysisSetId}
          </CustomTypography>
        </Box>
        <CustomButton
          label="Clear"
          onClick={onClear}
          size="small"
          variant="text"
        />
      </Box>

      <Box className={classes.fieldGrid}>
        <Box className={classes.field}>
          <CustomTypography
            variant="label"
            color={corePalette.grey100}
            className={classes.fieldLabel}
          >
            PATIENT ID
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {sample.patientId || '-'}
          </CustomTypography>
        </Box>
        <Box className={classes.field}>
          <CustomTypography
            variant="label"
            color={corePalette.grey100}
            className={classes.fieldLabel}
          >
            PUBLIC SUBJECT ID
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {sample.publicSubjectId || '-'}
          </CustomTypography>
        </Box>
        <Box className={classes.field}>
          <CustomTypography
            variant="label"
            color={corePalette.grey100}
            className={classes.fieldLabel}
          >
            ANALYSIS EVENT
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {sample.analysisEvent || '-'}
          </CustomTypography>
        </Box>
        <Box className={classes.field}>
          <CustomTypography
            variant="label"
            color={corePalette.grey100}
            className={classes.fieldLabel}
          >
            DIAGNOSIS
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {getDiagnosisLabel(sample)}
          </CustomTypography>
        </Box>
      </Box>

      <Box className={classes.metaRow}>
        {sample.study && (
          <Chip
            className={classes.metaChip}
            label={`Study ${sample.study}`}
            size="small"
          />
        )}
        {sample.c1EventNum !== undefined && (
          <Chip
            className={classes.metaChip}
            label={`Event ${sample.c1EventNum}`}
            size="small"
          />
        )}
        {sample.genePanel && (
          <Chip
            className={classes.metaChip}
            label={sample.genePanel}
            size="small"
          />
        )}
      </Box>
    </Box>
  );
}
