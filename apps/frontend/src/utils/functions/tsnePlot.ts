import { tsnePlotConfig } from '@/constants/tsneplot';
import type {
  ITSNEDataPoint,
  IGraphData,
  MarkerDecoration,
  TSNEConfig,
} from '@/types/RNAseq.types';

export const createGraphData = (
  points: ITSNEDataPoint[],
): IGraphData => ({
  y: {
    vars: points.map((item) => item.biosampleId),
    smps: ['V1', 'V2'],
    data: points.map((item) => [item.x, item.y]),
  },
  z: {
    zero2Subcategory2: points.map((item) => item.zero2Subcategory2),
    zero2FinalDiagnosis: points.map((item) => item.zero2FinalDiagnosis),
  },
});

export const createConfig = (
  fieldToUse: string,
  allPoints: ITSNEDataPoint[],
  selectedBiosamples: string[],
): TSNEConfig => {
  const decorations = {
    marker: selectedBiosamples.map((biosampleId): MarkerDecoration | null => {
      const point = allPoints.find((p) => p.biosampleId === biosampleId);
      if (!point) return null;

      return {
        sample: ['V1', 'V2'],
        text: biosampleId,
        variable: biosampleId,
        type: 'line',
        adj: 0.1,
        fontSize: 12,
      };
    }).filter((item): item is MarkerDecoration => !!item),
  };

  if (allPoints.length === 0) {
    return {
      ...tsnePlotConfig,
      showLegend: false,
      xAxis: [],
      yAxis: [],
      showXAxis: false,
      showYAxis: false,
      xAxisShow: false,
      yAxisShow: false,
    };
  }

  return {
    ...tsnePlotConfig,
    colorBy: [fieldToUse] as readonly string[],
    decorations,
  };
};
