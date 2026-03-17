import { useEffect, useState, type JSX } from 'react';

import {
  Box,
  Grid,
  IconButton,
  Paper as MuiPaper,
  styled
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ImageIcon, Maximize2Icon, MaximizeIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { corePalette } from '@/themes/colours';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { toFixed } from '../../utils/math/toFixed';
import {
  ClassificationChip, TargetableChip,
} from '../Chips';
import CustomTypography from '../Common/Typography';
import ColumnHeading from '../CurationCards/Common/ColumnHeading';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import RNASeqModalLeft from './RNASeqModalLeft';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ISummary } from '../../types/Common.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { ISomaticRna, IUpdateRnaSeqBody } from '../../types/RNAseq.types';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { getClassificationDisplayValue } from '../../utils/misc';
import { inXSamplesText } from '../../utils/misc/strings';
import { ScoreChip } from '../Chips/ScoreChip';
import CustomChip from '../Common/Chip';
import GeneExpressionIcon from '../CustomIcons/GeneExpressionIcon';
import { TPMPlotDialog } from './TMPPlotDialog/TPMPlotDialog';

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
  minWidth: '500px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '200px',
  minWidth: '200px',
}));

const ItemSmall = styled(Item)(() => ({
  width: '150px',
  minWidth: '150px',
}));

const Column = styled(Grid)(() => ({
  gap: '8px',
  display: 'flex',
  flexDirection: 'column',
}));

const ExpandImage = styled(IconButton)(() => ({
  position: 'absolute',
  top: 0,
  right: 0,
  fontSize: 18,
  padding: '5px',
}));

const MissingImage = styled(ImageIcon)(({ theme }) => ({
  transform: 'translate(-50%, -50%)',
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '40px',
  height: '40px',
  color: theme.colours.core.grey100,
}));

// RNASeqCard bar styling
const useStyles = makeStyles(() => ({
  expandIcon: {
    width: '24px',
    height: '24px',
  },
  plot: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  plotStyle: {
    height: '142px',
    width: '120px',
    left: '0px',
    top: '0px',
    display: 'block',
    borderRadius: '4px',
    border: `1px solid ${corePalette.grey50}`,
    background: corePalette.grey30,
  },
  gene: {
    textTransform: 'uppercase',
    justifyContent: 'center',
  },
}));

interface IRNASeqCardProps {
  rnaSummary: ISummary;
  rna: ISomaticRna;
  joined?: boolean;
  updateRNA?: (rna: ISomaticRna) => void;
  plotsShown: boolean;
}

function formatQValue(q: string): number | string {
  const num = parseFloat(q);
  if (Number.isNaN(num)) return '-';

  if (Math.abs(num) < 1e-3 || Math.abs(num) >= 1e4) {
    return num.toPrecision(3);
  }

  return +num.toPrecision(3);
}

// Search bar component definition
export default function RNASeqCard({
  rna,
  joined,
  updateRNA,
  rnaSummary,
  plotsShown,
}: IRNASeqCardProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { rnaBiosample, analysisSet } = useAnalysisSet();

  const classes = useStyles({ joined });
  const [plotOpen, setPlotOpen] = useState(false);
  const [expand, setExpand] = useState(false);
  const [plot, setPlot] = useState<string>();
  const [uploadStatus, setUploadStatus] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const [geneExpression, setGeneExpression] = useState<string | null>(rna.geneExpression);

  // useEffect to get the gene for the name and the gene plot
  useEffect(() => {
    async function getGenePlot(): Promise<void> {
      if (rna.geneId && rnaBiosample?.biosampleId) {
        try {
          const plotResp = await zeroDashSdk.plots.getRNASeqGenePlot(
            rnaBiosample?.biosampleId,
            rna.geneId,
          );
          setPlot(plotResp);
        } catch {
          setPlot('');
        }
      }
    }

    getGenePlot();
  }, [rna.geneId, rnaBiosample?.biosampleId, zeroDashSdk.plots]);

  const handleGraphUpload = async (file: File): Promise<void> => {
    if (rna.geneId && rnaBiosample?.biosampleId) {
      try {
        const response = await zeroDashSdk.plots.postRNASeqGenePlot(
          file,
          rnaBiosample.biosampleId,
          rna.geneId,
        );
        setPlot(response.data.plotURL);
        setUploadStatus(true);
        enqueueSnackbar('Successfully uploaded', { variant: 'success' });
      } catch {
        setUploadStatus(false);
        enqueueSnackbar('File upload error', { variant: 'error' });
      }
    }
  };

  const handleUpdateRNA = async (
    body: IUpdateRnaSeqBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (rnaBiosample?.biosampleId) {
      try {
        const newBody: IUpdateRnaSeqBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, rna.reportable),
        };
        await zeroDashSdk.rna.updateRnaSeq(
          newBody,
          rnaBiosample.biosampleId,
          rna.geneId,
        );
        if (updateRNA) {
          updateRNA({
            ...rna,
            ...newBody,
          });
        }

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, rna.reportable),
            defaultValue: reports,
            gene: rna.gene,
            genePanel: analysisSet.genePanel,
            variantType: 'RNA_SEQ',
          });
        }
        return newReports;
      } catch {
        enqueueSnackbar('Cannot update RNA data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const handleModalClose = (): void => {
    setExpand(false);
    setUploadStatus(false);
  };

  return (
    <>
      <Paper elevation={0}>
        <StickySection>
          <Grid container height="100%" gap="8px" alignItems="center">
            <Grid flex={1}>
              {/* Expand icon */}
              <IconButton
                aria-label="Expand RnaSeq"
                onClick={(): void => setExpand(true)}
              >
                <Maximize2Icon />
              </IconButton>
            </Grid>
            <Grid flex={2}>
              {/* Category Icon */}
              <GeneExpressionIcon expression={geneExpression} />
            </Grid>
            {plotsShown && (
              <Grid flex={4}>
                {/* Plot image */}
                <Grid padding="8px" className={classes.plot}>
                  <div style={{ position: 'relative' }}>
                    {plot ? (
                      <img className={classes.plotStyle} src={plot} alt="" />
                    ) : (
                      <div className={classes.plotStyle}>
                        <MissingImage />
                      </div>
                    )}
                    <ExpandImage
                      onClick={(): void => setPlotOpen(true)}
                    >
                      <MaximizeIcon />
                    </ExpandImage>
                  </div>
                  {plotOpen && (
                    <TPMPlotDialog
                      handleClose={(): void => setPlotOpen(false)}
                      geneName={rna.gene}
                      geneId={rna.geneId}
                      initialImageUrl={plot}
                      handleSave={handleGraphUpload}
                    />
                  )}
                </Grid>
              </Grid>
            )}
            <Grid direction="column" height="100%" container flex={plotsShown ? 5 : 9}>
              {/* Gene Name */}
              <Box
                display="flex"
                flexDirection={plotsShown ? 'column' : 'row'}
                width="100%"
                padding="8px"
                columnGap="32px"
                height="100%"
              >
                <Box display="flex" flexDirection="column" minWidth="100px">
                  <ColumnHeading text="gene" />
                  <CustomTypography className={classes.gene} truncate variant="titleRegular" fontWeight="medium">
                    {rna.gene}
                  </CustomTypography>
                </Box>
                <Box display="flex" flexDirection="column" overflow="hidden">
                  {!plotsShown && (
                    <ColumnHeading text="Position" />
                  )}
                  <CustomTypography variant="bodyRegular">
                    <CustomTypography display="inline" variant="label">
                      Chromosome:
                      &nbsp;
                    </CustomTypography>
                    {rna.chromosome}
                    <br />
                    <CustomTypography display="inline" variant="label">
                      Cytoband:
                      &nbsp;
                    </CustomTypography>
                    {rna.cytoband}
                  </CustomTypography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </StickySection>
        {/* Z Score */}
        <Item>
          <Column>
            <CustomTypography variant="label">
              Mean Z-Score
            </CustomTypography>
            <ScoreChip
              min={parseFloat(toFixed(rnaSummary.min, 2))}
              max={parseFloat(toFixed(rnaSummary.max, 2))}
              mid={0}
              value={
                Number.isNaN(parseFloat(rna.meanZScore))
                  ? undefined
                  : Number(toFixed(parseFloat(rna.meanZScore), 2))
              }
            />
            <CustomTypography variant="bodyRegular">
              Fold Change:
              &nbsp;
              <CustomTypography variant="bodyRegular">
                {
                  Number.isNaN(parseFloat(rna.foldChange))
                    ? '-'
                    : toFixed(parseFloat(rna.foldChange), 2)
                }
              </CustomTypography>
            </CustomTypography>
            {rna.relapseFoldChange && (
            <CustomTypography variant="bodyRegular">
              Paired Fold Change:
              &nbsp;
              <CustomTypography variant="bodyRegular">
                {
                  Number.isNaN(parseFloat(rna.relapseFoldChange))
                    ? '-'
                    : toFixed(parseFloat(rna.relapseFoldChange), 2)
                }
              </CustomTypography>
            </CustomTypography>
            )}
          </Column>
        </Item>
        {/* TPM */}
        <ItemSmall>
          <Column>
            <CustomTypography variant="label">
              TPM
            </CustomTypography>
            <div>
              <CustomChip pill size="medium" backgroundColour={corePalette.grey50} label={rna.patientTPM} />
            </div>
            <CustomTypography variant="bodyRegular">
              Median:
              &nbsp;
              <CustomTypography variant="bodyRegular">
                {
                Number.isNaN(parseFloat(rna.medianTPM))
                  ? '-'
                  : parseFloat(toFixed(parseFloat(rna.medianTPM), 2))
                }
              </CustomTypography>
            </CustomTypography>
            {rna.relapseQValue && (
              <CustomTypography variant="bodyRegular">
                Paired q-value:
                &nbsp;
                <CustomTypography variant="bodyRegular">
                  {formatQValue(rna.relapseQValue)}
                </CustomTypography>
              </CustomTypography>
            )}
          </Column>
        </ItemSmall>
        {/* FPKM */}
        <ItemSmall>
          <Column>
            <CustomTypography variant="label">
              FPKM
            </CustomTypography>
            <div>
              <CustomChip pill size="medium" backgroundColour={corePalette.grey50} label={rna.patientFPKM} />
            </div>
            <CustomTypography variant="bodyRegular">
              Median:
              &nbsp;
              <CustomTypography variant="bodyRegular">
                {
                Number.isNaN(parseFloat(rna.medianFPKM))
                  ? '-'
                  : parseFloat(toFixed(parseFloat(rna.medianFPKM), 2))
              }
              </CustomTypography>
            </CustomTypography>
          </Column>
        </ItemSmall>
        {/* Reportable */}
        <Item>
          <Column>
            <CustomTypography variant="label">
              Classification
            </CustomTypography>
            {rna.classification && (
              <ClassificationChip
                classification={getClassificationDisplayValue(rna.classification)}
                reportable={rna.reportable}
              />
            )}
            <CustomTypography variant="bodyRegular">
              {inXSamplesText(rna.reportedCount)}
            </CustomTypography>
          </Column>
        </Item>
        {/* Targetable */}
        <Item>
          <Column>
            <CustomTypography variant="label">
              Targetable
            </CustomTypography>
            {rna.targetable !== null && (
              <TargetableChip
                targetable={rna.targetable ? 'Yes' : 'No'}
              />
            )}
            <CustomTypography variant="bodyRegular">
              {inXSamplesText(rna.targetableCount)}
            </CustomTypography>
          </Column>
        </Item>
      </Paper>

      {expand && rnaBiosample && (
        <ExpandedModal
          open={expand}
          titleIcon={<GeneExpressionIcon expression={geneExpression} width={60} height={60} />}
          title="GENE"
          titleContent={rna.gene}
          params={{
            cosmic: `/gene/analysis?ln=${rna.gene}`,
            clinvar: rna.gene,
            gnomad: `/gene/${rna.gene}`,
            oncokb: `/gene/${rna.gene}`,
            pecan: `/proteinpaint/${rna.gene}`,
            varSom: `/gene/${rna.gene}`,
            civic: { gene: rna.gene, variant: 'EXPRESSION' },
            geneCard: rna.gene,
            geneIds: [
              {
                name: rna.gene,
                value: rna.geneId,
              },
            ],
          }} // should provide a valid gene
          curationDataComponent={(
            <RNASeqModalLeft
              data={rna}
              rnaSummary={rnaSummary}
              imgUrl={plot}
              uploadStatus={uploadStatus}
              setUploadStatus={setUploadStatus}
              handleGraphUpload={handleGraphUpload}
              handleUpdateData={handleUpdateRNA}
              setGeneExpression={setGeneExpression}
            />
          )}
          variantType="RNA_SEQ"
          variantId={rna.geneId}
          biosampleId={rnaBiosample.biosampleId}
          variantGenes={[{
            gene: rna.gene,
            geneId: rna.geneId,
          }]}
          variant={rna}
          handleUpdateVariant={handleUpdateRNA}
          handleClose={handleModalClose}
        />
      )}
    </>
  );
}
