import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import { IRNASeqHMPlots } from '@/types/Plot.types';
import getUpdatedReportableValue from '@/utils/functions/reportable/getUpdatedReportableValue';
import { toFixedNoRounding } from '@/utils/math/toFixedNoRounding';
import { getClassifierClassificationDisplayValue } from '@/utils/misc';
import {
    Box,
    Grid,
    IconButton,
    Paper as MuiPaper,
    styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IRNAClassifierTable, IUpdateRNAClassifier } from '../../types/RNAseq.types';
import ClassificationChip from '../Chips/ClassificationChip';
import TargetableChip from '../Chips/TargetableChip';
import CustomChip from '../Common/Chip';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import PlotCard from '../QCPlots/PlotCard';
import { RNAClassifierCurationFooter } from './RNAClassifierCurationFooter';
import RNAClassifierModal from './RNAClassifierModal';

interface IStyleProps {
  joined?: boolean;
}

const Paper = styled(MuiPaper)<IStyleProps>(() => ({
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
}));

const StickySection = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  left: '0px',
  paddingLeft: '8px',
  zIndex: 1,
  backgroundColor: theme.colours.core.white,
  flexShrink: 0,
  paddingRight: '8px',
  width: '20%',
  minWidth: '250px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '16px',
  width: '200px',
  minWidth: '200px',
  gap: '8px',
  display: 'flex',
  flexDirection: 'column',
}));

const useStyles = makeStyles(() => ({
  classifierName: {
    maxWidth: '300px',
    width: '300px',
    marginLeft: '30px',
  },
  prediction: {
    width: '100%',
  },
  container: {
    width: '100%',
    gap: 'calc(90% - 800px)',
    margin: 0,
    padding: 0,
  },
  containerRight: {
    gap: '20px',
  },
  expandedPlot: {
    display: 'block',
    borderRadius: '4px',
    border: '1px solid #D0D9E2',
    background: '#F3F5F7',
  },
  scrollableSection: {
    height: '100%',
    minWidth: 'calc(100% - 400px)',
  },
  title: {
    marginBottom: '8px',
  },
  chip: {
    minWidth: '150px',
    width: '200px',
  },
  dynamicWrapper: {
    height: '100%',
    width: '100%',
  },
}));

interface IRNAClassifierCardProps {
  data: IRNAClassifierTable[];
  onRefreshRequired?: () => void;
  joined?: boolean;
}

export default function RNAClassifierCard({
  data,
  onRefreshRequired,
  joined,
}: IRNAClassifierCardProps): JSX.Element {
  const classes = useStyles({ joined });
  const zeroDashSdk = useZeroDashSdk();
  const { rnaBiosample } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();

  const getSelected = (dataTable: IRNAClassifierTable[]): IRNAClassifierTable[] => {
    if (!dataTable || dataTable.length === 0) return [];
    const sortedData = [...dataTable].sort((a, b) => b.score - a.score);
    const selectedRows = sortedData.filter((item) => item.selectedPrediction);
    if (selectedRows.length === 0) return sortedData.slice(0, 1);
    return selectedRows;
  };

  const selectedPredictions = useMemo(() => getSelected(data), [data]);

  const [expanded, setExpanded] = useState<boolean>(false);

  const [links, setLinks] = useState<IRNASeqHMPlots>({
    allsorts: '',
  });

  useEffect(() => {
    async function getPlots(): Promise<void> {
      if (rnaBiosample?.biosampleId) {
        const resp = await zeroDashSdk.plots.getRNASeqClassifierPlots(
          rnaBiosample.biosampleId,
        );
        setLinks(resp);
      }
    }
    getPlots();
  }, [rnaBiosample?.biosampleId, zeroDashSdk.plots]);

  const handleUpdateResult = async (
    body: IUpdateRNAClassifier,
  ): Promise<void> => {
    if (!selectedPredictions || !rnaBiosample?.biosampleId) return;
    try {
      const newBody = {
        ...body,
        reportable: getUpdatedReportableValue(body, selectedPredictions[0].reportable),
      };
      await Promise.all(selectedPredictions.map(
        (prediction) => zeroDashSdk.rna.updateRNAClassifierByClassifier(
          newBody,
          rnaBiosample.biosampleId,
          prediction.classifier,
          prediction.version,
          prediction.prediction,
        ),
      ));

      if (onRefreshRequired) {
        onRefreshRequired();
      }
    } catch {
      enqueueSnackbar('Cannot update classifier data, please try again.', { variant: 'error' });
    }
  };

  const handleCloseModal = (): void => {
    onRefreshRequired?.();
    setExpanded(!expanded);
  };

  const handleSelectPrediction = async (
    classifier: IRNAClassifierTable,
  ): Promise<void> => {
    if (!rnaBiosample?.biosampleId) return;
    try {
      const body = classifier.selectedPrediction ? {
        classification: selectedPredictions[0].classification,
        reportable: selectedPredictions[0].reportable,
        targetable: selectedPredictions[0].targetable,
        researchCandidate: selectedPredictions[0].researchCandidate,
      } : {
        classification: null,
        reportable: null,
        targetable: null,
        researchCandidate: null,
      };
      await zeroDashSdk.rna.updateRNAClassifierByClassifier(
        body,
        rnaBiosample.biosampleId,
        classifier.classifier,
        classifier.version,
        classifier.prediction,
      );
      const payload: Partial<IRNAClassifierTable> = {
        classifier: classifier.classifier,
        version: classifier.version,
        prediction: classifier.prediction,
        selectedPrediction: classifier.selectedPrediction,
      };
      await zeroDashSdk.rna.updateSelectedPrediction(
        payload,
        rnaBiosample.biosampleId,
      );
      if (onRefreshRequired) {
        onRefreshRequired();
      }
    } catch (err) {
      enqueueSnackbar('Could not update selected prediction', { variant: 'error' });
    }
  };

  const replaceUnderscoresWithSpaces = (text?: string): string => {
    if (!text) return '';
    return text.replace(/_/g, ' ');
  };

  const getFormattedClassifier = (classifier?: string): string => {
    if (!classifier) return '';
    if (classifier.includes('_')) {
      const replaced = replaceUnderscoresWithSpaces(classifier);
      return replaced
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return classifier;
  };

  if (!selectedPredictions) {
    return <Box component="span" />;
  }

  const assignColour = (score: number): string => {
    if (score < 0.5) {
      return corePalette.red150;
    }
    if (score >= 0.5 && score < 0.8) {
      return corePalette.orange50;
    }
    if (score >= 0.8) {
      return corePalette.green50;
    }
    return corePalette.grey50;
  };

  return (
    <Paper elevation={0}>
      <StickySection>
        <Grid container height="100%" gap="8px" alignItems="center">
          <Grid flex={2}>
            <IconButton disableRipple onClick={(): void => setExpanded(!expanded)}>
              <Maximize2Icon />
            </IconButton>
          </Grid>
          <Grid flex={9} direction="column" height="100%" container padding="16px">
            <CustomTypography variant="label">{getFormattedClassifier(selectedPredictions[0]?.classifier)}</CustomTypography>
            <CustomTypography truncate variant="titleRegular" fontWeight="bold" style={{ width: '100%' }}>
              {replaceUnderscoresWithSpaces(
                selectedPredictions[0]?.predictionLabel || selectedPredictions[0]?.prediction,
              )}
            </CustomTypography>
          </Grid>
        </Grid>
      </StickySection>
      <Item>
        <CustomTypography variant="label" className={classes.title}>Prediction score</CustomTypography>
        <CustomChip
          size="medium"
          backgroundColour={assignColour(selectedPredictions[0]?.score)}
          sx={{ width: '150px' }}
          label={(
            <CustomTypography fontWeight="bold">
              {selectedPredictions[0]?.score ? toFixedNoRounding(selectedPredictions[0]?.score, 2) : '-'}
            </CustomTypography>
          )}
        />
      </Item>
      <Item>
        <CustomTypography variant="label">
          Classification
        </CustomTypography>
        {selectedPredictions[0]?.classification && (
          <ClassificationChip
            classification={
              getClassifierClassificationDisplayValue(selectedPredictions[0]?.classification) || ''
            }
            reportable={selectedPredictions[0]?.reportable}
          />
        )}
      </Item>
      <Item>
        <CustomTypography variant="label">
          Targetable
        </CustomTypography>
        {selectedPredictions[0]?.targetable !== null
          && selectedPredictions[0]?.targetable !== undefined && (
          <TargetableChip
            targetable={selectedPredictions[0]?.targetable ? 'Yes' : 'No'}
          />
        )}
      </Item>

      {expanded && rnaBiosample && (
        <ExpandedModal
          biosampleId={rnaBiosample.biosampleId}
          variantId={selectedPredictions[0]?.classifier}
          open={expanded}
          handleClose={handleCloseModal}
          hideIncludeInReport
          title={(
            <Box>
              <CustomTypography variant="titleRegular" fontWeight="medium" style={{ textTransform: 'none' }}>
                {getFormattedClassifier(selectedPredictions[0]?.classifier)}
              </CustomTypography>
            </Box>
          )}
          curationDataComponent={(
            <RNAClassifierModal
              data={data}
              selectedPredictions={selectedPredictions}
              handleSelectPrediction={handleSelectPrediction}
              handleUpdateResult={handleUpdateResult}
            />
          )}
          overrideFooter={(
            <RNAClassifierCurationFooter
              biosampleId={rnaBiosample.biosampleId}
              result={selectedPredictions[0]}
              handleUpdateResult={handleUpdateResult}
            />
          )}
          variantType="RNA_SEQ"
          overrideRightPanel={
            selectedPredictions[0]?.classifier === 'ALLSorts' && links.allsorts && (
              <Box display="flex" justifyContent="center" width="100%">
                <PlotCard
                  legendTitle="ALLSorts Distribution Plot"
                  legendData={[
                    {
                      title: 'ALLSorts Distribution Plot',
                      summary: '',
                      content: 'ALLSorts Distribution Plot',
                    },
                  ]}
                  title="ALLsorts Distribution Plot"
                  url={links.allsorts || ''}
                />
              </Box>
            )
          }
        />
      )}
    </Paper>
  );
}
