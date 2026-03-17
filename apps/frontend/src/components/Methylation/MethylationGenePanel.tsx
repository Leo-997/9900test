import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import {
    Box,
    CardContent,
    Grid,
    IconButton,
    Paper as MuiPaper,
    styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { CSSProperties, Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IMethGeneTable, IMethylationGeneData, MethylationStatus } from '../../types/Methylation.types';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import { toFixed } from '../../utils/math/toFixed';
import { getClassificationDisplayValue } from '../../utils/misc';
import { inXSamplesText } from '../../utils/misc/strings';
import ClassificationChip from '../Chips/ClassificationChip';
import StatusChip from '../Chips/StatusChip';
import TargetableChip from '../Chips/TargetableChip';
import CustomChip from '../Common/Chip';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import MethylationGeneModal from './MethylationGeneModal';
import MethylationInteractivePlot from './MethylationInteractivePlot';

interface IStyleProps {
  joined?: boolean;
}

const Paper = styled(MuiPaper)<IStyleProps>(({ joined }) => ({
  margin: joined ? 0 : '4px 0 4px 0',
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
  padding: '8px',
  width: '15%',
  minWidth: '350px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '200px',
  minWidth: '200px',
}));

const PlotItem = styled(Item)(() => ({
  width: '420px',
  minWidth: '420px',
}));

const Plot = styled(CardContent)(({ theme }) => ({
  flex: 1.4,
  position: 'relative',
  maxHeight: '100px',
  maxWidth: '400px',
  minHeight: '120px',
  minWidth: '400px',
  overflow: 'hidden',
  backgroundSize: 'cover',
  objectFit: 'cover',
  border: `1px solid ${theme.colours.core.grey50}`,
  padding: '0px !important',
}));

const useStyles = makeStyles(() => ({
  geneInfo: {
    minWidth: '350px',
  },
  geneData: {
    gap: '50px',
    width: 'calc(100% - 100px)',
  },
  gene: {
    marginLeft: '30px',
    width: '100%',
  },
  row: {
    width: '100%',
    margin: 0,
    padding: 0,
  },
  stats: {
    gap: '8px',
    minWidth: '210px',
  },
  curatorItem: {
    minWidth: '160px',
  },
  plotBox: {
    minWidth: '420px',
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
  chipScore: {
    width: '150px',
    height: '28px',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgba(208, 217, 226, 1)',
    borderRadius: '8px',
  },
  geneMethylated: {
    gap: '10px',
  },
}));

interface IMethylationGenePanelProps {
  data: IMethylationGeneData;
  setData?: Dispatch<SetStateAction<IMethylationGeneData[]>>;
  joined?: boolean;
}

export default function MethylationGenePanel({
  data,
  setData,
  joined,
}: IMethylationGenePanelProps): JSX.Element {
  const classes = useStyles({ joined });
  const zeroDashSdk = useZeroDashSdk();
  const { methBiosample } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [table, setTable] = useState<IMethGeneTable[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  const getMethStatusChipStyles = (status?: MethylationStatus): Pick<CSSProperties, 'color' | 'backgroundColor'> => {
    switch (status?.toLowerCase()) {
      case 'unmethylated':
        return {
          backgroundColor: corePalette.green10,
          color: corePalette.green300,
        };
      case 'methylated':
        return {
          backgroundColor: corePalette.red10,
          color: corePalette.red300,
        };
      case 'unknown':
      default:
        return {
          backgroundColor: corePalette.grey50,
          color: corePalette.offBlack100,
        };
    }
  };

  const handleUpdateGene = async (
    body: Partial<IMethylationGeneData>,
  ): Promise<void> => {
    if (methBiosample?.biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, data.reportable),
        };
        await zeroDashSdk.methylation.updateMethylationGene(
          newBody,
          methBiosample.biosampleId,
          data.geneId,
        );
        if (setData) {
          setData((prev) => prev.map((gene) => ({
            ...gene,
            ...(
              gene.gene === data.gene
                ? newBody
                : {}
            ),
          })));
        }
      } catch {
        enqueueSnackbar('Cannot update Meth gene data, please try again.', { variant: 'error' });
      }
    }
  };
  useEffect(() => {
    async function getMethTable(): Promise<void> {
      if (data.geneId && methBiosample?.biosampleId) {
        setTableLoading(true);
        try {
          const resp = await zeroDashSdk.methylation.getMethGeneTable(
            methBiosample.biosampleId,
            data.geneId,
          );
          setTable(resp);
        } catch (err) {
          enqueueSnackbar('Could not load meth table data', { variant: 'error' });
        } finally {
          setTableLoading(false);
        }
      }
    }
    getMethTable();
  }, [methBiosample?.biosampleId, data.geneId, enqueueSnackbar, zeroDashSdk.methylation]);

  return (
    <Paper elevation={0}>
      <StickySection>
        <Grid container height="100%" gap="8px" alignItems="center">
          <Grid flex={2}>
            <IconButton
              disableRipple
              onClick={(): void => setExpanded(!expanded)}
            >
              <Maximize2Icon />
            </IconButton>
          </Grid>
          <Grid direction="column" container flex={10}>
            <CustomTypography variant="label">GENE</CustomTypography>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap="16px"
            >
              <CustomTypography truncate variant="titleRegular" fontWeight="bold">
                {data.gene}
              </CustomTypography>
              <StatusChip
                status={data.status as string}
                {...getMethStatusChipStyles(data.status)}
              />
            </Box>
            <Box display="flex" alignItems="baseline">
              <CustomTypography
                variant="label"
              >
                Sentrix ID:&nbsp;
              </CustomTypography>
              <CustomTypography variant="bodyRegular" truncate>
                {data.methId ? data.methId.split('_')[0] : '-'}
              </CustomTypography>
            </Box>
            <Box display="flex" alignItems="baseline">
              <CustomTypography
                truncate
                variant="label"
              >
                Sentrix Position:&nbsp;
              </CustomTypography>
              <CustomTypography truncate variant="bodyRegular">
                { data.methId && data.methId.split('_').length > 1
                  ? data.methId.split('_')[1]
                  : '-'}
              </CustomTypography>
            </Box>
          </Grid>
        </Grid>
      </StickySection>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">MEDIAN BETA VALUE</CustomTypography>
          <CustomChip
            label={data.median ? toFixed(data.median, 2) : '-'}
            size="medium"
            backgroundColour={corePalette.grey50}
            colour={corePalette.offBlack100}
            fontWeight="bold"
            sx={{ width: '150px' }}
          />
          <CustomTypography
            variant="bodyRegular"
          >
            Lowest&nbsp;
            {data.lowest ? toFixed(data.lowest, 2) : '-'}
          </CustomTypography>
          <CustomTypography
            variant="bodyRegular"
          >
            Highest&nbsp;
            {data.highest ? toFixed(data.highest, 2) : '-'}
          </CustomTypography>
        </Grid>
      </Item>
      <PlotItem>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            GENE METHYLATION STATUS PREDICTION
          </CustomTypography>
          <Plot>
            <MethylationInteractivePlot
              imageUrl={data.genePlot || ''}
              data={table}
              gene={data.gene}
            />
          </Plot>
        </Grid>
      </PlotItem>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            CLASSIFICATION
          </CustomTypography>
          {data.classification && (
            <ClassificationChip
              classification={getClassificationDisplayValue(data.classification) || ''}
              reportable={data.reportable}
            />
          )}
          <CustomTypography variant="bodySmall">
            {inXSamplesText(data.reportedCount)}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            TARGETABLE
          </CustomTypography>
          {data.targetable !== null && data.targetable !== undefined && (
            <TargetableChip
              targetable={data.targetable ? 'Yes' : 'No'}
            />
          )}
          <CustomTypography variant="bodySmall">
            {inXSamplesText(data.targetableCount)}
          </CustomTypography>
        </Grid>
      </Item>
      {expanded && methBiosample && (
        <ExpandedModal
          open={expanded}
          variantType="METHYLATION"
          variantId={data.geneId}
          biosampleId={methBiosample.biosampleId}
          handleClose={(): void => setExpanded(false)}
          variant={data}
          handleUpdateVariant={handleUpdateGene}
          hideIncludeInReport
          title={(
            <Box>
              <CustomTypography variant="label">
                GENE
              </CustomTypography>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-start"
                className={classes.geneMethylated}
              >
                <CustomTypography variant="titleRegular" fontWeight="medium">
                  {data.gene}
                </CustomTypography>
                <StatusChip
                  status={data.status as string}
                  {...getMethStatusChipStyles(data.status)}
                />
              </Box>
            </Box>
          )}
          curationDataComponent={(
            <MethylationGeneModal
              data={data}
              updateData={handleUpdateGene}
              table={table}
              loading={tableLoading}
            />
          )}

        />
      )}
    </Paper>

  );
}
