import { Box, Grid } from '@mui/material';
import {
  createStyles,
  makeStyles,
} from '@mui/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { pdfjs } from 'react-pdf';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { getCurationSVGenes } from '@/utils/functions/getSVGenes';
import {
  Confidence,
  Inframe,
  PathClass,
  Platforms,
} from '../../types/Common.types';
import { DisruptedTypes, IUpdateSVBody, SVVariants } from '../../types/SV.types';
import { PrismChip } from '../Chips';
import CustomTypography from '../Common/Typography';

import {
  inframeOptions, platformOptions, svDisruptionOptions, yesNoOptions,
} from '../../constants/options';
import { ReportType } from '../../types/Reports/Reports.types';
import { toFixed } from '../../utils/math/toFixed';
import LoadingAnimation from '../Animations/LoadingAnimation';
import { ScoreChip } from '../Chips/ScoreChip';
import DataPanel from '../Common/DataPanel';
import ImageThumbnail from '../Common/ImageThumbnail';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { PathClassSelector } from '../PathClassSelector/PathClassSelector';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import InframeTooltip from '../Tooltip/InframeTooltip';
import ChildSVHeader from './ChildSVHeader';
import ChildSVModalListItem from './ChildSVModalListItem';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

const useStyles = makeStyles(() => createStyles({
  root: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  section: {
    marginTop: 6,
    marginBottom: 6,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
  hairline: {
    border: 'none',
    borderTop: '1px solid #D0D9E2',
    width: '100%',
    margin: 0,
  },
  borderNone: {

    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  candidateDisrupted: {
    paddingTop: '8px',
  },
  childSVsToggleBar: {
    width: '100%',
    padding: '6px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: corePalette.grey30,
  },
}));

interface IProps<T extends SVVariants> {
  data: T;
  handleUpdateSV: (body: IUpdateSVBody, reports?: ReportType[]) => Promise<ReportType[]>;
  handleSetDefaultSV: (promotedSV: T) => Promise<void>;
  minScore?: number;
  maxScore?: number;
}

export default function SVsModal<T extends SVVariants>({
  data,
  handleUpdateSV,
  handleSetDefaultSV,
  minScore,
  maxScore,
}: IProps<T>): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { rnaBiosample } = useAnalysisSet();
  const {
    pathclass,
    svType,
    startAf,
    endAf,
    startGeneExons,
    endGeneExons,
    startFusion,
    endFusion,
    prismclass,
    posBkpt1,
    posBkpt2,
    chrBkpt1,
    chrBkpt2,
    platforms,
    inframe,
    rnaconf,
    wgsconf,
    pathscore,
    markDisrupted,
    predictedDisrupted,
    researchCandidate: initialRCandidate,
  } = data ?? {};

  const classes = useStyles({ pathclass });
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: data?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const { enqueueSnackbar } = useSnackbar();

  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(initialRCandidate),
  );
  const [plotUrl, setPlotUrl] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const isNotDisruption = data.svType !== 'DISRUPTION';

  useEffect(() => {
    const convertPdfBlobToImage = async (blob: Blob): Promise<string> => {
      const blobUrl = URL.createObjectURL(blob);
      const pdf = await pdfjs.getDocument(blobUrl).promise;
      const page = await pdf.getPage(1); // We only care about the first pdf page
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Could not get canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        canvas,
        viewport,
      }).promise;

      URL.revokeObjectURL(blobUrl);
      return canvas.toDataURL('image/png');
    };

    const fetchPlot = async (): Promise<void> => {
      if (!rnaBiosample?.biosampleId || !data?.startGene?.gene || !data?.endGene?.gene) return;
      try {
        const plot = await zeroDashSdk.plots.getFusionPlot(
          rnaBiosample.biosampleId,
          data.startGene.gene,
          data.endGene.gene,
        );
        if (plot.fileId) {
          setLoading(true);
          // need to from ft and transform it because can't access it from url due to CORS
          const blob = await zeroDashSdk.filetracker.downloadFile(plot.fileId);
          const imageUrl = await convertPdfBlobToImage(blob);
          setPlotUrl(imageUrl);
          setLoading(false);
        }
      } catch {
        enqueueSnackbar('Could not load Arriba fusion plot.', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchPlot();
  }, [
    zeroDashSdk.plots,
    zeroDashSdk.filetracker,
    rnaBiosample?.biosampleId,
    data.startGene.gene,
    data.endGene.gene,
    enqueueSnackbar,
  ]);

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        style={{ marginBottom: 6 }}
        spacing={2}
      >
        <Grid size={{ xs: 11, lg: isNotDisruption ? 4 : 6 }} className={classes.panel}>
          <DataPanel
            label="CLASS"
            value={(
              <PathClassSelector
                biosampleId={data.biosampleId}
                currentPathClass={pathclass}
                updatePathClass={(newPathclass: PathClass): void => {
                  handleUpdateSV({ pathclass: newPathclass });
                }}
              />
            )}
          />
        </Grid>
        { isNotDisruption
          ? (
            <Grid size={{ xs: 11, lg: 4 }} className={classes.panel}>
              <DataPanel
                label="MARK AS DISRUPTION"
                value={(
                  <div>
                    <AutoWidthSelect
                      key="sv-disrupted-select-label"
                      options={
                        data.startGene.gene === data.endGene.gene
                          ? svDisruptionOptions.filter((option) => !option.name.toLowerCase().includes('gene'))
                          : svDisruptionOptions.filter((option) => option.value !== 'Yes')
                        }
                      overrideReadonlyMode={!canEditAssigned}
                      defaultValue={markDisrupted}
                      variant="outlined"
                      onChange={(event): void => {
                        handleUpdateSV({ markDisrupted: event.target.value as DisruptedTypes });
                      }}
                    />
                  </div>
                )}
              />
            </Grid>
          )
          : ''}
        <Grid size={{ xs: 11, lg: isNotDisruption ? 4 : 6 }} className={classes.panel}>
          <DataPanel
            label="Research candidate"
            value={(
              <AutoWidthSelect
                options={yesNoOptions}
                overrideReadonlyMode={!canEditAllCurators}
                onChange={(event): void => {
                  setResearchCandidate(event.target.value as string);
                  handleUpdateSV({ researchCandidate: strToBool(event.target.value as string) });
                }}
                defaultValue={boolToStr(data.researchCandidate)}
                value={researchCandidate}
              />
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 4 }} className={classes.panel}>
          <DataPanel
            label="Gene"
            value={getCurationSVGenes(data)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 8, md: 4 }} className={classes.panel}>
          <DataPanel
            label="TYPE"
            value={svType}
          />
        </Grid>

        { data.svType !== 'DISRUPTION'
          ? (
            <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
              <DataPanel
                label="DISRUPTED"
                value={predictedDisrupted || 'Unknown'}
              />
            </Grid>
          )
          : ''}
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className={classes.panel}>
          <DataPanel
            label="BREAKPOINT 1"
            value={`${chrBkpt1}:${posBkpt1}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
          <DataPanel
            label="BREAKPOINT 2"
            value={`${chrBkpt2}:${posBkpt2}`}
          />
        </Grid>
      </Grid>
      {svType !== 'DISRUPTION' && (
        <>
          <hr className={classes.hairline} />
          <Grid
            container
            alignItems="flex-start"
            className={classes.section}
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4 }} className={classes.panel}>
              <DataPanel
                label="START VAF"
                value={startAf ? toFixed(startAf, 2) : null}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
              <DataPanel
                label="END VAF"
                value={endAf ? toFixed(endAf, 2) : null}
              />
            </Grid>
          </Grid>
        </>
      )}
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className={classes.panel}>
          <DataPanel
            label="SOMATIC SCORE"
            value={(
              <ScoreChip
                min={minScore ?? 0}
                max={maxScore ?? 0}
                mid={minScore ?? 0}
                value={pathscore}
                isLOH={false}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
          <DataPanel
            label="Ploidy"
            value={toFixed(data.ploidy ?? 0, 2)}
          />
        </Grid>
      </Grid>

      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className={classes.panel}>
          <DataPanel
            label="GENE EXONS"
            value={`${svType !== 'DISRUPTION' ? 'Start: ' : ''}${startGeneExons}`}
          />
          {svType !== 'DISRUPTION' && (
            <DataPanel
              value={`End: ${endGeneExons} `}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
          <DataPanel
            label="FUSION"
            value={startFusion?.replace(':ExonNone', '')}
          />
          {svType !== 'DISRUPTION' && (
            <DataPanel
              value={endFusion?.replace(':ExonNone', '')}
            />
          )}
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className={classes.panel}>
          <DataPanel
            label="WGS CONFIDENCE"
            value={wgsconf?.toUpperCase()}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
          <DataPanel
            label="RNA CONFIDENCE"
            value={(
              <div>
                <AutoWidthSelect
                  key="sv-rna-select-label"
                  options={[
                    { value: 'None', name: 'None' },
                    { value: 'High', name: 'High' },
                    { value: 'Med', name: 'Med' },
                    { value: 'Low', name: 'Low' },
                  ]}
                  overrideReadonlyMode={!canEditAssigned}
                  defaultValue={rnaconf}
                  onChange={(event): void => {
                    handleUpdateSV({ rnaconf: event.target.value as Confidence });
                  }}
                />
              </div>
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid
          size={{
            xs: 12, sm: 6, md: 4, lg: 4,
          }}
          className={classes.panel}
        >
          <DataPanel
            label="Gene List"
            value={<PrismChip label={prismclass || 'N/A'} />}
          />
        </Grid>
        <Grid
          size={{
            xs: 12, sm: 6, md: 8, lg: 4,
          }}
          className={classes.panel}
        >
          <DataPanel
            label="PLATFORM"
            value={(
              <div>
                <AutoWidthSelect
                  key="sv-platforms-select-label"
                  options={
                    platformOptions.map((p) => ({ value: p, name: p }))
                  }
                  overrideReadonlyMode={!canEditAssigned}
                  defaultValue={platforms}
                  variant="outlined"
                  onChange={(event): void => {
                    handleUpdateSV({ platforms: event.target.value as Platforms });
                  }}
                />
              </div>
            )}
          />
        </Grid>
        <Grid
          size={{
            xs: 12, sm: 6, md: 8, lg: 4,
          }}
          className={classes.panel}
        >
          <DataPanel
            label="IN FRAME"
            value={(
              <div>
                <AutoWidthSelect
                  key="sv-inframe-select"
                  options={
                    inframeOptions.map((p) => ({
                      value: p,
                      name: p,
                      tooltip: p !== 'No' && p !== 'Unknown' && p !== 'N/A' && (
                        <InframeTooltip inframe={p as Inframe} />
                      ),
                    }))
                  }
                  overrideReadonlyMode={!canEditAssigned}
                  defaultValue={inframe === null ? 'Unknown' : inframe}
                  variant="outlined"
                  onChange={(event): void => {
                    handleUpdateSV({ inframe: event.target.value as Inframe });
                  }}
                />
              </div>
            )}
          />
        </Grid>
      </Grid>
      {loading && !plotUrl && (
        <>
          <hr className={classes.hairline} />
          <Grid
            container
            alignItems="flex-start"
            className={classes.section}
            spacing={2}
            style={{ marginTop: 50 }}
          >
            <Grid size={{ xs: 12 }} className={classes.panel}>
              <LoadingAnimation />
            </Grid>
          </Grid>
        </>
      )}
      {plotUrl && !loading && (
      <>
        <hr className={classes.hairline} />
        <Grid
          container
          alignItems="flex-start"
          className={classes.section}
          spacing={2}
        >
          <Grid size={{ xs: 12 }} className={classes.panel}>
            <DataPanel
              label="Arriba Fusion Plot"
              value={(
                <ImageThumbnail
                  imageUrl={plotUrl}
                  headerTitle="Arriba Fusion Plot"
                />
                )}
            />
          </Grid>
        </Grid>
      </>
      )}
      {(data.childSVs?.length || 0) > 0 && (
        <>
          <hr className={classes.hairline} />
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            marginTop="12px"
          >
            <Box className={classes.childSVsToggleBar}>
              <CustomTypography
                variant="label"
                fontWeight="bold"
              >
                {`Related Structural Variants (${data.childSVs?.length})`}
              </CustomTypography>
            </Box>
            <ScrollableSection style={{ minWidth: '100%' }}>
              <ChildSVHeader isModalHeader />
              {data.childSVs?.map((childSV) => (
                <ChildSVModalListItem
                  key={childSV.internalId}
                  sv={childSV}
                  handleSetDefaultSV={handleSetDefaultSV}
                />
              ))}
            </ScrollableSection>
          </Box>
        </>
      )}

    </>
  );
}
