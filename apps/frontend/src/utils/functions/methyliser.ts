import {
  methyliserViewerConfig,
  poi,
} from '@/constants/methyliser';
import { IMethGeneTable, IGraph } from '@/types/Methylation.types';

export function createGraphData(
  gene: string,
  data: IMethGeneTable[],
): IGraph {
  const graphData = data.map((item) => {
    const probe = poi.find((p) => item.probeId.includes(p)) || 'Unlabelled';
    return { ...item, probe };
  });

  const graph: IGraph = {
    x: {
      gene: Array(graphData.length).fill(gene),
      probeId: graphData.map((item) => item.probeId),
      probeLabel: graphData.map((item) => item.probe),
      relationToIsland: graphData.map((item) => item.relationToIsland),
      regulatoryFeatureGroup: graphData.map((item) => item.regulatoryFeatureGroup),
      replicateProbeSetByName: graphData.map((item) => item.replicateProbeSetByName),
      replicateProbeSetBySeq: graphData.map((item) => item.replicateProbeSetBySeq),
      replicateProbeSetByLoc: graphData.map((item) => item.replicateProbeSetByLoc),
      mValue: graphData.map((item) => item.mValue),
      chr: graphData.map((item) => item.chr),
      start: graphData.map((item) => item.start),
      end: graphData.map((item) => item.end),
    },
    y: {
      data: [graphData.map((item) => item.betaValue)],
      smps: graphData.map((item) => item.probeId),
      vars: ['data'],
    },
  };
  return graph;
}

export function createConfig(
  gene: string,
  methSampleId: string,
): Record<string, unknown> {
  const cutoff = gene === 'MGMT' ? 0.25 : 0.5;
  return {
    ...methyliserViewerConfig,
    decorations: {
      line: [
        {
          align: 'left',
          color: 'red',
          label: `cutoff= ${cutoff}`,
          value: cutoff,
          width: 2,
        },
      ],
    },
    title: `${methSampleId}`,
    saveFilename: `${methSampleId}_${gene}.png`,
  };
}
