import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';

import {
  Box,
  Grid,
  IconButton,
  Paper as MuiPaper,
  styled,
} from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';
import { Dna, Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';

import {
  ClassificationChip,
  PrismChip,
  TargetableChip,
} from '../Chips';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import CNVModalLeft from './CNVModalLeft';

import { cnvCNTypeOptions } from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import { ICNVSummary, ISomaticCNV, IUpdateCNVBody } from '../../types/CNV.types';
import { ReportType } from '../../types/Reports/Reports.types';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { toFixed } from '../../utils/math/toFixed';
import { getClassificationDisplayValue } from '../../utils/misc';
import { inXSamplesText } from '../../utils/misc/strings';
import { ScoreChip } from '../Chips/ScoreChip';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';

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
  avgCopy: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
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
}));

interface IProps {
  data: ISomaticCNV;
  updateCNV?: (cnv: ISomaticCNV) => void;
  joined?: boolean;
  summary?: ICNVSummary;
  setRefresh?: Dispatch<SetStateAction<boolean>>;
}

export default function CNVListItem({
  data,
  updateCNV,
  joined,
  summary,
  setRefresh,
}: IProps): JSX.Element {
  const classes = useStyles({ joined });
  const zeroDashSdk = useZeroDashSdk();
  const { tumourBiosample } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();
  const { somaticGeneList } = useCuration();

  const [expand, setExpand] = useState(false);

  const {
    variantId,
    pathclass,
    chromosome,
    geneId,
    gene: cnvGene,
    cytoband,
    minCn,
    maxCn,
    minMinorAlleleCn,
    averageCN,
    cnType,
    rnaZScore,
    rnaTpm,
    rnaMedianTpm,
    prism,
    platform,
    classification,
    reportable,
    targetable,
    reportedCount,
    targetableCount,
  } = data;

  const handleModalOpen = (): void => {
    setExpand(true);
  };

  const handleModalClose = (): void => {
    setExpand(false);
    if (setRefresh) setRefresh(true);
  };

  const handleUpdateCNV = async (
    body: IUpdateCNVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (tumourBiosample?.biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, data.reportable),
        };
        await zeroDashSdk.cnv.somatic.updateCnvRecordById(
          tumourBiosample.biosampleId,
          variantId,
          newBody,
        );
        if (updateCNV) {
          updateCNV({
            ...data,
            ...newBody,
          });
        }

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, data.reportable),
            defaultValue: reports,
            gene: cnvGene,
            geneList: somaticGeneList,
          });
        }
        return newReports;
      } catch {
        enqueueSnackbar('Cannot update CNV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

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
              <ConsequencePathclassIcon
                pathclass={pathclass}
              />
            </Box>
          </Grid>
          <Grid direction="column" container flex={7}>
            <CustomTypography variant="label">GENE</CustomTypography>
            <CustomTypography
              variant="titleRegular"
              fontWeight="medium"
              className={classes.title}
            >
              {cnvGene}
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              <CustomTypography display="inline" className={classes.label}>
                Chromosome:
                &nbsp;
              </CustomTypography>
              {chromosome}
              <br />
              <CustomTypography display="inline" className={classes.label}>
                Cytoband:
                &nbsp;
              </CustomTypography>
              {cytoband}
            </CustomTypography>
          </Grid>
        </Grid>
      </StickySection>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            COPY NUMBER
          </CustomTypography>
          <Box className={classes.avgCopy}>
            {summary?.copyNumber.min !== undefined
              && summary?.copyNumber.max !== undefined
              && averageCN !== undefined && (
                <ScoreChip
                  min={0}
                  max={10}
                  mid={2}
                  value={Number(toFixed(averageCN, 2))}
                  label={minCn === maxCn
                    ? `${toFixed(averageCN, 2)}`
                    : `${toFixed(minCn, 2)} - ${toFixed(maxCn, 2)}`}
                />
            )}
            { (cnType?.toUpperCase()?.startsWith('GERMLINE')) && (
              <CustomTypography
                truncate
                tooltipText="Variant is found in Germline CNV"
                style={{
                  height: '28px',
                  overflow: 'visible',
                }}
              >
                <Dna
                  style={{
                    marginLeft: '8px',
                  }}
                />
              </CustomTypography>
            )}
          </Box>
          { cnType && cnType !== 'NEU' && (
            <CustomTypography
              variant="bodyRegular"
              style={{ color: '#022034', maxWidth: '75%' }}
              truncate
            >
              {`CN Type: ${cnvCNTypeOptions.find((o) => o.value === cnType)?.name}`}
            </CustomTypography>
          )}
          <CustomTypography
            variant="bodyRegular"
            style={{ color: '#022034', maxWidth: '75%' }}
          >
            {`LOH: ${
              minMinorAlleleCn !== null
              && minMinorAlleleCn < 0.5
              && !['X', 'Y'].includes(chromosome.replace('chr', '').toUpperCase())
                ? 'Yes'
                : 'No'
            }`}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            Helium Score
          </CustomTypography>
          <ScoreChip
            min={0}
            mid={0}
            max={1}
            value={data.heliumScore ?? 0}
            isLOH={false}
          />
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            RNA Z-SCORE
          </CustomTypography>
          {summary?.zScore.max && summary?.zScore.min && rnaZScore && (
            <ScoreChip
              min={Number(toFixed(summary.zScore.min, 2))}
              max={Number(toFixed(summary.zScore.max, 2))}
              mid={0}
              value={Number(toFixed(rnaZScore, 2))}
            />
          )}
          <CustomTypography variant="bodyRegular">
            RNA TPM:
            &nbsp;
            {rnaTpm}
            <br />
            Median:
            &nbsp;
            {rnaMedianTpm}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            Gene List
          </CustomTypography>
          <PrismChip label={prism || 'N/A'} />
          <CustomTypography
            variant="bodyRegular"
            style={{ color: '#1A1A1A' }}
          >
            &nbsp;
            {`Platform: ${platform}`}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">CLASSIFICATION</CustomTypography>
          {classification && (
            <ClassificationChip
              classification={getClassificationDisplayValue(classification)}
              reportable={reportable}
            />
          )}
          <CustomTypography variant="bodySmall">
            {inXSamplesText(reportedCount)}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">TARGETABLE</CustomTypography>
          {targetable !== null && (
            <TargetableChip
              targetable={targetable ? 'Yes' : 'No'}
            />
          )}
          <CustomTypography variant="bodySmall">
            {inXSamplesText(targetableCount)}
          </CustomTypography>
        </Grid>
      </Item>
      {expand && tumourBiosample && (
        <ExpandedModal
          open={expand}
          variantId={data.geneId}
          variantType="CNV"
          biosampleId={tumourBiosample.biosampleId}
          variantGenes={[{
            geneId: data.geneId,
            gene: data.gene,
          }]}
          params={{
            cosmic: `/gene/analysis?ln=${data.gene}`,
            clinvar: data.gene,
            gnomad: `/gene/${data.gene}`,
            oncokb: `/gene/${data?.gene}`,
            pecan: `/proteinpaint/${data?.gene}`,
            varSom: `/gene/${data?.gene}`,
            civic: { gene: data.gene, variant: 'EXPRESSION' },
            geneCard: cnvGene,
            geneIds: [
              {
                name: cnvGene,
                value: geneId,
              },
            ],
          }}
          handleClose={handleModalClose}
          title="GENE"
          titleContent={cnvGene}
          titleIcon={(
            <ConsequencePathclassIcon
              pathclass={pathclass}
            />
          )}
          variant={data}
          handleUpdateVariant={handleUpdateCNV}
          curationDataComponent={(
            <CNVModalLeft
              cnv={data}
              handleUpdateData={handleUpdateCNV}
              summary={summary}
            />
          )}
        />
      )}
    </Paper>
  );
}
