import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useMemo, useState } from 'react';
import CustomTypography from '@/components/Common/Typography';
import {
  IComparisonSvDifference,
  IComparisonSvRow,
  useSvComparison,
} from '@/hooks/Comparison/useSvComparison';
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
  subgroupBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  subgroupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
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
      gridTemplateColumns: '1.1fr 0.95fr 0.95fr 0.95fr',
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
      gridTemplateColumns: '1.1fr 0.95fr 0.95fr 0.95fr',
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

type SvRowFilter = 'All' | 'Shared' | 'Unique' | 'Changed';

interface IProps {
  primaryAnalysisSetId: string;
  comparisonAnalysisSetId: string;
}

function getStatusClassName(
  status: SvRowFilter | IComparisonSvRow['status'],
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
  row: IComparisonSvRow['primary'];
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
        Event
        {' '}
        {row.eventLabel}
        {' | Frame '}
        {row.frame}
      </CustomTypography>
      <CustomTypography variant="bodySmall" color={corePalette.grey200}>
        Platform
        {' '}
        {row.platform}
        {' | VAF '}
        {row.vaf}
      </CustomTypography>
    </Box>
  );
}

function DifferenceSummary({
  row,
}: {
  row: IComparisonSvRow;
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
      {row.differences.map((difference: IComparisonSvDifference) => (
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

function SubgroupTable({
  label,
  rows,
}: {
  label: 'Fusions' | 'Disruptions';
  rows: IComparisonSvRow[];
}): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.subgroupBlock}>
      <Box className={classes.subgroupHeader}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          {label}
        </CustomTypography>
        <Chip className={classes.readOnlyChip} label={`${rows.length} rows`} size="small" />
      </Box>

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

        {rows.map((row) => (
          <Box className={classes.tableRow} key={row.id}>
            <Box className={classes.findingBlock}>
              <CustomTypography variant="bodyRegular" fontWeight="medium" truncate>
                {row.genes}
              </CustomTypography>
              <CustomTypography variant="bodySmall" color={corePalette.grey200} truncate>
                {row.primary?.breakpoint || row.comparison?.breakpoint || '-'}
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
    </Box>
  );
}

export default function SvComparisonSection({
  primaryAnalysisSetId,
  comparisonAnalysisSetId,
}: IProps): JSX.Element {
  const classes = useStyles();
  const [filter, setFilter] = useState<SvRowFilter>('All');
  const {
    loading,
    error,
    primaryIssue,
    comparisonIssue,
    rows,
    counts,
  } = useSvComparison(primaryAnalysisSetId, comparisonAnalysisSetId);

  const filteredRows = useMemo(() => (
    filter === 'All' ? rows : rows.filter((row) => row.status === filter)
  ), [filter, rows]);

  const fusionRows = useMemo(
    () => filteredRows.filter((row) => row.category === 'Fusion'),
    [filteredRows],
  );
  const disruptionRows = useMemo(
    () => filteredRows.filter((row) => row.category === 'Disruption'),
    [filteredRows],
  );

  const filterOptions: Array<{
    label: SvRowFilter;
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
          Loading SV comparison
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          Reportable structural variants are being prepared for both selected samples.
        </CustomTypography>
      </Box>
    );
  } else if (error) {
    content = (
      <Box className={classes.infoCard}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          Unable to load SV comparison
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
          No reportable SVs found
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          There are no reportable structural variants to compare for the currently
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
          Try another status filter to see the SV rows in this comparison.
        </CustomTypography>
      </Box>
    );
  } else {
    content = (
      <>
        {!!fusionRows.length && (
          <SubgroupTable label="Fusions" rows={fusionRows} />
        )}
        {!!disruptionRows.length && (
          <SubgroupTable label="Disruptions" rows={disruptionRows} />
        )}
      </>
    );
  }

  return (
    <Box
      className={classes.root}
      id="comparison-section-sv"
    >
      <Box className={classes.header}>
        <Box>
          <CustomTypography variant="h6" fontWeight="medium">
            SVs
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
            Reportable structural variants are split into fusions and disruptions
            so partner changes, breakpoints, frame, platform, and VAF can be
            compared side by side.
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
