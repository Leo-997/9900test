import { Box, styled } from '@mui/material';
import { corePalette } from '@/themes/colours';
import {
  ResponsiveLine,
} from '@nivo/line';
import { AxisTickProps } from '@nivo/axes';
import { useMemo, type JSX } from 'react';
import { ICohortStats, IMethCounts } from '@/types/Methylation.types';
import PlotInfoToolTip, { PlotLegendItem } from '../QCPlots/PlotInfoToolTip';
import Typography from '../Common/Typography';
import { getMGMTStatusBackgroundColour } from '../../utils/functions/getMGMTStatusIcon';
import AreaLayer from './CohortPlotComponents/AreaLayer';
import GroupGridLayer from './CohortPlotComponents/GroupGridLayer';
import Tooltip from './CohortPlotComponents/Tooltip';

const Card = styled(Box)(() => ({
  backgroundColor: corePalette.white,
  borderRadius: '8px',
  height: '550px',
  padding: '0 20px 20px 20px',
  width: '100%',
  marginTop: '24px',
}));

const Title = styled(Box)(() => ({
  paddingLeft: '25px',
  paddingTop: '20px',
}));

export interface IMGMTCohortProps {
  data: ICohortStats[];
  biosampleId: string;
  methMGMTCount: IMethCounts;
}

export default function MGMTCohort({
  data,
  biosampleId,
  methMGMTCount,
}: IMGMTCohortProps): JSX.Element {
  const legendData = useMemo(() => [
    {
      id: 'methylated',
      count: methMGMTCount.methylatedCount,
      color: getMGMTStatusBackgroundColour('methylated'),
      label: `methylated (n = ${methMGMTCount.methylatedCount})`,
    },
    {
      id: 'unmethylated',
      count: methMGMTCount.unmethylatedCount,
      color: getMGMTStatusBackgroundColour('unmethylated'),
      label: `unmethylated (n = ${methMGMTCount.unmethylatedCount})`,
    },
    {
      id: biosampleId,
      count: null,
      color: corePalette.offBlack200,
      label: biosampleId,
    },
  ], [methMGMTCount, biosampleId]);

  const legend: PlotLegendItem = {
    title: 'Description',
    summary: 'CNS Cohort MGMT Plot Information',
    content: `This plot illustrates the variability in β values across different probes in methylated and unmethylated MGMT promoters.
    
      For each position, the mean β value and its standard deviation are calculated. The shaded regions represent the range of two standard deviations above and below the mean, capturing approximately 95.4% of values for normally distributed data. The red and green shaded areas correspond to methylated and unmethylated MGMT promoters in our CNS cohort, respectively. Black dots indicate the raw β values for the current sample.`,
  };

  return (
    <Card
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      align-content="center"
    >
      <Title
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
        align-content="center"
      >
        <Typography variant="h5">CNS Cohort MGMT Plot Info</Typography>
        <PlotInfoToolTip
          legendTitle="CNS Cohort MGMT Plot Info"
          legendData={[legend]}
        />
      </Title>
      <ResponsiveLine
        animate
        enableTouchCrosshair
        data={data}
        colors={({ id }: { id: string }): string => getMGMTStatusBackgroundColour(id)}
        tooltip={Tooltip}
        enablePoints
        enableCrosshair
        pointSize={10}
        useMesh
        margin={{
          top: 15,
          right: 55,
          bottom: 120,
          left: 50,
        }}
        xScale={{
          type: 'point',
        }}
        yScale={{
          type: 'linear', stacked: false, min: 0, max: 1,
        }}
        curve="linear"
        axisLeft={{
          tickRotation: 0,
          legend: 'Beta value',
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 10,
          tickRotation: 45,
          renderTick: ({
            value,
            x,
            y,
            opacity,
          }: AxisTickProps<string>): JSX.Element => {
            const suffix = typeof value === 'string' ? value.split('_')[1] : value;
            return (
              <g transform={`translate(${x},${y})`}>
                <line
                  x1={0}
                  x2={0}
                  y1={0}
                  y2={5}
                  stroke={corePalette.offBlack100}
                  strokeWidth={1}
                />
                <text
                  transform="rotate(-90)"
                  textAnchor="start"
                  dominantBaseline="middle"
                  opacity={opacity}
                  fontSize={12}
                  fill={corePalette.offBlack100}
                  x={-35}
                  y={0}
                >
                  {suffix}
                </text>
              </g>
            );
          },
        }}
        legends={[{
          data: legendData,
          anchor: 'top-right',
          direction: 'row',
          itemBackground: `${corePalette.offBlack100}10`,
          itemOpacity: 0.9,
          itemTextColor: corePalette.offBlack200,
          translateX: -40,
          translateY: 10,
          itemsSpacing: 30,
          itemDirection: 'left-to-right',
          itemWidth: 140,
          itemHeight: 20,
          symbolSize: 20,
          symbolShape: 'circle',
        },
        ]}
        layers={[
          'grid',
          'markers',
          'axes',
          AreaLayer,
          'areas',
          'lines',
          'points',
          GroupGridLayer,
          'slices',
          'mesh',
          'legends',
        ]}
      />
    </Card>
  );
}
