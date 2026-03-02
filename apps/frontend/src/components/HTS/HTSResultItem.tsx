import {
  Box,
  Grid,
  IconButton,
  Paper as MuiPaper,
  styled,
} from '@mui/material';
import { Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import {
  HTSResultSummary,
  IDetailedHTSResult,
  IHTSDrugHitsPlots,
  IHTSReportable,
} from '../../types/HTS.types';
import { toFixed } from '../../utils/math/toFixed';
import { ClassificationChip, TargetableChip } from '../Chips';
import { ScoreChip } from '../Chips/ScoreChip';
import ImageThumbnail from '../Common/ImageThumbnail';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import { HtsFooter } from './HtsFooter';
import HTSModalContent from './HTSModalContent';
import CustomChip from '../Common/Chip';
import { chipColours } from '@/themes/colours';

const Paper = styled(MuiPaper)(() => ({
  margin: '4px 0 4px 0',
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
  width: 'fit-content',
}));

const StickySection = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  left: '0px',
  paddingLeft: '8px',
  zIndex: 1,
  backgroundColor: theme.colours.core.white,
  flexShrink: 0,
  paddingRight: '8px',
  width: '30%',
  minWidth: '500px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  flexDirection: 'column',
  height: '100%',
  width: '200px',
  minWidth: '200px',
}));

interface IHTSResultItemProps {
  data: IDetailedHTSResult;
  zScoreSummary: HTSResultSummary;
  cohortCount?: number;
  updateHTS?: (data: IDetailedHTSResult) => void;
}

export default function HTSResultItem({
  data,
  zScoreSummary,
  cohortCount,
  updateHTS,
}: IHTSResultItemProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const zeroDashSdk = useZeroDashSdk();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [plots, setPlots] = useState<IHTSDrugHitsPlots>();

  const {
    aucPatient,
    aucMedian,
    ic50Patient,
    ic50Log2Median,
    aucZScore,
    ic50Log2ZScore,
    screened,
  } = data;

  const { aucZScore: aucZScoreSummary, ic50ZScore: ic50ZScoreSummary } = zScoreSummary;

  const handleCloseModal = (): void => {
    setExpanded(false);
  };

  const updateResult = async (body: Partial<IHTSReportable>): Promise<void> => {
    try {
      await zeroDashSdk.hts.updateHtsResultById(
        body,
        data.biosampleId,
        data.screenId,
      );
      if (updateHTS) {
        updateHTS({
          ...data,
          ...body,
        });
      }
    } catch {
      enqueueSnackbar('Could not update result, please try again.', { variant: 'error' });
    }
  };

  useEffect(() => {
    zeroDashSdk.plots.getHTSHitsPlots(
      data.biosampleId,
      data.screenId,
      { plot: 'AUC' },
    )
      .then((resp) => setPlots(resp));
  }, [data.screenId, data.biosampleId, zeroDashSdk.plots]);

  return (
    <Paper elevation={0}>
      <StickySection>
        <Grid container height="100%" gap="8px" alignItems="center">
          <Grid flex={1}>
            <IconButton
              onClick={(): void => setExpanded(!expanded)}
            >
              <Maximize2Icon />
            </IconButton>
          </Grid>
          <Grid direction="column" padding="8px" container flex={3} height="100%" minHeight="150px">
            <CustomTypography variant="label">
              AUC
            </CustomTypography>
            <Box height="calc(100% - 24px)">
              <ImageThumbnail
                imageUrl={plots?.AUC || ''}
                headerTitle="AUC Plot"
              />
            </Box>
          </Grid>
          <Grid direction="column" padding="8px" container flex={7} height="100%">
            <CustomTypography variant="label">
              Drug Name
            </CustomTypography>
            <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
              {data.drugName}
            </CustomTypography>
            <Box display="flex" gap="4px" width="100%">
              <CustomTypography>
                Compound ID:
              </CustomTypography>
              <CustomTypography truncate style={{ width: '60%' }}>
                {data.compoundId}
              </CustomTypography>
            </Box>
            <Box display="flex" gap="4px" width="100%">
              <CustomTypography>
                Pathway:
              </CustomTypography>
              <CustomTypography truncate style={{ width: '70%' }}>
                {data.classes?.map((c) => c.name).join(', ')}
              </CustomTypography>
            </Box>
          </Grid>
        </Grid>
      </StickySection>
      <Item container>
        <CustomTypography variant="label">
          Target
        </CustomTypography>
        <CustomTypography truncate>
          {data.targets?.map((t) => t.name).join(', ')}
        </CustomTypography>
      </Item>
      <Item container position="relative">
        <CustomTypography variant="label">
          AUC z-score
        </CustomTypography>
        <ScoreChip
          inverted
          min={aucZScoreSummary.min}
          max={aucZScoreSummary.max}
          mid={aucZScoreSummary.mid}
          value={
            aucZScore
              ? Number(toFixed(aucZScore, 2))
              : undefined
          }
        />
        <Box display="flex" gap="4px">
          <CustomTypography>
            Patient:
          </CustomTypography>
          <CustomTypography truncate>
            {aucPatient ? toFixed(aucPatient, 2) : ''}
          </CustomTypography>
        </Box>
        <Box display="flex" gap="4px">
          <CustomTypography>
            Median:
          </CustomTypography>
          <CustomTypography truncate>
            {aucMedian ? toFixed(aucMedian, 2) : ''}
          </CustomTypography>
        </Box>
        {!screened && (
          <CustomChip
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              transform: 'translateY(100%)',
            }}
            size="medium"
            label="NOT SCREENED"
            backgroundColour={chipColours.chipRedBg}
            colour={chipColours.chipRedText}
          />
        )}
      </Item>
      <Item container>
        <CustomTypography variant="label">
          IC50 z-score
        </CustomTypography>
        <ScoreChip
          inverted
          min={ic50ZScoreSummary.min}
          max={ic50ZScoreSummary.max}
          mid={ic50ZScoreSummary.mid}
          value={
            ic50Log2ZScore
              ? Number(toFixed(ic50Log2ZScore, 2))
              : undefined
          }
        />
        <Box display="flex" gap="4px">
          <CustomTypography>
            Patient:
          </CustomTypography>
          <CustomTypography truncate>
            {ic50Patient ? toFixed(ic50Patient, 2) : ''}
          </CustomTypography>
        </Box>
        <Box display="flex" gap="4px">
          <CustomTypography>
            Median:
          </CustomTypography>
          <CustomTypography truncate>
            {ic50Log2Median ? toFixed(ic50Log2Median, 2) : ''}
          </CustomTypography>
        </Box>
      </Item>
      <Item container>
        <CustomTypography variant="label">
          Reportable
        </CustomTypography>
        { data.reportable !== null && data.reportable !== undefined && (
          <TargetableChip
            targetable={data.reportable ? 'Yes' : 'No'}
          />
        )}
      </Item>
      <Item container>
        <CustomTypography variant="label">
          Reporting Rationale
        </CustomTypography>
        { data.reportingRationale !== null && data.reportingRationale !== undefined && (
          <ClassificationChip
            classification={data.reportingRationale}
            reportable={data.reportable}
          />
        )}
      </Item>
      {expanded && (
        <ExpandedModal
          variantType="HTS"
          variantId={`${data.biosampleId}_${data.drugId}`}
          biosampleId={data.biosampleId}
          open={expanded}
          handleClose={handleCloseModal}
          title="DRUG NAME"
          titleContent={(
            <Box position="relative" display="flex" alignItems="center" gap="8px">
              <CustomTypography truncate variant="titleRegular" fontWeight="medium">
                {data.drugName}
              </CustomTypography>
              {!screened && (
                <CustomChip
                  size="medium"
                  label="NOT SCREENED"
                  backgroundColour={chipColours.chipRedBg}
                  colour={chipColours.chipRedText}
                />
              )}
            </Box>
          )}
          curationDataComponent={(
            <HTSModalContent
              data={data}
              zScoreSummary={zScoreSummary}
              cohortCount={cohortCount}
              updateHTS={updateHTS}
            />
          )}
          overrideFooter={(
            <HtsFooter
              biosampleId={data.biosampleId}
              variantId={data.screenId}
              variantType="HTS"
              data={data}
              updateReportable={updateResult}
            />
          )}
          overrideType="hts"
        />
      )}
    </Paper>
  );
}
