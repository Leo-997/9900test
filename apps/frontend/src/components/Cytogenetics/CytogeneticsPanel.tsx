import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { Chromosome } from '@/types/Common.types';
import { toFixed } from '@/utils/math/toFixed';
import {
    Grid,
    IconButton,
    Paper as MuiPaper,
    styled,
} from '@mui/material';
import { Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import {
    Arm,
    IArmCNSummary,
    ICytogeneticsData,
    IGetCytobandsQuery,
    IParsedCytogeneticsData,
    ISampleCytoband,
} from '../../types/Cytogenetics.types';
import { ReportType } from '../../types/Reports/Reports.types';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { inXSamplesText } from '../../utils/misc/strings';
import { ClassificationChip, TargetableChip } from '../Chips';
import { ScoreChip } from '../Chips/ScoreChip';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import CytobandGraph from './CytobandGraph';
import { CytogeneticsFooter } from './CytogeneticsFooter';
import CytogeneticsModal from './CytogeneticsModal';
import { CytogeneticsTooltip } from './CytogeneticsTooltip';

interface IPaperProps {
  isGermline: boolean;
}

const Paper = styled(MuiPaper)<IPaperProps>(({ isGermline }) => ({
  margin: '4px 0 4px 0',
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: isGermline ? 'flex-start' : 'space-between',
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
  minWidth: '400px',
}));

const ItemBase = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  minWidth: '200px',
}));

const Item = styled(ItemBase)(() => ({
  width: '200px',
}));

const IdeogramItem = styled(ItemBase)(() => ({
  width: '50vw',
  justifyContent: 'center',
  display: 'flex',
}));

interface ICytogeneticsPanelProps {
  data: IParsedCytogeneticsData;
  type: 'somatic' | 'germline';
  biosampleId: string | undefined;
  updateCytogenetics: (data: Partial<ICytogeneticsData>, biosampleId: string) => Promise<void>;
  getCytobands: (
    biosampleId: string,
    query?: IGetCytobandsQuery,
    signal?: AbortSignal,
  ) => Promise<ISampleCytoband[]>;
  reportableCytobands?: ISampleCytoband[];
  targetableCytobands?: ISampleCytoband[];
  updateCyto?: (data: IParsedCytogeneticsData) => void;
  armCnSummary: IArmCNSummary;
  view?: string
}

export default function CytogeneticsPanel({
  data,
  type,
  biosampleId,
  updateCytogenetics,
  getCytobands,
  reportableCytobands,
  targetableCytobands,
  updateCyto,
  armCnSummary,
  view = 'list',
}: ICytogeneticsPanelProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const { demographics } = useAnalysisSet();

  const [expanded, setExpanded] = useState<boolean>(false);

  const isGermline = type === 'germline';

  const handleUpdateCyto = async (
    body: Partial<ICytogeneticsData>,
    chromosome: Chromosome,
    arm: Arm,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(
            body,
            arm === 'p' ? data.p.reportable : data.q.reportable,
          ),
        };
        await updateCytogenetics(
          {
            chr: chromosome,
            arm,
            ...newBody,
          },
          biosampleId,
        );
        if (updateCyto) {
          updateCyto({
            ...data,
            p: arm === 'p'
              ? { ...data.p, ...newBody }
              : data.p,
            q: arm === 'q'
              ? { ...data.q, ...newBody }
              : data.q,
          });
        }

        const newReports: ReportType[] = [];
        if (reports) {
          newReports.push(...getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(
              body,
              arm === 'p' ? data.p.reportable : data.q.reportable,
            ),
            defaultValue: reports,
            variantType: isGermline ? 'GERMLINE_CYTO' : undefined,
            germlineConsent: demographics,
          }));
        }
        return newReports;
      } catch {
        enqueueSnackbar(
          `Cannot update ${isGermline ? 'germline ' : ''}cytogenetics data, please try again.`,
          { variant: 'error' },
        );
      }
    }
    return [];
  };

  const getReportableCount = (): number => {
    let count = 0;
    if (data.p.reportable) {
      count += 1;
    }
    if (data.q.reportable) {
      count += 1;
    }
    if (reportableCytobands && reportableCytobands.length > 0) {
      count += reportableCytobands.length;
    }
    return count;
  };

  const getTargetableCount = (): number => {
    let count = 0;
    if (data.p.targetable) {
      count += 1;
    }
    if (data.q.targetable) {
      count += 1;
    }
    if (targetableCytobands && targetableCytobands.length > 0) {
      count += targetableCytobands.length;
    }
    return count;
  };

  return (
    <Paper
      elevation={0}
      isGermline={isGermline}
    >
      <StickySection>
        <Grid
          container
          height="100%"
          gap="8px"
          alignItems="center"
        >
          <Grid flex={2}>
            <IconButton onClick={(): void => setExpanded(!expanded)}>
              <Maximize2Icon />
            </IconButton>
          </Grid>

          <Grid flex={2} container direction="column" justifyContent="flex-start">
            <CustomTypography variant="label">CHR</CustomTypography>
            <CustomTypography variant="titleRegular" fontWeight="bold">
              {data.chr.replace('chr', '')}
            </CustomTypography>
          </Grid>

          <Grid flex={3} container direction="column" justifyContent="flex-start">
            <CustomTypography variant="label">ARM P</CustomTypography>
            <ScoreChip
              min={armCnSummary.p.min}
              max={armCnSummary.p.max}
              mid={2}
              value={data.p.avgCN}
              label={toFixed(data.p.avgCN, 2)}
            />
          </Grid>

          <Grid flex={3} container direction="column" justifyContent="flex-start">
            <CustomTypography variant="label">ARM Q</CustomTypography>
            <ScoreChip
              min={armCnSummary.q.min}
              max={armCnSummary.q.max}
              mid={2}
              value={data.q.avgCN}
              label={toFixed(data.q.avgCN, 2)}
            />
          </Grid>
        </Grid>
      </StickySection>

      {!isGermline && (
        <IdeogramItem>
          <CytobandGraph
            chr={data.chr.replace('chr', '')}
            width={30}
            view={view}
            annotations={data.annotations}
          />
        </IdeogramItem>
      )}

      <Item>
        <Grid
          container
          direction="column"
          height="100%"
          justifyContent="center"
        >
          <CustomTypography variant="label">CLASSIFICATION</CustomTypography>
          {(data.p.reportable !== null || data.q.reportable !== null
          || (reportableCytobands && reportableCytobands.length > 0))
          && (
            <ClassificationChip
              classification={`${getReportableCount()} Reportable`}
              reportable={getReportableCount() > 0}
              tooltipText={(
                <CytogeneticsTooltip
                  p={data.p}
                  q={data.q}
                  cytobands={reportableCytobands || []}
                  type="classification"
                />
                )}
            />
          )}
          <CustomTypography variant="bodySmall">
            Arm P:
            {' '}
            {inXSamplesText(data.p.reportedCount)}
          </CustomTypography>
          <CustomTypography variant="bodySmall">
            Arm Q:
            {' '}
            {inXSamplesText(data.q.reportedCount)}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%" justifyContent="center">
          <CustomTypography variant="label">TARGETABLE</CustomTypography>
          {(data.p.targetable !== null || data.q.targetable !== null
          || (targetableCytobands && targetableCytobands.length > 0))
          && (
            <TargetableChip
              targetable={getTargetableCount() > 0 ? 'Yes' : 'No'}
              label={`${getTargetableCount()} Targetable`}
              tooltipText={(
                <CytogeneticsTooltip
                  p={data.p}
                  q={data.q}
                  cytobands={targetableCytobands || []}
                  type="targetable"
                />
              )}
            />
          )}
          <CustomTypography variant="bodySmall">
            Arm P:
            {' '}
            {inXSamplesText(data.p.targetableCount)}
          </CustomTypography>
          <CustomTypography variant="bodySmall">
            Arm Q:
            {' '}
            {inXSamplesText(data.q.targetableCount)}
          </CustomTypography>
        </Grid>
      </Item>
      {expanded && biosampleId && (
        <ExpandedModal
          variantId={data.chr}
          variantType={!isGermline ? 'CYTOGENETICS' : 'GERMLINE_CYTO'}
          biosampleId={biosampleId}
          open={expanded}
          handleClose={(): void => setExpanded(!expanded)}
          title="CHROMOSOME"
          titleContent={data.chr.replace('chr', '')}
          curationDataComponent={(
            <CytogeneticsModal
              data={data}
              type={type}
              biosampleId={biosampleId}
              getCytobands={getCytobands}
              armCnSummary={armCnSummary}
              handleUpdateCyto={handleUpdateCyto}
            />
          )}
          overrideFooter={(
            <CytogeneticsFooter
              biosampleId={biosampleId}
              data={data}
              disabled={{ p: data.p.avgCN === 2.00, q: data.q.avgCN === 2.0 }}
              type={type}
              handleUpdateData={handleUpdateCyto}
            />
          )}
          overrideType="cyto"
        />
      )}
    </Paper>
  );
}
