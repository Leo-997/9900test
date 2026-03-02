import {
  Box,
  ButtonBase,
  Grid,
  IconButton,
  Paper as MuiPaper,
  styled,
  Tooltip,
} from '@mui/material';
import {
  Dispatch, SetStateAction, useMemo, useState, type JSX,
} from 'react';

import copy from 'copy-to-clipboard';

import { makeStyles } from '@mui/styles';
import { CopyIcon, Dna, Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { ISummary } from '../../types/Common.types';
import { ISomaticSnv } from '../../types/SNV.types';

import { toFixed } from '../../utils/math/toFixed';
import { getClassificationDisplayValue } from '../../utils/misc';
import { IUpdateCuratedSampleSomaticSNVsByIdBody } from '../../utils/sdk/clients/curation/snv/somatic';
import {
  ClassificationChip,
  PrismChip,
  TargetableChip,
} from '../Chips';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import { SNVModalContent } from './ModalContent';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';

import { useCuration } from '../../contexts/CurationContext';
import getVarsomPath from '../../utils/functions/getVarsomPath';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';

import { ReportType } from '../../types/Reports/Reports.types';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { ScoreChip } from '../Chips/ScoreChip';
import FrequencyChip from '../Chips/FrequencyChip';
import ExpandedModalTitle from '../ExpandedModal/Components/ExpandedModalTitle';
import { inXSamplesText } from '@/utils/misc/strings';

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

const useStyles = makeStyles(() => ({
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
  spacer: {
    marginLeft: 8,
    marginRight: 8,
  },
  buttonBase: {
    marginLeft: '8px',
  },
}));

interface IProp {
  snv: ISomaticSnv;
  summary?: ISummary;
  updateSNV?: (snv: ISomaticSnv) => void;
  joined?: boolean;
  setRefresh?: Dispatch<SetStateAction<boolean>>;
}

export function SnvListItem({
  snv,
  summary = { min: 0, mid: 0, max: 0 },
  updateSNV,
  joined,
  setRefresh,
}: IProp): JSX.Element {
  const classes = useStyles({ joined });
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { somaticGeneList } = useCuration();
  const { tumourBiosample } = useAnalysisSet();

  const getSeenInRows = useMemo(() => (
    inGermline = false,
    page?: number,
    limit?: number,
  ) => zeroDashSdk.snv.somatic.getSeenInByVariantId(
    snv.biosampleId,
    snv.variantId,
    inGermline,
    page,
    limit,
  ), [snv.biosampleId, snv.variantId, zeroDashSdk.snv.somatic]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleOpenModal = (): void => {
    setModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setModalOpen(false);
    if (setRefresh) {
      setRefresh(true);
    }
  };

  const handleUpdateVariant = async (
    body: IUpdateCuratedSampleSomaticSNVsByIdBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (tumourBiosample?.biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, snv.reportable),
        };
        await zeroDashSdk.snv.somatic.updateCuratedSampleSomaticSnvById(
          newBody,
          tumourBiosample?.biosampleId,
          snv.internalId,
        );
        if (updateSNV) {
          updateSNV({
            ...snv,
            ...newBody,
          });
        }

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, snv.reportable),
            defaultValue: reports,
            gene: snv.gene,
            geneList: somaticGeneList,
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
        const hgvs = matches[2];

        return `${snv?.gene}:${hgvs}`;
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
              <IconButton aria-label="Expand Snv" onClick={handleOpenModal}>
                <Maximize2Icon />
              </IconButton>
            </Grid>
            <Grid flex={2}>
              {icon}
            </Grid>
            <Grid direction="column" container flex={9}>
              <CustomTypography variant="label">HGVS</CustomTypography>
              <CustomTypography
                truncate
                variant="titleRegular"
                fontWeight="medium"
              >
                {snv.hgvs}
              </CustomTypography>
              <CustomTypography variant="bodyRegular">
                Gene:
                {' '}
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
                    style={{ maxWidth: '100px' }}
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
              <Box display="flex" gap="8px">
                <CustomTypography
                  variant="bodyRegular"
                  display="inline"
                >
                  CN:
                  {' '}
                  {!(snv.copyNumber === undefined || snv.copyNumber === null)
                    ? toFixed(snv.copyNumber, 2)
                    : null}
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  display="inline"
                  className={classes.spacer}
                >
                  |
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  display="inline"
                >
                  RNA TPM:
                  {' '}
                  {!(snv.rnaTpm === undefined || snv.rnaTpm === null)
                    ? toFixed(snv.rnaTpm, 2)
                    : null}
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  display="inline"
                  className={classes.spacer}
                >
                  |
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  display="inline"
                >
                  RNA VAF:
                  {!(snv.rnaVafNo === undefined || snv.rnaVafNo === null)
                    ? toFixed(snv.rnaVafNo, 2)
                    : ''}
                  {!(snv.rnaAltad === undefined || snv.rnaAltad === null)
                    ? ` (${snv.rnaAltad}/${snv.rnaDepth})`
                    : ''}
                  {!(snv.rnaImpact === undefined || snv.rnaImpact === null)
                    ? ` ${snv.rnaImpact}`
                    : ''}
                </CustomTypography>
              </Box>
            </Grid>
          </Grid>
        </StickySection>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">Helium Score</CustomTypography>
            <Grid container direction="row" alignItems="center" wrap="nowrap">
              <ScoreChip
                min={summary.min}
                mid={summary.min}
                max={summary.max}
                value={snv.heliumScore}
                isLOH={false}
              />
              { (snv.inGermline) && (
              <Tooltip
                placement="bottom"
                title="Variant is found in Germline SNV"
              >
                <span>
                  <Dna
                    style={{
                      marginLeft: '8px',
                    }}
                  />
                </span>
              </Tooltip>
              )}
            </Grid>
            <CustomTypography variant="bodyRegular">
              VAF:
              {' '}
              {dnaVaf ? (
                <>
                  {toFixed(dnaVaf, 2)}
                  {' '}
                  (
                  {`${snv.altad} / ${snv.depth}`}
                  )
                </>
              ) : null}
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              VAR CN:
              {' '}
              {!(
                snv.adjustedCopyNumber === undefined
                || snv.adjustedCopyNumber === null
              ) ? (
                <>{toFixed(snv.adjustedCopyNumber, 2)}</>
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
              {' '}
              {snv.platforms}
            </CustomTypography>
            <CustomTypography variant="bodyRegular" truncate>
              LOH:
              {' '}
              { snv.loh
                ? (
                  `${snv.loh}`
                ) : 'No'}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%" width="100%">
            <CustomTypography variant="label">
              Frequency
            </CustomTypography>
            <Grid container direction="column" gap="8px">
              <FrequencyChip
                tabName="snv"
                label="Somatic"
                counts={snv.counts || []}
                getRows={(page, limit) => getSeenInRows(false, page, limit)}
                modalTitle={modalTitle}
              />
              {snv.inGermline && (
                <FrequencyChip
                  tabName="snv"
                  label="In Germline"
                  counts={snv.germlineCounts || []}
                  getRows={(page, limit) => getSeenInRows(true, page, limit)}
                  modalTitle={modalTitle}
                />
              )}
            </Grid>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">CLASSIFICATION</CustomTypography>
            {snv.classification && (
              <ClassificationChip
                classification={snv.classification ? getClassificationDisplayValue(snv.classification) : ''}
                reportable={snv.reportable || false}
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
      {modalOpen && tumourBiosample && (
        <ExpandedModal
          open={modalOpen}
          variantId={snv.variantId}
          variantType="SNV"
          biosampleId={tumourBiosample.biosampleId}
          variantGenes={[
            {
              geneId: snv.geneId,
              gene: snv.gene,
            },
          ]}
          handleClose={handleCloseModal}
          variant={snv}
          handleUpdateVariant={handleUpdateVariant}
          curationDataComponent={(
            <SNVModalContent
              heliumSummary={summary}
              handleUpdateData={handleUpdateVariant}
              snv={snv}
            />
          )}
          params={{
            cosmic: cosmicLink,
            clinvar: handleParam(),
            gnomad: `/gene/${handleParam()}`,
            oncokb: `/gene/${handleParam()}`,
            pecan: `/proteinpaint/${handleParam()}`,
            varSom: `${getVarsomPath(snv?.hgvs, 'somatic')}`,
            civic: { gene: snv.gene, variant: snv.hgvs },
            geneCard: snv.gene,
            genome: `?block=1&genome=hg19&position=chr${snv.chr}:${
              snv.pos - 1
            }-${snv.pos}`,
            geneIds: [
              {
                name: snv.gene,
                value: snv.geneId,
              },
            ],
          }}
          title="HGVS"
          titleContent={snv.hgvs}
          titleIcon={icon}
        />
      )}
    </>
  );
}
