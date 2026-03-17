import { corePalette } from '@/themes/colours';
import * as d3 from 'd3';

export const generateTSNEColors = (groupCount: number): string[] => {
  const baseColors = [
    '#EE1A59', '#990066', '#CC3399', '#CC61B0', '#F9C1F2', '#764E9F',
    '#362A93', '#006699', '#BBDEFF', '#7EF2EB', '#669900', '#99CC33',
    '#CCEE66', '#FFCC00', '#FF9900', '#FF6600',
  ];

  if (groupCount <= baseColors.length) {
    return baseColors.slice(0, groupCount);
  }

  const scale = d3
    .scaleSequential(d3.interpolateRgbBasis(baseColors))
    .domain([0, Math.max(1, groupCount - 1)]);

  return Array.from({ length: groupCount }, (unusedValue, index) => scale(index) || '#bdc3c7');
};

export const tsnePlotConfig = {
  backgroundType: 'panel',
  graphType: 'Scatter2D',
  xAxisTitle: 'V1',
  yAxisTitle: 'V2',
  showLegend: true,
  outline: false,
  panelBackgroundColor: corePalette.white,
  plotBackgroundBorderColor: corePalette.white,
  xAxisGridMajorColor: corePalette.white,
  xAxisGridMinorColor: corePalette.white,
  yAxisGridMajorColor: corePalette.white,
  yAxisGridMinorColor: corePalette.white,
  dataPointSizeScaleFactor: 0.7,
  decorationsOnTop: true,
  decorationsClipped: false,
  scatterPlotMatrix: false,
  segregateSamplesBy: [],
  segregateVariablesBy: [],
  showLegendTitle: false,
  showOutlineLegend: false,
  showLegendBorder: false,
  showColorEdgeLegend: false,
  showColorNodeLegend: false,
  legendInside: false,
  legendKeyBackgroundBorderColor: corePalette.white,
  legendKeyBackgroundColor: corePalette.white,
  legendTextMargin: '0.1',
  legendTextScaleFontFactor: 0.4,
  legendPosition: 'right',
  legendStyleGgplot: true,
  smpLabelScaleFactor: 0,
  showDecorations: true,
  showDecorationsLegend: true,
  widgetsBaseColor: corePalette.blue100,
  widgetsBorderColor: corePalette.blue100,
  widgetsContrastColor: corePalette.white,
  widgetsFontColor: corePalette.offBlack100,
  xAxis: ['V1'],
  yAxis: ['V2'],
  showXAxis: true,
  showYAxis: true,
  xAxisShow: true,
  yAxisShow: true,
  scatterOutlineThreshold: 0,
  colors: generateTSNEColors(25),
} as const;
