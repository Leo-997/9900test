import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useMemo, useState } from 'react';
import CustomTypography from '@/components/Common/Typography';
import {
  IComparisonCytoDifference,
  IComparisonCytoRow,
  useCytogeneticsComparison,
} from '@/hooks/Comparison/useCytogeneticsComparison';
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
    gridTemplateColumns: '1fr 0.95fr 0.95fr 1fr',
    gap: '10px',
    padding: '10px 14px',
    '@media (max-width: 1200px)': {
      gridTemplateColumns: '0.95fr 0.95fr 0.95fr 0.95fr',
    },
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 0.95fr 0.95fr 1fr',
    gap: '10px',
    padding: '10px 14px',
    borderBottom: `1px solid ${corePalette.grey30}`,
    alignItems: 'flex-start',
    '&:last-child': {
      borderBottom: 'none',
    },
    '@media (max-width: 1200px)': {
      gridTemplateColumns: '0.95fr 0.95fr 0.95fr 0.95fr',
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

type CytogeneticsRowFilter = 'All' | 'Shared' | 'Unique' | 'Changed';

interface IProps {
  primaryAnalysisSetId: string;
  comparisonAnalysisSetId: string;
}

function getStatusClassName(
  status: CytogeneticsRowFilter | IComparisonCytoRow['status'],
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
  row: IComparisonCytoRow['primary'];
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
        {row.eventType}
        {' | CN '}
        {row.copyNumber}
      </CustomTypography>
      <CustomTypography variant="bodySmall" color={corePalette.grey200}>
        Interpretation
        {' '}
        {row.interpretation}
      </CustomTypography>
    </Box>
  );
}

function DifferenceSummary({
  row,
}: {
  row: IComparisonCytoRow;
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
      {row.differences.map((difference: IComparisonCytoDifference) => (
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
  label: 'Chromosome arms' | 'Cytobands';
  rows: IComparisonCytoRow[];
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
                {row.label}
              </CustomTypography>
              <CustomTypography variant="bodySmall" color={corePalette.grey200}>
                {row.category}
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

export default function CytogeneticsComparisonSection({
  primaryAnalysisSetId,
  comparisonAnalysisSetId,
}: IProps): JSX.Element {
  const classes = useStyles();
  const [filter, setFilter] = useState<CytogeneticsRowFilter>('All');
  const {
    loading,
    error,
    primaryIssue,
    comparisonIssue,
    rows,
    counts,
  } = useCytogeneticsComparison(primaryAnalysisSetId, comparisonAnalysisSetId);

  const filteredRows = useMemo(() => (
    filter === 'All' ? rows : rows.filter((row) => row.status === filter)
  ), [filter, rows]);

  const armRows = useMemo(
    () => filteredRows.filter((row) => row.category === 'Chromosome arm'),
    [filteredRows],
  );
  const cytobandRows = useMemo(
    () => filteredRows.filter((row) => row.category === 'Cytoband'),
    [filteredRows],
  );

  const filterOptions: Array<{
    label: CytogeneticsRowFilter;
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
          Loading Cytogenetics comparison
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          Arm-level and reportable cytoband findings are being prepared for both selected samples.
        </CustomTypography>
      </Box>
    );
  } else if (error) {
    content = (
      <Box className={classes.infoCard}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          Unable to load Cytogenetics comparison
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
          No reportable Cytogenetics rows found
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          There are no reportable Cytogenetics findings to compare for the currently
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
          Try another status filter to see the Cytogenetics rows in this comparison.
        </CustomTypography>
      </Box>
    );
  } else {
    content = (
      <>
        {!!armRows.length && (
          <SubgroupTable label="Chromosome arms" rows={armRows} />
        )}
        {!!cytobandRows.length && (
          <SubgroupTable label="Cytobands" rows={cytobandRows} />
        )}
      </>
    );
  }

  return (
    <Box
      className={classes.root}
      id="comparison-section-cytogenetics"
    >
      <Box className={classes.header}>
        <Box>
          <CustomTypography variant="h6" fontWeight="medium">
            Cytogenetics
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
            Arm-level and reportable cytoband findings are aligned by region so
            event type, copy-number value, and interpretation stay easy to compare.
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
