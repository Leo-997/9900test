import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';
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
    scrollMarginTop: '120px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  statusChip: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
    fontWeight: 500,
  },
  legendRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  sharedChip: {
    backgroundColor: corePalette.green10,
    color: corePalette.green300,
    fontWeight: 500,
  },
  uniqueChip: {
    backgroundColor: corePalette.blue30,
    color: corePalette.blue300,
    fontWeight: 500,
  },
  changedChip: {
    backgroundColor: corePalette.yellow30,
    color: corePalette.yellow300,
    fontWeight: 500,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  summaryCard: {
    backgroundColor: corePalette.offWhite100,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tableShell: {
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: corePalette.offWhite100,
    borderBottom: `1px solid ${corePalette.grey30}`,
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 120px',
    gap: '12px',
    padding: '14px 16px',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1.2fr 1fr 1fr 96px',
    },
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 120px',
    gap: '12px',
    padding: '14px 16px',
    borderBottom: `1px solid ${corePalette.grey30}`,
    '&:last-child': {
      borderBottom: 'none',
    },
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1.2fr 1fr 1fr 96px',
    },
  },
  findingBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  metricBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
}));

interface IProps {
  sectionKey: ComparisonSectionKey;
  sectionLabel: string;
}

const getPlaceholderCopy = (
  sectionKey: ComparisonSectionKey,
): string => {
  switch (sectionKey) {
    case 'summary':
      return 'Aligned sample metadata and summary values will render here.';
    case 'snv':
      return 'Read-only SNV rows will show shared, unique, and changed findings here.';
    case 'cnv':
      return 'CNV findings and changed copy number values will render here.';
    case 'sv':
      return 'SV, fusion, and disruption findings will render here.';
    case 'rna':
      return 'RNASeq marker changes and expression shifts will render here.';
    case 'cytogenetics':
      return 'Cytogenetics comparison rows will render here.';
    case 'germline':
      return 'Germline findings across both samples will render here.';
    case 'methylation':
      return 'Methylation classifiers, scores, and calls will render here.';
    default:
      return 'Comparison content for this section will render here.';
  }
};

const getPreviewRows = (
  sectionKey: ComparisonSectionKey,
): Array<{
  finding: string;
  detail: string;
  primary: string;
  comparison: string;
  status: string;
}> => {
  switch (sectionKey) {
    case 'snv':
      return [
        {
          finding: 'Gene / variant',
          detail: 'SNV row alignment preview',
          primary: 'VAF, protein change',
          comparison: 'VAF, protein change',
          status: 'Changed',
        },
        {
          finding: 'Shared finding',
          detail: 'Shared variant preview',
          primary: 'Present',
          comparison: 'Present',
          status: 'Shared',
        },
      ];
    case 'cnv':
      return [
        {
          finding: 'Gene / region',
          detail: 'CNV row alignment preview',
          primary: 'Copy number',
          comparison: 'Copy number',
          status: 'Changed',
        },
        {
          finding: 'Unique amplification',
          detail: 'Unique CNV preview',
          primary: 'Present',
          comparison: 'Not present',
          status: 'Unique',
        },
      ];
    case 'sv':
      return [
        {
          finding: 'Fusion / disruption',
          detail: 'Breakpoint preview',
          primary: 'Partner, frame',
          comparison: 'Partner, frame',
          status: 'Shared',
        },
        {
          finding: 'Unique structural event',
          detail: 'SV-only preview',
          primary: 'Present',
          comparison: 'Not present',
          status: 'Unique',
        },
      ];
    case 'rna':
      return [
        {
          finding: 'RNA marker',
          detail: 'Expression marker preview',
          primary: 'Fold change, z-score',
          comparison: 'Fold change, z-score',
          status: 'Changed',
        },
        {
          finding: 'Shared expression finding',
          detail: 'RNA result preview',
          primary: 'Present',
          comparison: 'Present',
          status: 'Shared',
        },
      ];
    case 'cytogenetics':
      return [
        {
          finding: 'Cytoband / chromosome',
          detail: 'Cytogenetics row preview',
          primary: 'Call',
          comparison: 'Call',
          status: 'Changed',
        },
        {
          finding: 'Unique cytogenetic call',
          detail: 'Presence preview',
          primary: 'Present',
          comparison: 'Not present',
          status: 'Unique',
        },
      ];
    case 'germline':
      return [
        {
          finding: 'Germline finding',
          detail: 'Variant preview',
          primary: 'Classification',
          comparison: 'Classification',
          status: 'Shared',
        },
        {
          finding: 'Additional germline call',
          detail: 'Presence preview',
          primary: 'Present',
          comparison: 'Not present',
          status: 'Unique',
        },
      ];
    case 'methylation':
      return [
        {
          finding: 'Classifier result',
          detail: 'Classifier and score preview',
          primary: 'Class, score',
          comparison: 'Class, score',
          status: 'Changed',
        },
        {
          finding: 'Secondary classifier',
          detail: 'Additional call preview',
          primary: 'Present',
          comparison: 'Present',
          status: 'Shared',
        },
      ];
    default:
      return [
        {
          finding: 'Finding',
          detail: 'Comparison preview',
          primary: 'Value',
          comparison: 'Value',
          status: 'Changed',
        },
      ];
  }
};

const getStatusClassName = (
  status: string,
  classes: ReturnType<typeof useStyles>,
): string => {
  switch (status) {
    case 'Shared':
      return classes.sharedChip;
    case 'Unique':
      return classes.uniqueChip;
    case 'Changed':
      return classes.changedChip;
    default:
      return classes.statusChip;
  }
};

export default function ComparisonSectionPlaceholder({
  sectionKey,
  sectionLabel,
}: IProps): JSX.Element {
  const classes = useStyles();
  const previewRows = getPreviewRows(sectionKey);

  return (
    <Box
      className={classes.root}
      id={`comparison-section-${sectionKey}`}
    >
      <Box className={classes.header}>
        <Box>
          <CustomTypography variant="h6" fontWeight="medium">
            {sectionLabel}
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
            {getPlaceholderCopy(sectionKey)}
          </CustomTypography>
        </Box>
        <Chip className={classes.statusChip} label="Scaffold" size="small" />
      </Box>

      <Box className={classes.legendRow}>
        <Chip className={classes.sharedChip} label="Shared" size="small" />
        <Chip className={classes.uniqueChip} label="Unique" size="small" />
        <Chip className={classes.changedChip} label="Changed" size="small" />
      </Box>

      {sectionKey === 'summary' ? (
        <Box className={classes.summaryGrid}>
          <Box className={classes.summaryCard}>
            <CustomTypography variant="titleRegular" fontWeight="medium">
              Primary sample summary
            </CustomTypography>
            <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
              Summary metrics, assay availability, and sample metadata will
              appear in an aligned comparison layout here.
            </CustomTypography>
          </Box>
          <Box className={classes.summaryCard}>
            <CustomTypography variant="titleRegular" fontWeight="medium">
              Comparison sample summary
            </CustomTypography>
            <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
              Matching metadata and changed values will appear side by side
              here once summary comparison is added.
            </CustomTypography>
          </Box>
        </Box>
      ) : (
        <Box className={classes.tableShell}>
          <Box className={classes.tableHeader}>
            <CustomTypography variant="label" color={corePalette.grey100}>
              FINDING
            </CustomTypography>
            <CustomTypography variant="label" color={corePalette.grey100}>
              PRIMARY
            </CustomTypography>
            <CustomTypography variant="label" color={corePalette.grey100}>
              COMPARISON
            </CustomTypography>
            <CustomTypography variant="label" color={corePalette.grey100}>
              STATUS
            </CustomTypography>
          </Box>

          {previewRows.map((row) => (
            <Box className={classes.tableRow} key={`${sectionKey}-${row.finding}`}>
              <Box className={classes.findingBlock}>
                <CustomTypography variant="bodyRegular" fontWeight="medium" truncate>
                  {row.finding}
                </CustomTypography>
                <CustomTypography variant="bodySmall" color={corePalette.grey200} truncate>
                  {row.detail}
                </CustomTypography>
              </Box>
              <Box className={classes.metricBlock}>
                <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
                  {row.primary}
                </CustomTypography>
              </Box>
              <Box className={classes.metricBlock}>
                <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
                  {row.comparison}
                </CustomTypography>
              </Box>
              <Box>
                <Chip
                  className={getStatusClassName(row.status, classes)}
                  label={row.status}
                  size="small"
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
