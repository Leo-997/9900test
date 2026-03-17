import { Box, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';
import { IComparisonWorkspaceState } from '@/types/Comparison.types';
import { corePalette } from '@/themes/colours';
import ComparisonSampleSelectorCard from './ComparisonSampleSelectorCard';
import ComparisonSelectedSampleCard from './ComparisonSelectedSampleCard';
import ComparisonSectionSelector from './ComparisonSectionSelector';

const useStyles = makeStyles(() => ({
  root: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
}));

interface IProps {
  workspaceState: IComparisonWorkspaceState;
}

export default function ComparisonSelectionPanel({
  workspaceState,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.titleBlock}>
        <CustomTypography variant="h5" fontWeight="medium">
          Comparison Setup
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
          Select the primary and comparison samples here before choosing
          sections to compare.
        </CustomTypography>
      </Box>

      <ComparisonSampleSelectorCard
        label="PRIMARY SAMPLE"
        title="Select primary sample"
        description="Search the case or sample you want to treat as the primary reference."
        searchState={workspaceState.primarySearch}
        selectedSample={workspaceState.primarySample}
        onSelectSample={workspaceState.selectPrimarySample}
      />

      {workspaceState.primarySample && (
        <ComparisonSelectedSampleCard
          label="Primary sample"
          sample={workspaceState.primarySample}
          onClear={workspaceState.clearPrimarySample}
        />
      )}

      <ComparisonSampleSelectorCard
        label="COMPARISON SAMPLE"
        title="Select comparison sample"
        description="Search the case or sample you want to compare against the primary sample."
        searchState={workspaceState.comparisonSearch}
        selectedSample={workspaceState.comparisonSample}
        onSelectSample={workspaceState.selectComparisonSample}
      />

      {workspaceState.comparisonSample && (
        <ComparisonSelectedSampleCard
          label="Comparison sample"
          sample={workspaceState.comparisonSample}
          onClear={workspaceState.clearComparisonSample}
        />
      )}

      <ComparisonSectionSelector
        selectedSections={workspaceState.selectedSections}
        toggleSection={workspaceState.toggleSection}
      />
    </Box>
  );
}
