import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { mapSVDisruption } from '@/utils/functions/SVs/mapSVDisruption';
import {
    Box, ButtonBase, Grid, IconButton, Link, Paper as MuiPaper,
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
import { ISomaticSV, IUpdateSVBody } from '../../types/SV.types';
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
import SVsModalLeft from '../SVs/SVsModalLeft';
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
  label: {
    color: '#5E6871',
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
  link: {
    color: '#1E86FC',
    textDecoration: 'underline',
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
  sv: ISomaticSV;
  minScore: number;
  maxScore: number;
  updateSV?: (sv: ISomaticSV) => void;
  joined?: boolean;
  allChildExpanded?: boolean;
}

export default function SVListItem({
  sv,
  minScore,
  maxScore,
  updateSV,
  joined,
  allChildExpanded,
}: IProps): JSX.Element {
  const classes = useStyles({ joined });
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { somaticGeneList } = useCuration();
  const { analysisSet } = useAnalysisSet();

  const [expand, setExpand] = useState<boolean>(false);
  const [childSVsExpanded, setChildSVsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setChildSVsExpanded(allChildExpanded || false);
  }, [allChildExpanded]);

  const handleModalOpen = (): void => {
    setExpand(true);
  };

  const handleModalClose = (): void => {
    setExpand(false);
  };

  const handleUpdateSV = async (
    body: IUpdateSVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    try {
      const newBody = {
        ...body,
        reportable: getUpdatedReportableValue(body, sv.reportable),
      };
      await zeroDashSdk.sv.somatic.updateSvById(
        newBody,
        sv.biosampleId,
        sv.internalId,
      );
      if (updateSV) {
        updateSV({
          ...sv,
          ...newBody,
        });
      }

      let newReports: ReportType[] = [];
      if (reports) {
        newReports = getUpdatedReportsValue({
          reportable: getUpdatedReportableValue(body, sv.reportable),
          defaultValue: reports,
          gene: sv.startGene.gene,
          secondaryGene: sv.endGene.gene,
          geneList: somaticGeneList,
        });
      }
      return newReports;
    } catch (err) {
      enqueueSnackbar('Cannot update SV data, please try again.', { variant: 'error' });
    }
    return [];
  };

  const handleSetDefaultSV = async (promotedSV: ISomaticSV): Promise<void> => {
    try {
      await zeroDashSdk.sv.somatic.promoteSV(
        promotedSV.biosampleId,
        promotedSV.internalId,
        analysisSet.analysisSetId,
      );
      // set the fields for the new default
      const newDefaultSV: ISomaticSV = {
        ...promotedSV,
        classification: sv.classification,
        reportable: sv.reportable,
        targetable: sv.targetable,
        pathclass: sv.pathclass,
        researchCandidate: sv.researchCandidate,
      };
      // clear set fields for old default
      const oldDefault: ISomaticSV = {
        ...sv,
        classification: null,
        reportable: null,
        targetable: null,
        pathclass: null,
        researchCandidate: null,
      };
      // add the old default to the children
      const newSVChildren = [
        oldDefault,
        ...(sv.childSVs || []).filter(
          (childSV) => childSV.internalId !== promotedSV.internalId,
        ),
      ];
      if (updateSV) {
        updateSV({
          ...newDefaultSV,
          childSVs: newSVChildren,
        });
      }

      // update selected reports data
      if (oldDefault.variantId !== newDefaultSV.variantId) {
        const oldDefaultReportsData = await zeroDashSdk.reportableVariants.getReportableVariants(
          analysisSet.analysisSetId,
          {
            variantType: ['SV'],
            variantId: oldDefault.variantId.toString(),
          },
        );

        if (oldDefaultReportsData.length) {
          const oldDefaultReports = oldDefaultReportsData.map(
            (reportsData) => reportsData.reportType,
          );
          // update reports with new variantId
          await zeroDashSdk.reportableVariants.updateReportableVariant(
            analysisSet.analysisSetId,
            sv.biosampleId,
            {
              variantType: 'SV',
              variantId: newDefaultSV.variantId.toString(),
              reports: oldDefaultReports,
            },
          );
          // delete oldDefault reports data
          await zeroDashSdk.reportableVariants.updateReportableVariant(
            analysisSet.analysisSetId,
            sv.biosampleId,
            {
              variantType: 'SV',
              variantId: oldDefault.variantId.toString(),
              reports: [],
            },
          );
        }
      }
    } catch {
      enqueueSnackbar('Cannot update default SV data, please try again.', { variant: 'error' });
    }
  };

  const geneIds: ISelectOption<number>[] = [];
  if (sv.startGene.geneId) {
    geneIds.push({
      name: sv.startGene.gene,
      value: sv.startGene.geneId,
    });
  }
  if (sv.endGene.geneId) {
    geneIds.push({
      name: sv.endGene.gene,
      value: sv.endGene.geneId,
    });
  }

  return (
    <Paper elevation={0}>
      <Grid container wrap="nowrap" justifyContent="space-between" minWidth="100%" width="fit-content">
        <StickySection>
          <Grid container height="100%" gap="8px" alignItems="center">
            <Grid flex={1}>
              <IconButton
                onClick={handleModalOpen}
              >
                <Maximize2Icon />
              </IconButton>
            </Grid>
            <Grid flex={2}>
              <ConsequencePathclassIcon
                pathclass={sv.pathclass}
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
                {`${getCurationSVGenes(sv)} | ${sv.svType}`}
              </CustomTypography>
              <Box display="flex" alignItems="center" gap="8px">
                <Link
                  // TODO: fix when protein paint is ready
                  href={`http://proteinpaint.ccimr.cloud:3000/?block=1&genome=hg19&position=${
                    sv.chrBkpt1
                  }:${sv.posBkpt1 - 1}-${sv.posBkpt1}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ pointerEvents: 'none' }}
                >
                  <CustomTypography display="inline" className={classes.link}>
                    {sv.chrBkpt1}
                    :
                    {sv.posBkpt1}
                  </CustomTypography>
                </Link>
                <CustomTypography display="inline" className={classes.spacer}>
                  |
                </CustomTypography>
                <Link
                  // TODO: fix when protein paint is ready
                  href={`http://proteinpaint.ccimr.cloud:3000/?block=1&genome=hg19&position=${
                    sv.chrBkpt2
                  }:${sv.posBkpt2 - 1}-${sv.posBkpt2}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ pointerEvents: 'none' }}
                >
                  <CustomTypography display="inline" className={classes.link}>
                    {sv.chrBkpt2}
                    :
                    {sv.posBkpt2}
                  </CustomTypography>
                </Link>
                <ButtonBase
                  style={{ marginLeft: '8px' }}
                  onClick={(): boolean => copy(`${sv.chrBkpt1}:${sv.posBkpt1} ${sv.chrBkpt2}:${sv.posBkpt2}`)}
                >
                  <CopyIcon size={20} />
                </ButtonBase>
              </Box>
              {sv.svType !== 'DISRUPTION' && (
                <Box display="flex" alignItems="center" gap="8px">
                  <CustomTypography display="inline" className={classes.label}>
                    Start VAF:
                    &nbsp;
                    {sv.startAf ? toFixed(sv.startAf, 2) : ''}
                  </CustomTypography>

                  <CustomTypography display="inline" className={classes.spacer}>
                    |
                  </CustomTypography>
                  <CustomTypography display="inline" className={classes.label}>
                    End VAF:
                    &nbsp;
                    {sv.endAf ? toFixed(sv.endAf, 2) : ''}
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
              value={sv.pathscore}
              isLOH={false}
            />
            <CustomTypography>
              RNA Confidence:
              &nbsp;
              {sv.rnaconf || 'None'}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            {sv.svType === 'DISRUPTION' ? (
              <>
                <CustomTypography variant="label" display="block">
                  Gene Total Exon Count
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  truncate
                  className={classes.svFusion}
                >
                  {sv.startGeneExons}
                    &nbsp;
                  {sv.startGeneExons === 1 ? 'exon' : 'exons'}
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
                      sv.startFusion.includes(':') && sv.startFusion.split(':')[1]
                        ? `${sv.startFusion.split(':')[1].replace('Exon', '')} of ${sv.startGeneExons} ${sv.startGeneExons === 1 ? 'exon' : 'exons'}`
                        : sv.startFusion
                    }
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  truncate
                >
                  End:
                  &nbsp;
                  {
                      sv.endFusion.includes(':') && sv.endFusion.split(':')[1]
                        ? `${sv.endFusion.split(':')[1].replace('Exon', '')} of ${sv.endGeneExons} ${sv.endGeneExons === 1 ? 'exon' : 'exons'}`
                        : sv.endFusion
                    }
                </CustomTypography>
                { mapSVDisruption(sv.markDisrupted) ? (
                  <div className={classes.disruptedChip}>
                    <StatusChip
                      status={mapSVDisruption(sv.markDisrupted) as string}
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
            <PrismChip label={sv.prismclass ? sv.prismclass : 'N/A'} />
            <CustomTypography
              variant="bodyRegular"
              style={{ color: '#1A1A1A' }}
            >
                &nbsp;
              {`Platform: ${sv.platforms}`}
            </CustomTypography>
            <CustomTypography
              variant="bodyRegular"
              style={{ color: '#1A1A1A', width: 'fit-content' }}
              tooltipText={sv.inframe ? <InframeTooltip inframe={sv.inframe} /> : ''}
            >
                &nbsp;
              {`Inframe: ${!sv.inframe ? 'Unknown' : sv.inframe}`}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">CLASSIFICATION</CustomTypography>
            {sv.classification && (
              <ClassificationChip
                classification={getClassificationDisplayValue(sv.classification)}
                reportable={sv.reportable}
              />
            )}
            <CustomTypography variant="bodySmall">
              {inXSamplesText(sv.reportedCount)}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">TARGETABLE</CustomTypography>
            {sv.targetable !== null && (
            <TargetableChip targetable={sv.targetable ? 'Yes' : 'No'} />
            )}
            <CustomTypography variant="bodySmall">
              {inXSamplesText(sv.targetableCount)}
            </CustomTypography>
          </Grid>
        </Item>
      </Grid>
      {sv.childSVs?.length ? (
        <Box
          width="100%"
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
              {`Related Structural Variants (${sv.childSVs?.length})`}
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
              {sv.childSVs?.map((childSV) => (
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
      {expand && (
        <ExpandedModal
          open={expand}
          variantType="SV"
          variantId={sv.variantId}
          biosampleId={sv.biosampleId}
          variantGenes={
            sv.startGene.geneId === sv.endGene.geneId
              ? [sv.startGene]
              : [sv.startGene, sv.endGene]
          }
          handleClose={handleModalClose}
          title="GENE"
          titleContent={getCurationSVGenes(sv)}
          params={{
            cosmic: `/search?q=${sv.startGene.gene}`,
            clinvar: sv.startGene?.gene,
            gnomad: `/gene/${sv.startGene?.gene}`,
            pecan: `/proteinpaint/${sv.startGene?.gene}`,
            varSom: `/gene/${sv.startGene?.gene}`,
            geneCard: [sv.startGene?.gene, sv.endGene?.gene],
            genome: `?block=1&genome=hg19&position=chr${sv?.chrBkpt2}:${
              (sv?.posBkpt2 || 0) - 1
            }-${sv?.posBkpt2}`,
            ucscData: {
              chrBkpt1: sv?.chrBkpt1,
              chrBkpt2: sv?.chrBkpt2,
              posBkpt1: sv?.posBkpt1,
              posBkpt2: sv?.posBkpt2,
              biosampleId: sv?.biosampleId,
            },
            oncokb: `/gene/${sv.startGene?.gene}`,
            geneIds,
          }}
          titleIcon={(
            <ConsequencePathclassIcon
              pathclass={sv.pathclass}
            />
          )}
          variant={sv}
          handleUpdateVariant={handleUpdateSV}
          curationDataComponent={(
            <SVsModalLeft
              data={sv}
              handleUpdateSV={handleUpdateSV}
              handleSetDefaultSV={handleSetDefaultSV}
              minScore={minScore}
              maxScore={maxScore}
            />
          )}
        />
      )}
    </Paper>
  );
}
