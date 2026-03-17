import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useMemo, useState } from 'react';
import CustomTypography from '@/components/Common/Typography';
import {
  IComparisonSnvDifference,
  IComparisonSnvRow,
  useSnvComparison,
} from '@/hooks/Comparison/useSnvComparison';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: corePalette.white,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    scrollMarginTop: '120px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  readOnlyChip: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
    fontWeight: 500,
  },
  controlsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
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
  filterChipActive: {
    backgroundColor: corePalette.offBlack100,
    color: corePalette.white,
    fontWeight: 500,
  },
  infoCard: {
    backgroundColor: corePalette.offWhite100,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  issueCard: {
    backgroundColor: corePalette.offWhite100,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  issueBlock: {
    minWidth: 0,
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
    gridTemplateColumns: '1.2fr 0.95fr 0.95fr 1fr',
    gap: '10px',
    padding: '10px 14px',
    '@media (max-width: 1200px)': {
      gridTemplateColumns: '1.15fr 0.95fr 0.95fr 0.95fr',
    },
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.95fr 0.95fr 1fr',
    gap: '10px',
    padding: '10px 14px',
    borderBottom: `1px solid ${corePalette.grey30}`,
    alignItems: 'flex-start',
    '&:last-child': {
      borderBottom: 'none',
    },
    '@media (max-width: 1200px)': {
      gridTemplateColumns: '1.15fr 0.95fr 0.95fr 0.95fr',
    },
  },
  findingBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  metricsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statusBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  differenceBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  notPresentChip: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
}));

type SnvRowFilter = 'All' | 'Shared' | 'Unique' | 'Changed';

interface IProps {
  primaryAnalysisSetId: string;
  comparisonAnalysisSetId: string;
}

function getStatusClassName(
  status: SnvRowFilter | IComparisonSnvRow['status'],
  classes: ReturnType<typeof useStyles>,
): string {
  switch (status) {
    case 'Shared':
      return classes.sharedChip;
    case 'Unique':
      return classes.uniqueChip;
    case 'Changed':
      return classes.changedChip;
    default:
      return classes.readOnlyChip;
  }
}

function MetricsCell({
  row,
}: {
  row: IComparisonSnvRow['primary'];
}): JSX.Element {
  const classes = useStyles();

  if (!row?.present) {
    return (
      <Chip className={classes.notPresentChip} label="Not present" size="small" />
    );
  }

  return (
    <Box className={classes.metricsBlock}>
      <CustomTypography variant="bodySmall" color={corePalette.grey200}>
        DNA
        {' '}
        {row.dnaVaf}
        {' | RNA '}
        {row.rnaVaf}
      </CustomTypography>
      <CustomTypography variant="bodySmall" color={corePalette.grey200}>
        Zyg
        {' '}
        {row.zygosity}
        {' | LOH '}
        {row.loh}
      </CustomTypography>
      <CustomTypography variant="bodySmall" color={corePalette.grey200}>
        Pathclass
        {' '}
        {row.pathclass}
      </CustomTypography>
    </Box>
  );
}

function DifferenceSummary({
  row,
}: {
  row: IComparisonSnvRow;
}): JSX.Element | null {
  const classes = useStyles();

  if (row.status === 'Unique') {
    return (
      <CustomTypography variant="bodySmall" color={corePalette.grey200}>
        {row.uniqueTo === 'primary' ? 'Primary only' : 'Comparison only'}
      </CustomTypography>
    );
  }

  if (!row.differences.length) {
    return null;
  }

  return (
    <Box className={classes.differenceBlock}>
      {row.differences.map((difference: IComparisonSnvDifference) => (
        <CustomTypography
          key={`${row.id}-${difference.label}`}
          variant="bodySmall"
          color={corePalette.grey200}
        >
          {difference.label}
          {': '}
          {difference.primary}
          {' -> '}
          {difference.comparison}
        </CustomTypography>
      ))}
    </Box>
  );
}

export default function SnvComparisonSection({
  primaryAnalysisSetId,
  comparisonAnalysisSetId,
}: IProps): JSX.Element {
  const classes = useStyles();
  const [filter, setFilter] = useState<SnvRowFilter>('All');
  const {
    loading,
    error,
    primaryIssue,
    comparisonIssue,
    rows,
    counts,
  } = useSnvComparison(primaryAnalysisSetId, comparisonAnalysisSetId);

  const filteredRows = useMemo(() => (
    filter === 'All' ? rows : rows.filter((row) => row.status === filter)
  ), [filter, rows]);

  const filterOptions: Array<{
    label: SnvRowFilter;
    count: number;
    className: string;
  }> = [
    { label: 'All', count: rows.length, className: classes.readOnlyChip },
    { label: 'Changed', count: counts.changed, className: classes.changedChip },
    { label: 'Unique', count: counts.unique, className: classes.uniqueChip },
    { label: 'Shared', count: counts.shared, className: classes.sharedChip },
  ];

  let content: JSX.Element;

  if (loading) {
    content = (
      <Box className={classes.infoCard}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          Loading SNV comparison
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          Reportable somatic SNVs are being prepared for both selected samples.
        </CustomTypography>
      </Box>
    );
  } else if (error) {
    content = (
      <Box className={classes.infoCard}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          Unable to load SNV comparison
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          {error}
        </CustomTypography>
      </Box>
    );
  } else if (!rows.length) {
    content = (
      <Box className={classes.infoCard}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          No reportable SNVs found
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          There are no reportable somatic SNVs to compare for the currently
          selected samples.
        </CustomTypography>
      </Box>
    );
  } else if (!filteredRows.length) {
    content = (
      <Box className={classes.infoCard}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          No rows match this filter
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          Try another status filter to see the SNV rows in this comparison.
        </CustomTypography>
      </Box>
    );
  } else {
    content = (
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
            STATUS / DIFF
          </CustomTypography>
        </Box>

        {filteredRows.map((row) => (
          <Box className={classes.tableRow} key={row.id}>
            <Box className={classes.findingBlock}>
              <CustomTypography variant="bodyRegular" fontWeight="medium" truncate>
                {row.gene}
              </CustomTypography>
              <CustomTypography variant="bodySmall" color={corePalette.grey200} truncate>
                {row.variant}
              </CustomTypography>
              <CustomTypography variant="bodySmall" color={corePalette.grey200} truncate>
                {'Protein: '}
                {row.protein}
              </CustomTypography>
            </Box>

            <MetricsCell row={row.primary} />
            <MetricsCell row={row.comparison} />

            <Box className={classes.statusBlock}>
              <Chip
                className={getStatusClassName(row.status, classes)}
                label={row.status}
                size="small"
              />
              <DifferenceSummary row={row} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box
      className={classes.root}
      id="comparison-section-snv"
    >
      <Box className={classes.header}>
        <Box>
          <CustomTypography variant="h6" fontWeight="medium">
            SNVs
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
            Reportable somatic SNVs are aligned row by row across the selected
            samples using shared, unique, and changed states.
          </CustomTypography>
        </Box>
        <Chip className={classes.readOnlyChip} label="Read only" size="small" />
      </Box>

      <Box className={classes.controlsRow}>
        {filterOptions.map((item) => (
          <Chip
            clickable
            key={item.label}
            label={`${item.label} ${item.count}`}
            onClick={() => setFilter(item.label)}
            className={filter === item.label ? classes.filterChipActive : item.className}
          />
        ))}
      </Box>

      {(primaryIssue || comparisonIssue) && (
        <Box className={classes.issueCard}>
          <Box className={classes.issueBlock}>
            <CustomTypography variant="label" color={corePalette.grey100}>
              PRIMARY SAMPLE
            </CustomTypography>
            <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
              {primaryIssue || 'Tumour DNA biosample available.'}
            </CustomTypography>
          </Box>
          <Box className={classes.issueBlock}>
            <CustomTypography variant="label" color={corePalette.grey100}>
              COMPARISON SAMPLE
            </CustomTypography>
            <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
              {comparisonIssue || 'Tumour DNA biosample available.'}
            </CustomTypography>
          </Box>
        </Box>
      )}

      {content}
    </Box>
  );
}
