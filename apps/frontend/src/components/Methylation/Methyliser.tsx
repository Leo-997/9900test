import {
  useEffect,
  useRef,
  useMemo,
  type JSX,
} from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { IMethGeneTable } from '@/types/Methylation.types';
import { loadCanvasXpress, type ICanvasXpressInstance } from '@/utils/canvasExpress/loadCanvasExpress';
import { createConfig, createGraphData } from '@/utils/functions/methyliser';

const useStyles = makeStyles(() => ({
  wrapper: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface IMethyliserProps {
  data: IMethGeneTable[],
  methSampleId: string,
  gene: string,
}

export default function Methyliser({
  data,
  methSampleId,
  gene,
}: IMethyliserProps): JSX.Element {
  const classes = useStyles();

  const graph = useRef<ICanvasXpressInstance | null>(null);

  const graphData = useMemo(
    () => createGraphData(gene, data),
    [gene, data],
  );

  const config = useMemo(
    () => createConfig(gene, methSampleId),
    [gene, methSampleId],
  );

  useEffect(() => {
    let mounted = true;
    const events = {
      mousemove(o, e, t): void {
        if (o && o.objectType && o.objectType === 'Property') {
          t.showInfoSpan(e, o.display);
        } else if (o && o.y && o.objectType !== 'Smp') {
          let str = `<b>${o.y.smps}</b><br>
            <b>Beta Value: </b>${o.y.data}<br>
            <b>M Value: </b>${o.y.mValue}<br>
            <b>Chr: </b>${o.y.chr}<br>
            <b>Pos: </b>${o.y.start}<br>
            <b>Relation to Island: </b>${o.y.relationToIsland}<br>
            <b>Regulatory Feature Group: </b>${o.y.regulatoryFeatureGroup}<br>`;
          if (o.y.replicateProbeSetByName != null) {
            str += `<b>Replicate Probe Set By Name: </b>${o.y.replicateProbeSetByName}<br>`;
          }
          if (o.y.replicateProbeSetBySeq != null) {
            str += `<b>Replicate Probe Set By Sequence: </b>${o.y.replicateProbeSetBySeq}<br>`;
          }
          if (o.y.replicateProbeSetByLoc != null) {
            str += `<b>Replicate Probe Set By Location: </b>${o.y.replicateProbeSetByLoc}<br>`;
          }
          str += `<b>Probe ID: </b>${o.y.probeId}<br>
          `;
          t.showInfoSpan(e, str);
        }
      },
    };

    let timer: NodeJS.Timeout | undefined;

    if (!graph.current) {
      const canvasId = `${methSampleId}_${gene}`;
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
          if (!canvasEl?.isConnected || canvasEl.tagName !== 'CANVAS') {
            return;
          }

          try {
            // Final check before constructor to prevent race condition
            if (!mounted || !document.getElementById(canvasId)?.isConnected) {
              return;
            }
            graph.current = new CanvasXpress(canvasId, graphData, config, events);
          } catch {
            // Silently ignore initialization errors (expected during unmount)
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
          const canvasId = `${methSampleId}_${gene}`;
          const canvasEl = document.getElementById(canvasId);
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
    };
  }, [config, gene, graphData, methSampleId]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className={classes.wrapper}
    >
      {/* { graphData && config && (
        <CanvasXpressReact
          target={`${methSampleId}_${gene}`}
          data={graphData}
          config={config}
          events={events}
          width={`${window.innerWidth * 0.9}`}
          height={`${window.innerHeight * 0.8}`}
        />
      )} */}
      <canvas id={`${methSampleId}_${gene}`} width={window.innerWidth * 0.9} height={window.innerHeight * 0.8} />
    </Box>
  );
}
