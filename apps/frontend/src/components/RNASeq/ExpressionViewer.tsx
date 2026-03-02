import {
  useEffect,
  useRef,
  useMemo,
  type JSX,
} from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  ITPMData,
} from '@/types/RNAseq.types';
import { loadCanvasXpress, type ICanvasXpressInstance } from '@/utils/canvasExpress/loadCanvasExpress';
import { createConfig, createGraphData } from '@/utils/functions/expressionViewer';

const useStyles = makeStyles(() => ({
  wrapper: {
    backgroundColor: '#FFFFFF',
  },
}));

interface IExpressionViewerProps {
  data: ITPMData[],
  rnaSeqId: string,
  gene: string,
  selectedSubcat2: string | undefined,
  selectedCategory: string | undefined,
  showCategory: boolean,
}

export default function ExpressionViewer({
  data,
  rnaSeqId,
  gene,
  selectedSubcat2,
  selectedCategory,
  showCategory,
}: IExpressionViewerProps): JSX.Element {
  const classes = useStyles();

  const graph = useRef<ICanvasXpressInstance | null>(null);

  const graphData = useMemo(
    () => createGraphData(data, rnaSeqId, gene, selectedSubcat2, selectedCategory, showCategory),
    [data, rnaSeqId, gene, selectedSubcat2, selectedCategory, showCategory],
  );

  const config = useMemo(
    () => createConfig(graphData, rnaSeqId),
    [graphData, rnaSeqId],
  );

  useEffect(() => {
    let mounted = true;
    const events = {
      mousemove(o, e, t): void {
        if (o && o.objectType && o.objectType === 'Property') {
          t.showInfoSpan(e, o.display);
        } else if (o && o.y && o.objectType !== 'Smp') {
          const str = `<b>${o.y.smps}</b><br>
            <b>Patient ID: </b>${o.y.patientId}<br>
            <b>TPM Value: </b>${o.y.data}<br>
            <b>Mean Z-Score: </b>${o.y.zscore}<br>
            <b>ZERO2 Category: </b>${o.y.category}<br>
            <b>ZERO2 Subcategory2: </b>${o.y.subcat2}<br>
             <b>ZERO2 Final Diagnosis: </b>${o.y.finalDiagnosis}<br>
            <b>Event: </b>${o.y.event}<br>
          `;
          t.showInfoSpan(e, str);
        }
      },
    };

    let timer: NodeJS.Timeout | undefined;

    if (!graph.current) {
      const canvasId = `${rnaSeqId}_${gene}`;
      timer = setTimeout(() => {
        if (!mounted || !graphData || !config) {
          return;
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        loadCanvasXpress().then((CanvasXpress) => {
          if (!mounted) {
            return;
          }

          const canvasEl = document.getElementById(canvasId) as HTMLCanvasElement | null;
          // Double-check canvas exists and is connected before initializing
          if (!canvasEl || !canvasEl.isConnected || canvasEl.tagName !== 'CANVAS') {
            return;
          }

          try {
            graph.current = new CanvasXpress(canvasId, graphData.graph, config, events);
          } catch (initErr) {
            // Silently ignore errors if component is unmounting or canvas was removed
            if (mounted) {
              // Check if canvas still exists - if not, this is expected during unmount
              const stillExists = document.getElementById(canvasId)?.isConnected;
              if (stillExists) {
                console.error('Error initializing CanvasXpress:', initErr);
              }
            }
          }
        }).catch((loadErr) => {
          if (mounted) {
            console.error('Error loading CanvasXpress:', loadErr);
          }
        });
      }, 100);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      mounted = false;
      if (graph.current) {
        try {
          // Check if canvas element still exists before destroying
          const canvasId = `${rnaSeqId}_${gene}`;
          const canvasEl = document.getElementById(canvasId);
          // Only try to destroy if canvas is still in the DOM
          if (canvasEl?.isConnected && typeof graph.current.destroy === 'function') {
            graph.current.destroy();
          }
        } catch {
          // Silently ignore errors during cleanup - this is expected when component unmounts
          // and the canvas element is removed from DOM before cleanup runs
        } finally {
          graph.current = null;
        }
      }
    };
  }, [config, gene, graphData, rnaSeqId]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className={classes.wrapper}
    >
      <canvas id={`${rnaSeqId}_${gene}`} width={window.innerWidth * 0.5} height={window.innerHeight * 0.7} />
    </Box>
  );
}
