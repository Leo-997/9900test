import {
  Box, ButtonBase,
  Grid, IconButton,
  Paper as MuiPaper,
  styled,
  Tooltip,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import copy from 'copy-to-clipboard';
import { CopyIcon, InfoIcon, Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ReportType } from '../../types/Reports/Reports.types';
import { IGermlineSNV } from '../../types/SNV.types';
import getVarsomPath from '../../utils/functions/getVarsomPath';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { toFixed } from '../../utils/math/toFixed';
import { getClassificationDisplayValue } from '../../utils/misc';
import { inXSamplesText } from '../../utils/misc/strings';
import { IUpdateGermlineSNVBody } from '../../utils/sdk/clients/curation/snv/germline';
import {
  ClassificationChip,
  PrismChip,
  TargetableChip,
} from '../Chips';
import { ScoreChip } from '../Chips/ScoreChip';
import CustomTypography from '../Common/Typography';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import SNVGermLineModalLeft from './SNVGermlineModalLeft';
import ExpandedModalTitle from '../ExpandedModal/Components/ExpandedModalTitle';
import FrequencyChip from '../Chips/FrequencyChip';

interface ICSSProps {
  joined?: boolean;
}

const Paper = styled(MuiPaper)<ICSSProps>(({ joined }) => ({
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
  width: '30%',
  minWidth: '500px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '200px',
  minWidth: '200px',
}));

const useStyles = makeStyles(() => createStyles({
  paper: (props: ICSSProps) => ({
    margin: props.joined ? 0 : '6px 0 6px 0',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '4px',
    minHeight: 180,
    borderRadius: props.joined ? 0 : '4px',
    borderWidth: props.joined ? 1 : 0.5,
    borderColor: props.joined ? '#D0D9E2' : '#FFFFFF',
    borderTopStyle: props.joined ? 'dashed' : 'solid',
    borderStyle: props.joined ? 'none' : 'solid',
    background: props.joined ? 'auto' : 'auto',
    width: '100%',
    backdropFilter: 'blur(8px)',
  }),

  panel: {
    paddingTop: 16,
    paddingBottom: 0,
    flexWrap: 'nowrap',
  },
  chipPanel: {
    margin: 'auto',
    width: '60%',
    flex: 1,
    paddingTop: 30,
    paddingBottom: 30,
  },

  avgCopy: {
    display: 'flex',
    alignItems: 'center',
  },
  expandIcon: {
    width: 32,
    height: 32,
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
    width: '440px',
    fontSize: '19px',
  },
  label: {
    color: '#5E6871',
    display: 'inline-block',
    maxWidth: '100%',
    verticalAlign: 'top',
  },
  spacer: {
    marginLeft: 8,
    marginRight: 8,
  },
  wholeGeneIcon: {
    width: 32,
    height: 32,
    marginLeft: 8,
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
  linkContainer: {
    marginTop: 50,
  },
  decimal: {
    color: '#022034',
    fontWeight: 'normal',
  },
  arrowIcon: {
    color: '#1E86FC',
    marginLeft: '10px',
    verticalAlign: 'text-bottom',
    transform: 'matrix(-0.71, 0.71, 0.71, 0.71, 0, 0)',
  },
  link: {
    color: '#1E86FC',
    textDecoration: 'underline',
  },
  dynamicWrapper: {
    width: '100%',
    height: '100%',
  },
  copyIcon: {
    width: '20px',
    height: '20px',
  },
  buttonBase: {
    marginLeft: '8px',
  },
}));

interface IProp {
  snv: IGermlineSNV;
  updateSNV?: (data: IGermlineSNV) => void;
  joined?: boolean;
}

export default function SNVGermlineListItem({
  snv,
  updateSNV,
  joined,
}: IProp): JSX.Element {
  const classes = useStyles({ joined });

  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { germlineGeneList } = useCuration();
  const { germlineBiosample, demographics } = useAnalysisSet();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleModalOpen = (): void => {
    setModalOpen(true);
  };

  const handleModalClose = (): void => {
    setModalOpen(false);
  };

  const handleUpdateData = async (
    body: IUpdateGermlineSNVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (germlineBiosample?.biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, snv.reportable),
        };
        await zeroDashSdk.snv.germline.updateCuratedSampleGermlineSnvById(
          germlineBiosample.biosampleId,
          newBody,
          {
            chromosome: snv.chr,
            position: snv.pos,
            ref: snv.snvRef,
            alt: snv.alt,
          },
        );
        if (updateSNV) {
          updateSNV({ ...snv, ...newBody });
        }

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, snv.reportable),
            defaultValue: reports,
            gene: snv.gene,
            geneList: germlineGeneList,
            variantType: 'GERMLINE_SNV',
            germlineConsent: demographics,
          });
        }
        return newReports;
      } catch {
        enqueueSnackbar('Cannot update SNV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const dnaVaf = snv.altad && snv.depth ? snv.altad / snv.depth : undefined;

  const handleParam = (): string => {
    if (snv?.hgvs) {
      const matches = snv?.hgvs.match(
        /(.+):(c\.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\s?(\((p\..[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\))?/,
      );

      if (matches && matches[2]) {
        const hvg = matches[2];

        return `${snv?.gene}:${hvg}`;
      }
    }
    return '';
  };

  const cosmicLink = snv.cosmicId
    ? `/search?q=${snv.cosmicId}`
    : `/search?q=${handleParam()}`;

  const icon = (
    <ConsequencePathclassIcon
      consequence={snv.consequence}
      pathclass={snv.pathclass}
      height={54}
      width={54}
    />
  );

  const modalTitle = (
    <ExpandedModalTitle
      title="HGVS"
      titleContent={snv.hgvs}
      icon={icon}
    />
  );

  return (
    <>
      <Paper elevation={0}>
        <StickySection>
          <Grid container height="100%" gap="8px" alignItems="center">
            <Grid flex={1}>
              <IconButton aria-label="Expand Snv" onClick={handleModalOpen}>
                <Maximize2Icon />
              </IconButton>
            </Grid>
            <Grid flex={2}>
              {icon}
            </Grid>
            <Grid flex={9} direction="column" container>
              <CustomTypography variant="label">HGVS</CustomTypography>
              <CustomTypography
                truncate
                variant="titleRegular"
                fontWeight="medium"
                className={classes.title}
              >
                {snv.hgvs}
              </CustomTypography>
              <Box>
                <CustomTypography variant="bodyRegular">
                  Gene:
                  &nbsp;
                  {snv.gene}
                </CustomTypography>
                <Box display="flex" gap="8px">
                  <CustomTypography
                    truncate
                    variant="bodyRegular"
                  >
                    Location:
                    {' '}
                    {snv.chr}
                    :
                    {snv.pos}
                  </CustomTypography>
                  <ButtonBase
                    className={classes.buttonBase}
                    onClick={(): boolean => copy(`${snv.chr}:${snv.pos}`)}
                  >
                    <CopyIcon size={20} />
                  </ButtonBase>
                  {snv.genotype && (
                  <Box display="flex" gap="8px">
                    <CustomTypography
                      variant="bodyRegular"
                      display="inline"
                      className={classes.spacer}
                    >
                      |
                    </CustomTypography>
                    <CustomTypography
                      truncate
                      variant="bodyRegular"
                      style={{ maxWidth: '50px' }}
                    >
                      {snv.genotype}
                    </CustomTypography>
                    <ButtonBase
                      className={classes.buttonBase}
                      onClick={(): boolean => copy(snv.genotype || '')}
                    >
                      <CopyIcon size={20} />
                    </ButtonBase>
                  </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </StickySection>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">Helium Score</CustomTypography>
            <br />
            <ScoreChip
              min={0}
              mid={0.5}
              max={1}
              value={snv.heliumScore || 0}
              isLOH={false}
            />
            <CustomTypography variant="bodyRegular">
              VAF:
              &nbsp;
              {dnaVaf ? (
                <>
                  {toFixed(dnaVaf, 2)}
                  &nbsp;
                  (
                  {`${snv.altad} / ${snv.depth}`}
                  )
                </>
              ) : null}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label" display="block">
              Gene List
            </CustomTypography>
            <PrismChip
              label={snv.geneLists ? snv.geneLists : 'N/A'}
            />
            <CustomTypography
              variant="bodyRegular"
              style={{ color: '#1A1A1A' }}
            >
              Platform:
              &nbsp;
              {snv.platforms}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <Grid container gap="4px" alignItems="center">
              <CustomTypography variant="label" display="flex" alignItems="center" gap="4px">
                Frequency
                <Tooltip
                  title="Counts may vary by 1 if viewed within 24 hrs of case release"
                >
                  <InfoIcon size="1rem" />
                </Tooltip>
              </CustomTypography>
            </Grid>
            <FrequencyChip
              tabName="germline_snv"
              label="Germline"
              frequency={snv.sampleCount}
              modalTitle={modalTitle}
            />
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">CLASSIFICATION</CustomTypography>
            {snv.classification && (
              <ClassificationChip
                classification={getClassificationDisplayValue(snv.classification)}
                reportable={snv.reportable}
              />
            )}
            <CustomTypography variant="bodySmall">
              {inXSamplesText(snv.reportedCount)}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">TARGETABLE</CustomTypography>
            {snv.targetable !== null && (
              <TargetableChip
                targetable={snv.targetable ? 'Yes' : 'No'}
              />
            )}
            <CustomTypography variant="bodySmall">
              {inXSamplesText(snv.targetableCount)}
            </CustomTypography>
          </Grid>
        </Item>
      </Paper>
      {modalOpen && germlineBiosample && (
        <ExpandedModal
          open={modalOpen}
          variantId={snv.variantId}
          variantType="GERMLINE_SNV"
          biosampleId={germlineBiosample.biosampleId}
          variantGenes={[{
            geneId: snv.geneId,
            gene: snv.gene,
          }]}
          handleClose={handleModalClose}
          variant={snv}
          handleUpdateVariant={handleUpdateData}
          curationDataComponent={(
            <SNVGermLineModalLeft
              handleUpdateData={handleUpdateData}
              snv={snv}
            />
          )}
          params={{
            cosmic: cosmicLink,
            clinvar: handleParam(),
            gnomad: `/gene/${handleParam()}`,
            oncokb: `/gene/${handleParam()}`,
            pecan: `/proteinpaint/${handleParam()}`,
            varSom: `${getVarsomPath(snv?.hgvs, 'germline')}`,
            civic: { gene: snv.gene, variant: snv.hgvs },
            geneCard: snv.gene,
            geneIds: [
              {
                name: snv.gene,
                value: snv.geneId,
              },
            ],
          }} // should provide a valid gene
          title="HGVS"
          titleContent={snv.hgvs}
          titleIcon={icon}
        />
      )}
    </>
  );
}
