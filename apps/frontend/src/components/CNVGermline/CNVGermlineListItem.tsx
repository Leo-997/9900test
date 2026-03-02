import { useMemo, useState, type JSX } from 'react';

import {
  Box,
  Grid,
  IconButton,
  Paper as MuiPaper,
  styled,
} from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';
import { Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import {
  ClassificationChip,
  PrismChip,
  TargetableChip,
} from '../Chips';
import CustomTypography from '../Common/Typography';
import CNVGermLineModalLeft from './CNVGermLineModalLeft';

import { IGermlineCNV, IUpdateCNVBody } from '../../types/CNV.types';
import { ISummary } from '../../types/Common.types';

import { toFixed } from '../../utils/math/toFixed';

import { cnvCNTypeOptions } from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ReportType } from '../../types/Reports/Reports.types';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { getClassificationDisplayValue } from '../../utils/misc';
import { inXSamplesText } from '../../utils/misc/strings';
import { ScoreChip } from '../Chips/ScoreChip';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import FrequencyChip from '../Chips/FrequencyChip';
import ExpandedModalTitle from '../ExpandedModal/Components/ExpandedModalTitle';

type Props = {
  cnv: IGermlineCNV;
  joined?: boolean;
  updateCNV?: (cnv: IGermlineCNV) => void;
  summary?: ISummary;
};

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
  paddingRight: '8px',
  width: '20%',
  minWidth: '375px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '200px',
  minWidth: '200px',
}));

const useStyles = makeStyles(() => createStyles({
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
}));

export default function CNVGermlineListItem({
  cnv,
  joined,
  updateCNV,
  summary,
}: Props): JSX.Element {
  const classes = useStyles({ joined });

  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { germlineGeneList } = useCuration();
  const { germlineBiosample, demographics } = useAnalysisSet();

  const [expand, setExpand] = useState(false);

  const handleModalOpen = (): void => {
    setExpand(true);
  };

  const handleModalClose = (): void => {
    setExpand(false);
  };

  const getSeenInRows = useMemo(() => (
    page?: number,
    limit?: number,
  ) => zeroDashSdk.cnv.germline.getSeenInByGeneId(
    cnv.biosampleId,
    cnv.geneId,
    page,
    limit,
  ), [cnv.biosampleId, cnv.geneId, zeroDashSdk.cnv.germline]);

  const handleUpdateCNV = async (
    body: IUpdateCNVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (germlineBiosample?.biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, cnv.reportable),
        };
        await zeroDashSdk.cnv.germline.updateRecordByVariantId(
          newBody,
          germlineBiosample.biosampleId,
          cnv.variantId,
        );
        if (updateCNV) {
          updateCNV({
            ...cnv,
            ...newBody,
          });
        }

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, cnv.reportable),
            defaultValue: reports,
            gene: cnv.gene,
            geneList: germlineGeneList,
            variantType: 'GERMLINE_CNV',
            germlineConsent: demographics,
          });
        }
        return newReports;
      } catch {
        enqueueSnackbar('Cannot update CNV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const icon = (
    <ConsequencePathclassIcon
      pathclass={cnv.pathclass}
      height={54}
      width={54}
    />
  );

  const modalTitle = (
    <ExpandedModalTitle
      title="Gene"
      titleContent={cnv.gene}
      icon={icon}
    />
  );

  return (
    <Paper elevation={0}>
      <StickySection>
        <Grid container height="100%" gap="8px" alignItems="center">
          <Grid flex={1}>
            <IconButton onClick={handleModalOpen}>
              <Maximize2Icon />
            </IconButton>
          </Grid>
          <Grid flex={4}>
            <Box className={classes.geneIcon}>
              {icon}
            </Box>
          </Grid>
          <Grid direction="column" container flex={7}>
            <CustomTypography variant="label">GENE</CustomTypography>
            <CustomTypography
              variant="titleRegular"
              fontWeight="medium"
            >
              {cnv.gene}
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              Chromosome:
              {' '}
              {cnv.chromosome}
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              Cytoband:
              {' '}
              {cnv.cytoband}
            </CustomTypography>
          </Grid>
        </Grid>
      </StickySection>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            COPY NUMBER
          </CustomTypography>
          {summary?.min !== undefined
            && summary?.max !== undefined
            && cnv.averageCN !== undefined && (
            <ScoreChip
              min={0}
              max={10}
              mid={2}
              value={Number(toFixed(cnv.averageCN, 2))}
              label={cnv.minCN === cnv.maxCN
                ? `${toFixed(cnv.averageCN, 2)}`
                : `${toFixed(cnv.minCN, 2)} - ${toFixed(cnv.maxCN, 2)}`}
            />
          )}
          { cnv.cnType && cnv.cnType !== 'NEU' && (
            <CustomTypography
              variant="bodyRegular"
              style={{ color: '#022034' }}
            >
              {`CN Type: ${cnvCNTypeOptions.find((o) => o.value === cnv.cnType)?.name}`}
            </CustomTypography>
          )}
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label" display="block">
            Gene List
          </CustomTypography>
          <PrismChip label={cnv.prism ? cnv.prism : 'N/A'} />
          <CustomTypography
            variant="bodyRegular"
            style={{ color: '#1A1A1A' }}
          >
            {' '}
            {`Platform: ${cnv.platform}`}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label" display="block">
            Frequency
          </CustomTypography>
          <FrequencyChip
            tabName="germline_cnv"
            label="Germline"
            counts={cnv.counts || []}
            getRows={(page, limit) => getSeenInRows(page, limit)}
            modalTitle={modalTitle}
          />
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">CLASSIFICATION</CustomTypography>
          {cnv.classification && (
            <ClassificationChip
              reportable={cnv.reportable}
              classification={getClassificationDisplayValue(cnv.classification)}
            />
          )}
          <CustomTypography variant="bodySmall">
            {inXSamplesText(cnv.reportedCount)}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">TARGETABLE</CustomTypography>
          {cnv.targetable !== null && (
            <TargetableChip
              targetable={cnv.targetable ? 'Yes' : 'No'}
            />
          )}
          <CustomTypography variant="bodySmall">
            {inXSamplesText(cnv.targetableCount)}
          </CustomTypography>
        </Grid>
      </Item>
      {expand && germlineBiosample && (
        <ExpandedModal
          params={{
            cosmic: `/gene/analysis?ln=${cnv.gene}`,
            clinvar: cnv.gene,
            gnomad: `/gene/${cnv.gene}`,
            oncokb: `/gene/${cnv.gene}`,
            pecan: `/proteinpaint/${cnv.gene}`,
            varSom: `/gene/${cnv.gene}`,
            civic: { gene: cnv.gene, variant: 'EXPRESSION' },
            geneCard: cnv.gene,
            geneIds: [
              {
                name: cnv.gene,
                value: cnv.geneId,
              },
            ],
          }} // should provide a valid gene
          open={expand}
          handleClose={handleModalClose}
          title="GENE"
          titleContent={cnv.gene}
          titleIcon={icon}
          variant={cnv}
          handleUpdateVariant={handleUpdateCNV}
          curationDataComponent={(
            <CNVGermLineModalLeft
              data={cnv}
              handleUpdateData={handleUpdateCNV}
              summary={summary}
            />
          )}
          variantType="GERMLINE_CNV"
          variantId={cnv.geneId}
          biosampleId={germlineBiosample.biosampleId}
          variantGenes={[{
            gene: cnv.gene,
            geneId: cnv.geneId,
          }]}
        />
      )}
    </Paper>
  );
}
