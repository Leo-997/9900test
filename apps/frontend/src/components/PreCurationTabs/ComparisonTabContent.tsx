import { Box, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect } from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import { useComparisonWorkspaceState } from '@/hooks/Comparison/useComparisonWorkspaceState';
import ComparisonWorkspaceLayout from '@/components/Comparison/ComparisonWorkspaceLayout';
import ComparisonWorkspaceSidebar from '@/components/Comparison/ComparisonWorkspaceSidebar';
import ComparisonPreview from '@/components/Comparison/ComparisonPreview';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
    // Overriding the default layout padding to let the workspace take full space
    margin: '-30px 0 0 -32px',
    padding: '24px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
}));

export default function ComparisonTabContent(): JSX.Element {
  const classes = useStyles();
  const { analysisSet } = useAnalysisSet();
  const workspaceState = useComparisonWorkspaceState();

  const { selectPrimarySample, primarySample } = workspaceState;

  useEffect(() => {
    if (analysisSet.analysisSetId && (!primarySample || primarySample.analysisSetId !== analysisSet.analysisSetId)) {
      selectPrimarySample(analysisSet);
    }
  }, [analysisSet, primarySample, selectPrimarySample]);

  return (
    <Box className={classes.root}>
      <ComparisonWorkspaceLayout
        leftPanel={<ComparisonWorkspaceSidebar workspaceState={workspaceState} />}
        workspace={<ComparisonPreview workspaceState={workspaceState} />}
      />
    </Box>
  );
}
