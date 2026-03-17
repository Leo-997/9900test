import { corePalette } from '@/themes/colours';
import { DataPoint } from '@/types/Methylation.types';

import type { JSX } from "react";

export interface IGroupGridProps {
  xScale: (value: string) => number;
  chartHeight: number;
  dataArray: readonly { data: readonly DataPoint[] }[];
}

export default function GroupGrid({
  xScale,
  chartHeight,
  dataArray,
}: IGroupGridProps): JSX.Element {
  const boldedPrefixes = ['cg12434587', 'cg12981137'];
  const uniquePrefixes = [
    ...new Set(
      dataArray.flatMap((d) => d.data.map((p) => p.x.split('_')[0])),
    ),
  ];
  return (
    <g>
      {uniquePrefixes.map((prefix, index) => {
        if (index === 0) return null;

        const firstValue = dataArray
          .flatMap((d) => d.data)
          .find((p) => p.x.startsWith(prefix));

        if (!firstValue) return null;

        const x = xScale(firstValue.x);
        const xOffset = 35;
        const yOffset = 10;

        return (
          <g key={String(prefix)}>
            <line
              x1={x}
              x2={x}
              y1={0}
              y2={chartHeight}
              stroke={`${corePalette.offBlack100}80`}
              strokeDasharray="20 3"
            />
            <text
              x={x - 30}
              y={chartHeight - 22}
              textAnchor="middle"
              fontSize={12}
              fontWeight={boldedPrefixes.includes(prefix) ? 'bold' : 'normal'}
              fill={corePalette.offBlack100}
              transform={`rotate(-90, ${x + xOffset}, ${chartHeight + yOffset})`}
            >
              {prefix}
            </text>
          </g>
        );
      })}
    </g>
  );
}
