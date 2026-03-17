import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { mapSVDisruption } from '@/utils/functions/SVs/mapSVDisruption';
import {
    Box,
    ButtonBase,
    Grid,
    IconButton,
    Link,
    Paper as MuiPaper,
    styled,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import copy from 'copy-to-clipboard';
import {
    ChevronDownIcon, ChevronUpIcon, CopyIcon, Maximize2Icon,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ISelectOption } from '../../types/misc.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { IGermlineSV, IUpdateSVBody } from '../../types/SV.types';
import { getCurationSVGenes } from '../../utils/functions/getSVGenes';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { toFixed } from '../../utils/math/toFixed';
import { getClassificationDisplayValue } from '../../utils/misc';
import { inXSamplesText } from '../../utils/misc/strings';
import {
    ClassificationChip,
    PrismChip,
    TargetableChip,
} from '../Chips';
import { ScoreChip } from '../Chips/ScoreChip';
import StatusChip from '../Chips/StatusChip';
import CustomTypography from '../Common/Typography';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import ChildSVHeader from '../SVs/ChildSVHeader';
import ChildSVListItem from '../SVs/ChildSVListItem';
import SVsModal from '../SVs/SVsModalLeft';
import InframeTooltip from '../Tooltip/InframeTooltip';

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
  flexDirection: 'column',
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
  width: '25%',
  minWidth: '450px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '200px',
  minWidth: '200px',
}));

const useStyles = makeStyles(() => createStyles({
  genePanel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  panel: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 16,
    paddingRight: 20,
  },
  chipPanel: {
    margin: 'auto',
    flex: 1,
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 28,
  },
  expandIcon: {
    width: 24,
    height: 24,
  },
  geneIcon: {
    width: 60,
    height: 60,
    marginRight: 30,
    marginLeft: 30,
  },
  title: {
    marginTop: 8,
    marginBottom: 8,
  },
  spacer: {
    marginLeft: 8,
    marginRight: 8,
  },
  iconPanel: {
    display: 'flex',
  },
  shapePanel: {
    display: 'flex',
    width: 40,
    height: 40,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  genomePanel: {
    alignItems: 'center',
  },
  dynamicWrapper: {
    width: '100%',
    height: '100%',
  },
  svFusion: {
    marginTop: '8px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '@media (max-width: 1440px)': {
      paddingRight: '15px!important',
      overflowWrap: 'anywhere !important',
    },
  },
  disruptedChip: {
    padding: '10px 0',
  },
  childSVsToggleBar: {
    width: '100%',
    padding: '6px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECF0F3',
    cursor: 'pointer',
  },
  stickyShowHide: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'sticky',
    right: 12,
  },
}));

interface IProps {
  germlineSV: IGermlineSV;
  minScore: number;
  maxScore: number;
  updateGermlineSV?: (germlineSV: IGermlineSV) => void;
  joined?: boolean;
  allChildExpanded?: boolean;
}

export default function SVGermlineListItem({
  germlineSV,
  minScore,
  maxScore,
  updateGermlineSV,
  joined,
  allChildExpanded,
}: IProps): JSX.Element {
  const classes = useStyles({ joined });
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { germlineGeneList } = useCuration();
  const { germlineBiosample, analysisSet, demographics } = useAnalysisSet();

  const [expand, setExpand] = useState<boolean>(false);
  const [childSVsExpanded, setChildSVsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setChildSVsExpanded(allChildExpanded || false);
  }, [allChildExpanded]);

  const handleUpdateGermlineSV = async (
    body: IUpdateSVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (germlineBiosample?.biosampleId) {
      try {
        const newReportable = getUpdatedReportableValue(body, germlineSV.reportable);
        const newBody = {
          ...body,
          reportable: newReportable,
        };
        await zeroDashSdk.sv.germline.updateGermlineSVById(
          newBody,
          germlineBiosample.biosampleId,
          germlineSV.internalId,
        );
        if (updateGermlineSV) {
          updateGermlineSV({
            ...germlineSV,
            ...newBody,
          });
        }

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: newReportable,
            defaultValue: reports,
            gene: germlineSV.startGene.gene,
            secondaryGene: germlineSV.endGene.gene,
            geneList: germlineGeneList,
            variantType: 'GERMLINE_SV',
            germlineConsent: demographics,
          });
        }
        return newReports;
      } catch (err) {
        enqueueSnackbar('Cannot update Germline SV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const handleSetDefaultSV = async (promotedSV: IGermlineSV): Promise<void> => {
    if (germlineBiosample?.biosampleId) {
      try {
        await zeroDashSdk.sv.germline.promoteGermlineSV(
          germlineBiosample.biosampleId,
          promotedSV.internalId,
          analysisSet.analysisSetId,
        );
        // set the fields for the new default
        const newDefaultSV: IGermlineSV = {
          ...promotedSV,
          classification: germlineSV.classification,
          reportable: germlineSV.reportable,
          targetable: germlineSV.targetable,
          pathclass: germlineSV.pathclass,
          researchCandidate: germlineSV.researchCandidate,
        };
        // clear set fields for old default
        const oldDefault: IGermlineSV = {
          ...germlineSV,
          classification: null,
          reportable: null,
          targetable: null,
          pathclass: null,
          researchCandidate: null,
        };
        // add the old default to the children
        const newSVChildren = [
          oldDefault,
          ...(germlineSV.childSVs || []).filter(
            (childSV) => childSV.internalId !== promotedSV.internalId,
          ),
        ];
        if (updateGermlineSV) {
          updateGermlineSV({
            ...newDefaultSV,
            childSVs: newSVChildren,
          });
        }

        // update selected reports data
        if (oldDefault.variantId !== newDefaultSV.variantId) {
          const oldDefaultReportsData = await zeroDashSdk.reportableVariants.getReportableVariants(
            analysisSet.analysisSetId,
            {
              variantType: ['GERMLINE_SV'],
              variantId: oldDefault.variantId.toString(),
            },
          );

          if (oldDefaultReportsData.length && germlineBiosample) {
            const oldDefaultReports = oldDefaultReportsData.map(
              (reportsData) => reportsData.reportType,
            );
            // update reports with new variantId
            await zeroDashSdk.reportableVariants.updateReportableVariant(
              analysisSet.analysisSetId,
              germlineBiosample.biosampleId,
              {
                variantType: 'GERMLINE_SV',
                variantId: newDefaultSV.variantId.toString(),
                reports: oldDefaultReports,
              },
            );
            // delete oldDefault reports data
            await zeroDashSdk.reportableVariants.updateReportableVariant(
              analysisSet.analysisSetId,
              germlineBiosample.biosampleId,
              {
                variantType: 'GERMLINE_SV',
                variantId: oldDefault.variantId.toString(),
                reports: [],
              },
            );
          }
        }
      } catch {
        enqueueSnackbar('Cannot update default Germline SV data, please try again.', { variant: 'error' });
      }
    }
  };

  const geneIds: ISelectOption<number>[] = [];
  if (germlineSV.startGene.geneId) {
    geneIds.push({
      name: germlineSV.startGene.gene,
      value: germlineSV.startGene.geneId,
    });
  }
  if (germlineSV.endGene.geneId) {
    geneIds.push({
      name: germlineSV.endGene.gene,
      value: germlineSV.endGene.geneId,
    });
  }

  return (
    <Paper elevation={0}>
      <Grid container wrap="nowrap" justifyContent="space-between" minWidth="100%" width="fit-content">
        <StickySection>
          <Grid container height="100%" gap="8px" alignItems="center">
            <Grid flex={1}>
              <IconButton
                onClick={(): void => setExpand(true)}
              >
                <Maximize2Icon />
              </IconButton>
            </Grid>
            <Grid flex={2}>
              <ConsequencePathclassIcon
                pathclass={germlineSV.pathclass}
              />
            </Grid>
            <Grid direction="column" container flex={9}>
              <CustomTypography variant="label">GENE</CustomTypography>
              <CustomTypography
                truncate
                variant="titleRegular"
                fontWeight="medium"
                className={classes.title}
              >
                {`${getCurationSVGenes(germlineSV)} | ${germlineSV.svType}`}
              </CustomTypography>
              <Box display="flex" alignItems="center" gap="8px">
                <Link
                  // TODO: fix when protein paint is ready
                  href={`http://proteinpaint.ccimr.cloud:3000/?block=1&genome=hg19&position=${
                    germlineSV.chrBkpt1
                  }:${germlineSV.posBkpt1 - 1}-${germlineSV.posBkpt1}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ pointerEvents: 'none' }}
                >
                  <CustomTypography display="inline">
                    {germlineSV.chrBkpt1}
                    :
                    {germlineSV.posBkpt1}
                  </CustomTypography>
                </Link>
                <CustomTypography display="inline" className={classes.spacer}>
                  |
                </CustomTypography>
                <Link
                  // TODO: fix when protein paint is ready
                  href={`http://proteinpaint.ccimr.cloud:3000/?block=1&genome=hg19&position=${
                    germlineSV.chrBkpt2
                  }:${germlineSV.posBkpt2 - 1}-${germlineSV.posBkpt2}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ pointerEvents: 'none' }}
                >
                  <CustomTypography display="inline">
                    {germlineSV.chrBkpt2}
                    :
                    {germlineSV.posBkpt2}
                  </CustomTypography>
                </Link>
                <ButtonBase
                  style={{ marginLeft: '8px' }}
                  onClick={(): boolean => copy(`${germlineSV.chrBkpt1}:${germlineSV.posBkpt1} ${germlineSV.chrBkpt2}:${germlineSV.posBkpt2}`)}
                >
                  <CopyIcon size={20} />
                </ButtonBase>
              </Box>
              {germlineSV.svType !== 'DISRUPTION' && (
                <Box display="flex" alignItems="center" gap="8px">
                  <CustomTypography display="inline">
                    Start VAF:
                    &nbsp;
                    {germlineSV.startAf ? toFixed(germlineSV.startAf, 2) : ''}
                  </CustomTypography>

                  <CustomTypography display="inline" className={classes.spacer}>
                    |
                  </CustomTypography>
                  <CustomTypography display="inline">
                    End VAF:
                    &nbsp;
                    {germlineSV.endAf ? toFixed(germlineSV.endAf, 2) : ''}
                  </CustomTypography>
                </Box>
              )}
            </Grid>
          </Grid>
        </StickySection>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">
              HELIUM SCORE
            </CustomTypography>
            <ScoreChip
              min={minScore}
              max={maxScore}
              mid={minScore}
              value={germlineSV.pathscore}
              isLOH={false}
            />
            <CustomTypography>
              RNA Confidence:
              &nbsp;
              {germlineSV.rnaconf || 'None'}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            {germlineSV.svType === 'DISRUPTION' ? (
              <>
                <CustomTypography variant="label" display="block">
                  Gene Total Exon Count
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  truncate
                  className={classes.svFusion}
                >
                  {germlineSV.startGeneExons}
                    &nbsp;
                  {germlineSV.startGeneExons === 1 ? 'exon' : 'exons'}
                </CustomTypography>
              </>
            ) : (
              <>
                <CustomTypography variant="label" display="block">
                  FUSION
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  truncate
                  className={classes.svFusion}
                >
                  Start:
                  &nbsp;
                  {
                      germlineSV.startFusion.includes(':') && germlineSV.startFusion.split(':')[1]
                        ? `${germlineSV.startFusion.split(':')[1].replace('Exon', '')} of ${germlineSV.startGeneExons} ${germlineSV.startGeneExons === 1 ? 'exon' : 'exons'}`
                        : germlineSV.startFusion
                    }
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  truncate
                >
                  End:
                  &nbsp;
                  {
                      germlineSV.endFusion.includes(':') && germlineSV.endFusion.split(':')[1]
                        ? `${germlineSV.endFusion.split(':')[1].replace('Exon', '')} of ${germlineSV.endGeneExons} ${germlineSV.endGeneExons === 1 ? 'exon' : 'exons'}`
                        : germlineSV.endFusion
                    }
                </CustomTypography>
                { mapSVDisruption(germlineSV.markDisrupted) ? (
                  <div className={classes.disruptedChip}>
                    <StatusChip
                      status={mapSVDisruption(germlineSV.markDisrupted) as string}
                      backgroundColor="#fcd7b1"
                      color="#e36d00"
                    />
                  </div>
                ) : ''}
              </>
            )}
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label" display="block">
              Gene List
            </CustomTypography>
            <PrismChip label={germlineSV.prismclass ? germlineSV.prismclass : 'N/A'} />
            <CustomTypography
              variant="bodyRegular"
              style={{ color: '#1A1A1A' }}
            >
                &nbsp;
              {`Platform: ${germlineSV.platforms}`}
            </CustomTypography>
            <CustomTypography
              variant="bodyRegular"
              style={{ color: '#1A1A1A', width: 'fit-content' }}
              tooltipText={germlineSV.inframe ? <InframeTooltip inframe={germlineSV.inframe} /> : ''}
            >
                &nbsp;
              {`Inframe: ${!germlineSV.inframe ? 'Unknown' : germlineSV.inframe}`}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">CLASSIFICATION</CustomTypography>
            {germlineSV.classification && (
              <ClassificationChip
                classification={getClassificationDisplayValue(germlineSV.classification)}
                reportable={germlineSV.reportable}
              />
            )}
            <CustomTypography variant="bodySmall">
              {inXSamplesText(germlineSV.reportedCount)}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">TARGETABLE</CustomTypography>
            {germlineSV.targetable !== null && (
            <TargetableChip targetable={germlineSV.targetable ? 'Yes' : 'No'} />
            )}
            <CustomTypography variant="bodySmall">
              {inXSamplesText(germlineSV.targetableCount)}
            </CustomTypography>
          </Grid>
        </Item>
      </Grid>
      {germlineSV.childSVs?.length ? (
        <Box
          minWidth="100%"
          display="flex"
          flexDirection="column"
        >
          <Box
            className={classes.childSVsToggleBar}
            onClick={(): void => setChildSVsExpanded((prev) => !prev)}
          >
            <CustomTypography
              variant="label"
              fontWeight="bold"
              style={{ position: 'sticky', left: 12 }}
            >
              {`Related Structural Variants (${germlineSV.childSVs?.length})`}
            </CustomTypography>
            <CustomTypography
              variant="label"
              fontWeight="bold"
              className={classes.stickyShowHide}
            >
              {childSVsExpanded ? (
                <>
                  Hide
                  <ChevronUpIcon />
                </>
              ) : (
                <>
                  Show
                  <ChevronDownIcon />
                </>
              )}
            </CustomTypography>
          </Box>
          {childSVsExpanded && (
            <>
              <ChildSVHeader />
              {germlineSV.childSVs?.map((childSV) => (
                <ChildSVListItem
                  key={childSV.internalId}
                  sv={childSV}
                  handleSetDefaultSV={handleSetDefaultSV}
                />
              ))}
            </>
          )}
        </Box>
      ) : (
        <div />
      )}
      {expand && germlineBiosample && (
        <ExpandedModal
          open={expand}
          variantType="GERMLINE_SV"
          variantId={germlineSV.variantId}
          biosampleId={germlineBiosample.biosampleId}
          variantGenes={
            germlineSV.startGene.geneId === germlineSV.endGene.geneId
              ? [germlineSV.startGene]
              : [germlineSV.startGene, germlineSV.endGene]
          }
          handleClose={(): void => setExpand(false)}
          title="GENE"
          titleContent={getCurationSVGenes(germlineSV)}
          params={{
            cosmic: `/search?q=${germlineSV.startGene.gene}`,
            clinvar: germlineSV.startGene?.gene,
            gnomad: `/gene/${germlineSV.startGene?.gene}`,
            pecan: `/proteinpaint/${germlineSV.startGene?.gene}`,
            varSom: `/gene/${germlineSV.startGene?.gene}`,
            geneCard: [germlineSV.startGene?.gene, germlineSV.endGene?.gene],
            genome: `?block=1&genome=hg19&position=chr${germlineSV?.chrBkpt2}:${
              (germlineSV?.posBkpt2 || 0) - 1
            }-${germlineSV?.posBkpt2}`,
            ucscData: germlineSV,
            oncokb: `/gene/${germlineSV.startGene.gene}`,
            geneIds,
          }}
          titleIcon={(
            <ConsequencePathclassIcon
              pathclass={germlineSV.pathclass}
            />
          )}
          variant={germlineSV}
          handleUpdateVariant={handleUpdateGermlineSV}
          curationDataComponent={(
            <SVsModal
              data={germlineSV}
              handleUpdateSV={handleUpdateGermlineSV}
              handleSetDefaultSV={handleSetDefaultSV}
            />
          )}
        />
      )}
    </Paper>
  );
}
