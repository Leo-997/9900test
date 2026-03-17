import { Box, Chip, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';
import {
  comparisonSectionOptions,
  IComparisonWorkspaceState,
} from '@/types/Comparison.types';
import { corePalette } from '@/themes/colours';
import ComparisonSectionPlaceholder from './ComparisonSectionPlaceholder';
import ComparisonSectionRail from './ComparisonSectionRail';
import ComparisonWorkspaceEmptyState from './ComparisonWorkspaceEmptyState';
import ComparisonWorkspaceHeader from './ComparisonWorkspaceHeader';
import CnvComparisonSection from './sections/CnvComparisonSection';
import CytogeneticsComparisonSection from './sections/CytogeneticsComparisonSection';
import GermlineComparisonSection from './sections/GermlineComparisonSection';
import MethylationComparisonSection from './sections/MethylationComparisonSection';
import RnaComparisonSection from './sections/RnaComparisonSection';
import SnvComparisonSection from './sections/SnvComparisonSection';
import SummaryComparisonSection from './sections/SummaryComparisonSection';
import SvComparisonSection from './sections/SvComparisonSection';

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '100%',
    padding: '24px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  headerCard: {
    backgroundColor: corePalette.white,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoChip: {
    backgroundColor: corePalette.blue30,
    color: corePalette.blue300,
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
  sectionStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptySectionsCard: {
    backgroundColor: corePalette.white,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '16px',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
}));

interface IProps {
  workspaceState: IComparisonWorkspaceState;
}

export default function ComparisonPreview({
  workspaceState,
}: IProps): JSX.Element {
  const classes = useStyles();
  const selectedSections = comparisonSectionOptions.filter((section) => (
    workspaceState.selectedSections.includes(section.key)
  ));

  if (!workspaceState.primarySample || !workspaceState.comparisonSample) {
    return (
      <ComparisonWorkspaceEmptyState
        primarySample={workspaceState.primarySample}
        comparisonSample={workspaceState.comparisonSample}
      />
    );
  }

  return (
    <Box className={classes.root}>
      <ComparisonWorkspaceHeader
        primarySample={workspaceState.primarySample}
        comparisonSample={workspaceState.comparisonSample}
        selectedSections={workspaceState.selectedSections}
      />

      {!!selectedSections.length && (
        <ComparisonSectionRail selectedSections={selectedSections} />
      )}

      {!selectedSections.length ? (
        <Box className={classes.emptySectionsCard}>
          <Chip
            className={classes.infoChip}
            label="No sections selected"
            size="small"
          />
          <CustomTypography variant="h5" fontWeight="medium">
            Select sections to build the comparison view
          </CustomTypography>
          <CustomTypography variant="bodyRegular" color={corePalette.grey200}>
            The workspace header is ready. Use the left panel to choose which
            sections should appear in the comparison results area.
          </CustomTypography>
        </Box>
      ) : (
        <Box className={classes.sectionStack}>
          {selectedSections.map((section) => {
            if (section.key === 'snv') {
              return (
                <SnvComparisonSection
                  key={section.key}
                  primaryAnalysisSetId={workspaceState.primarySample.analysisSetId}
                  comparisonAnalysisSetId={workspaceState.comparisonSample.analysisSetId}
                />
              );
            }

            if (section.key === 'summary') {
              return (
                <SummaryComparisonSection
                  key={section.key}
                  primaryAnalysisSetId={workspaceState.primarySample.analysisSetId}
                  comparisonAnalysisSetId={workspaceState.comparisonSample.analysisSetId}
                />
              );
            }

            if (section.key === 'cnv') {
              return (
                <CnvComparisonSection
                  key={section.key}
                  primaryAnalysisSetId={workspaceState.primarySample.analysisSetId}
                  comparisonAnalysisSetId={workspaceState.comparisonSample.analysisSetId}
                />
              );
            }

            if (section.key === 'cytogenetics') {
              return (
                <CytogeneticsComparisonSection
                  key={section.key}
                  primaryAnalysisSetId={workspaceState.primarySample.analysisSetId}
                  comparisonAnalysisSetId={workspaceState.comparisonSample.analysisSetId}
                />
              );
            }

            if (section.key === 'germline') {
              return (
                <GermlineComparisonSection
                  key={section.key}
                  primaryAnalysisSetId={workspaceState.primarySample.analysisSetId}
                  comparisonAnalysisSetId={workspaceState.comparisonSample.analysisSetId}
                />
              );
            }

            if (section.key === 'methylation') {
              return (
                <MethylationComparisonSection
                  key={section.key}
                  primaryAnalysisSetId={workspaceState.primarySample.analysisSetId}
                  comparisonAnalysisSetId={workspaceState.comparisonSample.analysisSetId}
                />
              );
            }

            if (section.key === 'rna') {
              return (
                <RnaComparisonSection
                  key={section.key}
                  primaryAnalysisSetId={workspaceState.primarySample.analysisSetId}
                  comparisonAnalysisSetId={workspaceState.comparisonSample.analysisSetId}
                />
              );
            }

            if (section.key === 'sv') {
              return (
                <SvComparisonSection
                  key={section.key}
                  primaryAnalysisSetId={workspaceState.primarySample.analysisSetId}
                  comparisonAnalysisSetId={workspaceState.comparisonSample.analysisSetId}
                />
              );
            }

            return (
              <ComparisonSectionPlaceholder
                key={section.key}
                sectionKey={section.key}
                sectionLabel={section.label}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}
