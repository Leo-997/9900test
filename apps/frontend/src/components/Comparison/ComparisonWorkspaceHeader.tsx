import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { ComparisonSectionKey } from '@/types/Comparison.types';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: corePalette.white,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
  },
  infoChip: {
    backgroundColor: corePalette.blue30,
    color: corePalette.blue300,
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
  sampleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  sampleCard: {
    backgroundColor: corePalette.offWhite100,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sampleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  sampleChipPrimary: {
    backgroundColor: corePalette.green10,
    color: corePalette.green300,
    fontWeight: 500,
  },
  sampleChipComparison: {
    backgroundColor: corePalette.blue30,
    color: corePalette.blue300,
    fontWeight: 500,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  },
  metaItem: {
    minWidth: 0,
  },
  metaLabel: {
    marginBottom: '4px',
  },
  footerRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  footerChip: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
    fontWeight: 500,
  },
}));

interface IProps {
  primarySample: IAnalysisSet;
  comparisonSample: IAnalysisSet;
  selectedSections: ComparisonSectionKey[];
}

const getDiagnosisLabel = (sample: IAnalysisSet): string => (
  sample.zero2FinalDiagnosis
  || sample.histologicDiagnosis
  || sample.diagnosisEvent
  || '-'
);

function SampleOverviewCard({
  sample,
  label,
  chipClassName,
}: {
  sample: IAnalysisSet;
  label: string;
  chipClassName: string;
}): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.sampleCard}>
      <Box className={classes.sampleHeader}>
        <Box>
          <Chip
            className={chipClassName}
            label={label}
            size="small"
          />
          <CustomTypography variant="titleRegular" fontWeight="medium" mt="8px">
            {sample.analysisSetId}
          </CustomTypography>
        </Box>
        {sample.genePanel && (
          <Chip
            className={classes.footerChip}
            label={sample.genePanel}
            size="small"
          />
        )}
      </Box>

      <Box className={classes.metaGrid}>
        <Box className={classes.metaItem}>
          <CustomTypography
            variant="label"
            color={corePalette.grey100}
            className={classes.metaLabel}
          >
            PATIENT ID
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {sample.patientId || '-'}
          </CustomTypography>
        </Box>
        <Box className={classes.metaItem}>
          <CustomTypography
            variant="label"
            color={corePalette.grey100}
            className={classes.metaLabel}
          >
            ANALYSIS EVENT
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {sample.analysisEvent || '-'}
          </CustomTypography>
        </Box>
        <Box className={classes.metaItem}>
          <CustomTypography
            variant="label"
            color={corePalette.grey100}
            className={classes.metaLabel}
          >
            DIAGNOSIS
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {getDiagnosisLabel(sample)}
          </CustomTypography>
        </Box>
        <Box className={classes.metaItem}>
          <CustomTypography
            variant="label"
            color={corePalette.grey100}
            className={classes.metaLabel}
          >
            EVENT
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {sample.c1EventNum ?? '-'}
          </CustomTypography>
        </Box>
      </Box>

      <Box className={classes.footerRow}>
        {sample.study && (
          <Chip
            className={classes.footerChip}
            label={`Study ${sample.study}`}
            size="small"
          />
        )}
        {sample.publicSubjectId && (
          <Chip
            className={classes.footerChip}
            label={`Subject ${sample.publicSubjectId}`}
            size="small"
          />
        )}
      </Box>
    </Box>
  );
}

export default function ComparisonWorkspaceHeader({
  primarySample,
  comparisonSample,
  selectedSections,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.titleRow}>
        <Box>
          <Chip
            className={classes.infoChip}
            label="Comparison overview"
            size="small"
          />
          <CustomTypography variant="h5" fontWeight="medium" mt="12px">
            Sample comparison workspace
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
            This workspace is configured around one primary sample and one
            comparison sample, with only the selected sections shown below.
          </CustomTypography>
        </Box>
        <Chip
          className={classes.footerChip}
          label={`${selectedSections.length} section${selectedSections.length === 1 ? '' : 's'} selected`}
          size="small"
        />
      </Box>

      <Box className={classes.sampleGrid}>
        <SampleOverviewCard
          sample={primarySample}
          label="Primary sample"
          chipClassName={classes.sampleChipPrimary}
        />
        <SampleOverviewCard
          sample={comparisonSample}
          label="Comparison sample"
          chipClassName={classes.sampleChipComparison}
        />
      </Box>
    </Box>
  );
}
