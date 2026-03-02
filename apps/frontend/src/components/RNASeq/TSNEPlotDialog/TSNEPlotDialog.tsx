import {
  useEffect,
  useState,
  useMemo,
  useRef,
  type JSX,
} from 'react';
import {
  Box, Dialog,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { ItemSelectLayout } from '@/layouts/FullScreenLayout/ItemSelectLayout';
import { corePalette } from '@/themes/colours';
import { ITSNEData } from '@/types/RNAseq.types';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';
import { TSNEPlotNavBar } from './TSNEPlotNavBar';
import { TSNEAnnotationSelection, ColourMode } from './TSNEAnnotationSelection';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { createConfig, createGraphData } from '@/utils/functions/tsnePlot';
import { loadCanvasXpress, type ICanvasXpressInstance } from '@/utils/canvasExpress/loadCanvasExpress';

const useStyles = makeStyles(() => ({
  wrapper: {
    backgroundColor: corePalette.white,
    justifyContent: 'center',
    alignItems: 'center',
    '& .canvasXpress-info': {
      maxWidth: '100px !important',
      wordWrap: 'break-word !important',
      whiteSpace: 'normal !important',
      lineHeight: '1.4 !important',
    },
  },
}));

interface IProps {
  open: boolean;
  onClose(): void;
}

export default function TSNEPlotDialog({ open, onClose }: IProps): JSX.Element {
  const { rnaBiosample } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();
  const zeroDashSdk = useZeroDashSdk();
  const classes = useStyles();

  const [tsneData, setTSNEData] = useState<ITSNEData[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [selectedBiosamples, setSelectedBiosamples] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [colourMode, setColourMode] = useState<ColourMode>('zero2Subcategory2');

  const graph = useRef<ICanvasXpressInstance | null>(null);

  const fieldToUse = useMemo(
    () => (colourMode === 'zero2Subcategory2' ? 'zero2Subcategory2' : 'zero2FinalDiagnosis'),
    [colourMode],
  );

  const availableBiosamples = useMemo(
    () => tsneData[0]?.data.map((item) => item.biosampleId) || [],
    [tsneData],
  );

  const availableSubcategories = useMemo(() => {
    if (!tsneData[0]?.data.length) return new Set<string>();

    return new Set(
      tsneData[0].data
        .map((item) => item.zero2Subcategory2)
        .filter((value) => value != null),
    );
  }, [tsneData]);

  const availableGroups = useMemo(() => {
    if (!tsneData[0]?.data.length) return new Set<string>();

    return new Set(
      tsneData[0].data
        .map((item) => item[fieldToUse])
        .filter((value) => value != null),
    );
  }, [tsneData, fieldToUse]);

  const filteredPoints = useMemo(() => {
    if (!tsneData[0]?.data.length) return [];

    return tsneData[0].data.filter((item) => {
      const hasSelectedGroup = selectedGroups.has(item[fieldToUse]);
      const hasSelectedSubcategory = selectedSubcategories.has(item.zero2Subcategory2);
      return hasSelectedGroup && hasSelectedSubcategory;
    });
  }, [tsneData, selectedGroups, selectedSubcategories, fieldToUse]);

  const graphData = useMemo(() => {
    if (filteredPoints.length > 0) {
      return createGraphData(filteredPoints);
    }
    return {
      y: {
        vars: [],
        smps: [],
        data: [],
      },
      z: {
        zero2Subcategory2: [],
        zero2FinalDiagnosis: [],
      },
    };
  }, [filteredPoints]);

  const config = useMemo(
    () => createConfig(
      fieldToUse,
      tsneData.length > 0 ? tsneData[0].data : [],
      selectedBiosamples,
    ),
    [fieldToUse, tsneData, selectedBiosamples],
  );

  useEffect(() => {
    async function fetchTSNEData(): Promise<void> {
      if (!rnaBiosample?.biosampleId) return;

      try {
        setLoading(true);
        setError(false);
        const data = await zeroDashSdk.rna.getRNATSNEData(rnaBiosample.biosampleId);

        const validData = data.filter((item) => item.x != null && item.y != null);

        const transformedData: ITSNEData[] = [{
          id: 'tSNE',
          data: validData.map((item) => ({
            x: item.x,
            y: item.y,
            label: item.biosampleId,
            biosampleId: item.biosampleId,
            zero2Subcategory2: item.zero2Subcategory2,
            zero2FinalDiagnosis: item.zero2FinalDiagnosis,
          })).sort((a, b) => b.biosampleId.localeCompare(a.biosampleId)),
        }];

        setTSNEData(transformedData);
      } catch {
        enqueueSnackbar('Failed to load tSNE data. Please try again.', { variant: 'error' });
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTSNEData();
  }, [rnaBiosample?.biosampleId, zeroDashSdk.rna, enqueueSnackbar]);

  useEffect(() => {
    if (availableGroups.size > 0) {
      setSelectedGroups(availableGroups);
    }
  }, [availableGroups]);

  useEffect(() => {
    if (availableSubcategories.size > 0) {
      setSelectedSubcategories(availableSubcategories);
    }
  }, [availableSubcategories]);

  useEffect(() => {
    if (rnaBiosample?.biosampleId && availableBiosamples.includes(rnaBiosample.biosampleId)) {
      setSelectedBiosamples([rnaBiosample.biosampleId]);
    }
  }, [rnaBiosample?.biosampleId, availableBiosamples]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    let mounted = true;

    if (open) {
      const events = {
        mousemove(o, e, t): void {
          if (o && o.objectType && o.objectType === 'Property') {
            t.showInfoSpan(e, o.display);
          } else if (o && o.y && o.objectType !== 'Smp') {
            const str = `
              <b>${o.y.vars}</b><br>
              <b>Coorindates </b>${o.y.data[0]}<br>
              <b>ZERO2 Subcategory 2: </b>${o.z.zero2Subcategory2}<br>
              <b>ZERO2 Final Diagnosis: </b>${o.z.zero2FinalDiagnosis}<br>
            `;
            t.showInfoSpan(e, str);
          }
        },
      };

      timer = setTimeout(() => {
        if (!mounted || !open || !graphData || !config) {
          return;
        }

        if (!graph.current) {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          loadCanvasXpress().then((CanvasXpress) => {
            if (!mounted || !open) {
              return;
            }

            const canvasEl = document.getElementById('tsne-plot') as HTMLCanvasElement | null;
            // Double-check canvas exists and is connected before initializing
            if (!canvasEl || !canvasEl.isConnected || canvasEl.tagName !== 'CANVAS') {
              return;
            }

            try {
              graph.current = new CanvasXpress('tsne-plot', graphData, config, events);
            } catch (initErr) {
              // Silently ignore errors if component is unmounting or canvas was removed
              if (mounted && open) {
                // Check if canvas still exists - if not, this is expected during unmount
                const stillExists = document.getElementById('tsne-plot')?.isConnected;
                if (stillExists) {
                  console.error('Error initializing CanvasXpress:', initErr);
                  enqueueSnackbar('An error occurred during t-SNE plot initialization.', { variant: 'error' });
                }
              }
            }
          }).catch((loadErr) => {
            if (mounted && open) {
              console.error('Error loading CanvasXpress:', loadErr);
              enqueueSnackbar('An error occurred while loading CanvasXpress.', { variant: 'error' });
            }
          });
        } else {
          try {
            graph.current.updateData?.(graphData);
            graph.current.updateConfig?.(config);
          } catch (updateErr) {
            if (mounted && open) {
              console.error('Error updating CanvasXpress:', updateErr);
            }
          }
        }
      }, 100);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      mounted = false;
    };
  }, [
    open,
    graphData,
    config,
    enqueueSnackbar,
  ]);

  useEffect(() => {
    if (!open && graph.current) {
      // Clean up graph when dialog closes
      try {
        // Check if canvas element still exists before destroying
        const canvasEl = document.getElementById('tsne-plot');
        // Only try to destroy if canvas is still in the DOM
        if (canvasEl?.isConnected && typeof graph.current.destroy === 'function') {
          graph.current.destroy();
        }
      } catch {
        // Silently ignore errors during cleanup - this is expected when dialog closes
        // and the canvas element is removed from DOM before cleanup runs
      } finally {
        graph.current = null;
      }
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      fullScreen
      PaperProps={{
        sx: {
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
        },
      }}
    >
      <ItemSelectLayout
        navBar={<TSNEPlotNavBar handleClose={onClose} />}
        mainContent={(
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="flex-start"
            sx={{
              background: corePalette.white,
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {loading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                width="100%"
              >
                <LoadingAnimation />
              </Box>
            )}
            {error && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                Error loading tSNE data.
              </Box>
            )}
            {!loading && !error && (
            <ScrollableSection
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                className={classes.wrapper}
                sx={{
                  width: '100%',
                  minHeight: '500px',
                  padding: '20px',
                }}
              >
                <canvas
                  id="tsne-plot"
                  width={window.innerWidth * 0.75}
                  height={window.innerHeight * 0.85}
                />
              </Box>
            </ScrollableSection>
            )}
          </Box>
        )}
        leftPaneNodes={(
          <TSNEAnnotationSelection
            availableBiosamples={availableBiosamples}
            selectedBiosamples={selectedBiosamples}
            onBiosamplesChange={setSelectedBiosamples}
            colourMode={colourMode}
            onColourModeChange={setColourMode}
            availableSubcategories={availableSubcategories}
            selectedSubcategories={selectedSubcategories}
            onSubcategoriesChange={setSelectedSubcategories}
          />
        )}
      />
    </Dialog>
  );
}
