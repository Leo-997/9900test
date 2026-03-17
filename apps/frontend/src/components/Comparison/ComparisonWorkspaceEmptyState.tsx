import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '720px',
    backgroundColor: corePalette.white,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '16px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statusChip: {
    backgroundColor: corePalette.blue30,
    color: corePalette.blue300,
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
}));

interface IProps {
  primarySample: IAnalysisSet | null;
  comparisonSample: IAnalysisSet | null;
}

const getEmptyStateCopy = (
  primarySample: IAnalysisSet | null,
  comparisonSample: IAnalysisSet | null,
): {
  chip: string;
  title: string;
  body: string;
} => {
  if (!primarySample && !comparisonSample) {
    return {
      chip: 'Selection required',
      title: 'Choose the primary and comparison samples',
      body: 'Use the left panel to search by ID and select the two samples you want to compare.',
    };
  }

  if (!primarySample || !comparisonSample) {
    return {
      chip: 'Selection in progress',
      title: 'Choose the second sample',
      body: 'One sample is selected. Add the second sample from the left panel to continue setting up the comparison workspace.',
    };
  }

  return {
    chip: 'Samples selected',
    title: 'Comparison workspace is ready for sections',
    body: 'Both samples are selected. The next step will add section controls and preview placeholders to this workspace.',
  };
};

export default function ComparisonWorkspaceEmptyState({
  primarySample,
  comparisonSample,
}: IProps): JSX.Element {
  const classes = useStyles();
  const copy = getEmptyStateCopy(primarySample, comparisonSample);

  return (
    <Box className={classes.root}>
      <Box className={classes.card}>
        <Chip
          className={classes.statusChip}
          label={copy.chip}
          size="small"
        />
        <CustomTypography variant="h5" fontWeight="medium">
          {copy.title}
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          {copy.body}
        </CustomTypography>
      </Box>
    </Box>
  );
}
