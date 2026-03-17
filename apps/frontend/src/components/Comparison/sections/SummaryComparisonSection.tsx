import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useMemo } from 'react';
import CustomTypography from '@/components/Common/Typography';
import {
  IComparisonSummaryRow,
  useSummaryComparison,
} from '@/hooks/Comparison/useSummaryComparison';
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
  changedChip: {
    backgroundColor: corePalette.yellow30,
    color: corePalette.yellow300,
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
  groupBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  groupCountChip: {
    backgroundColor: corePalette.offWhite100,
    color: corePalette.grey200,
    fontWeight: 500,
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
    gridTemplateColumns: '1.05fr 0.95fr 0.95fr 120px',
    gap: '10px',
    padding: '10px 14px',
    '@media (max-width: 1200px)': {
      gridTemplateColumns: '1fr 0.95fr 0.95fr 110px',
    },
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr 0.95fr 120px',
    gap: '10px',
    padding: '10px 14px',
    borderBottom: `1px solid ${corePalette.grey30}`,
    alignItems: 'center',
    '&:last-child': {
      borderBottom: 'none',
    },
    '@media (max-width: 1200px)': {
      gridTemplateColumns: '1fr 0.95fr 0.95fr 110px',
    },
  },
  changedRow: {
    backgroundColor: corePalette.yellow10,
  },
  labelBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  valueText: {
    minWidth: 0,
  },
  availabilityChip: {
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
  availabilityChipOn: {
    backgroundColor: corePalette.green10,
    color: corePalette.green300,
  },
  availabilityChipOff: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
  },
}));

interface IProps {
  primaryAnalysisSetId: string;
  comparisonAnalysisSetId: string;
}

function ValueCell({
  row,
  value,
}: {
  row: IComparisonSummaryRow;
  value: string;
}): JSX.Element {
  const classes = useStyles();

  if (row.valueType === 'availability') {
    const isAvailable = value === 'Available';
    return (
      <Chip
        size="small"
        label={value}
        className={`${classes.availabilityChip} ${isAvailable ? classes.availabilityChipOn : classes.availabilityChipOff}`}
      />
    );
  }

  return (
    <CustomTypography
      variant="bodySmall"
      color={corePalette.grey200}
      className={classes.valueText}
      truncate
    >
      {value}
    </CustomTypography>
  );
}

function SummaryGroupTable({
  label,
  rows,
}: {
  label: string;
  rows: IComparisonSummaryRow[];
}): JSX.Element {
  const classes = useStyles();
  const changedCount = rows.filter((row) => row.status === 'Changed').length;

  return (
    <Box className={classes.groupBlock}>
      <Box className={classes.groupHeader}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          {label}
        </CustomTypography>
        <Chip
          className={classes.groupCountChip}
          label={changedCount ? `${changedCount} changed` : `${rows.length} aligned`}
          size="small"
        />
      </Box>

      <Box className={classes.tableShell}>
        <Box className={classes.tableHeader}>
          <CustomTypography variant="label" color={corePalette.grey100}>
            FIELD
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

        {rows.map((row) => (
          <Box
            className={`${classes.tableRow} ${row.status === 'Changed' ? classes.changedRow : ''}`}
            key={row.id}
          >
            <Box className={classes.labelBlock}>
              <CustomTypography variant="bodyRegular" fontWeight="medium" truncate>
                {row.label}
              </CustomTypography>
            </Box>

            <ValueCell row={row} value={row.primary} />
            <ValueCell row={row} value={row.comparison} />

            <Chip
              className={row.status === 'Changed' ? classes.changedChip : classes.sharedChip}
              label={row.status}
              size="small"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function SummaryComparisonSection({
  primaryAnalysisSetId,
  comparisonAnalysisSetId,
}: IProps): JSX.Element {
  const classes = useStyles();
  const {
    loading,
    error,
    rows,
    counts,
  } = useSummaryComparison(primaryAnalysisSetId, comparisonAnalysisSetId);

  const groupedRows = useMemo(() => ({
    identifiers: rows.filter((row) => row.group === 'Identifiers'),
    clinical: rows.filter((row) => row.group === 'Clinical Context'),
    assays: rows.filter((row) => row.group === 'Assays & QC'),
  }), [rows]);

  let content: JSX.Element;

  if (loading) {
    content = (
      <Box className={classes.infoCard}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          Loading sample summary comparison
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          Key identifiers, clinical context, assay availability, and core summary
          values are being prepared for both selected samples.
        </CustomTypography>
      </Box>
    );
  } else if (error) {
    content = (
      <Box className={classes.infoCard}>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          Unable to load sample summary comparison
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
          No summary fields available
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          There are no summary fields available to compare for the currently
          selected samples.
        </CustomTypography>
      </Box>
    );
  } else {
    content = (
      <>
        <SummaryGroupTable label="Identifiers" rows={groupedRows.identifiers} />
        <SummaryGroupTable label="Clinical Context" rows={groupedRows.clinical} />
        <SummaryGroupTable label="Assays & QC" rows={groupedRows.assays} />
      </>
    );
  }

  return (
    <Box
      className={classes.root}
      id="comparison-section-summary"
    >
      <Box className={classes.header}>
        <Box>
          <CustomTypography variant="h6" fontWeight="medium">
            Sample Summary
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
            Core identifiers, clinical context, assay availability, purity,
            ploidy, and basic case status indicators are aligned side by side.
          </CustomTypography>
        </Box>
        <Chip className={classes.readOnlyChip} label="Read only" size="small" />
      </Box>

      {!!rows.length && (
        <Box className={classes.controlsRow}>
          <Chip className={classes.changedChip} label={`Changed ${counts.changed}`} size="small" />
          <Chip className={classes.sharedChip} label={`Shared ${counts.shared}`} size="small" />
        </Box>
      )}

      {content}
    </Box>
  );
}
