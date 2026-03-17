import {
  Box,
  ButtonBase,
  Chip,
  type JSX,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Search from '@/components/Search/Search';
import CustomTypography from '@/components/Common/Typography';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IComparisonSampleSearchState } from '@/types/Comparison.types';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: corePalette.white,
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    marginBottom: '4px',
  },
  helperText: {
    marginTop: '-4px',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  resultButton: {
    width: '100%',
    textAlign: 'left',
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '10px',
    padding: '12px',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: corePalette.offWhite100,
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '6px',
  },
  resultMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  resultChip: {
    backgroundColor: corePalette.grey30,
    color: corePalette.grey200,
    fontWeight: 500,
  },
  stateText: {
    padding: '4px 0',
  },
}));

interface IProps {
  label: string;
  title: string;
  description: string;
  searchState: IComparisonSampleSearchState;
  onSelectSample: (sample: IAnalysisSet) => void;
  selectedSample: IAnalysisSet | null;
}

const getDiagnosisLabel = (sample: IAnalysisSet): string => (
  sample.zero2FinalDiagnosis
  || sample.histologicDiagnosis
  || sample.diagnosisEvent
  || '-'
);

export default function ComparisonSampleSelectorCard({
  label,
  title,
  description,
  searchState,
  onSelectSample,
  selectedSample,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box display="flex" flexDirection="column" gap="4px">
        <CustomTypography
          variant="label"
          color={corePalette.grey100}
          className={classes.label}
          component="div"
        >
          {label}
        </CustomTypography>
        <CustomTypography variant="titleSmall" fontWeight="medium" component="div">
          {title}
        </CustomTypography>
        <CustomTypography variant="bodyRegular" color={corePalette.grey200} component="div">
          {description}
        </CustomTypography>
      </Box>

      <Search
        searchMethod={searchState.setQuery}
        searchOnChange
        supportedFields="Sample ID, Patient ID, Labmatrix Subject ID, Public Patient ID and Manifest Name."
        value={searchState.query}
        setValue={searchState.setQuery}
        placeholder={selectedSample ? 'Search to replace selection' : 'Search by ID'}
        loading={searchState.loading}
      />

      <CustomTypography
        variant="bodyRegular"
        color={corePalette.grey100}
        className={classes.helperText}
      >
        Search by sample, patient, subject, or manifest identifiers.
      </CustomTypography>

      {searchState.loading && (
        <CustomTypography
          variant="bodyRegular"
          color={corePalette.grey200}
          className={classes.stateText}
        >
          Searching samples...
        </CustomTypography>
      )}

      {!searchState.loading && searchState.error && (
        <CustomTypography
          variant="bodyRegular"
          color={corePalette.red100}
          className={classes.stateText}
        >
          {searchState.error}
        </CustomTypography>
      )}

      {!searchState.loading && !searchState.error && searchState.results.length > 0 && (
        <Box className={classes.results}>
          {searchState.results.map((sample) => (
            <ButtonBase
              className={classes.resultButton}
              key={sample.analysisSetId}
              onClick={() => onSelectSample(sample)}
            >
              <Box width="100%">
                <Box className={classes.resultHeader}>
                  <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
                    {sample.analysisSetId}
                  </CustomTypography>
                  <Chip
                    className={classes.resultChip}
                    label={`Event ${sample.c1EventNum}`}
                    size="small"
                  />
                </Box>
                <CustomTypography variant="bodyRegular" color={corePalette.grey200} truncate>
                  {sample.patientId}
                  {' · Subject '}
                  {sample.publicSubjectId}
                </CustomTypography>
                <CustomTypography variant="bodyRegular" color={corePalette.grey200} truncate>
                  {getDiagnosisLabel(sample)}
                </CustomTypography>
                <Box className={classes.resultMeta}>
                  {sample.study && (
                    <Chip
                      className={classes.resultChip}
                      label={`Study ${sample.study}`}
                      size="small"
                    />
                  )}
                  {sample.analysisEvent && (
                    <Chip
                      className={classes.resultChip}
                      label={sample.analysisEvent}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </ButtonBase>
          ))}
        </Box>
      )}

      {!searchState.loading
        && !searchState.error
        && searchState.searched
        && !searchState.results.length && (
        <CustomTypography
          variant="bodyRegular"
          color={corePalette.grey200}
          className={classes.stateText}
        >
          No samples matched this search.
        </CustomTypography>
      )}
    </Box>
  );
}
