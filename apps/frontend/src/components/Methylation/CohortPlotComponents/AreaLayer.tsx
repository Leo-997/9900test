import { ICohortStats } from '@/types/Methylation.types';
import { getMGMTStatusBackgroundColour } from '@/utils/functions/getMGMTStatusIcon';
import { ComputedSeries } from '@nivo/line';
import { useMemo, type JSX } from 'react';

export interface IAreaLayerProps {
  series: readonly ComputedSeries<ICohortStats>[];
  xScale: (value: string | number) => number;
  yScale: (value: number) => number;
}

export default function AreaLayer({
  series,
  xScale,
  yScale,
}: IAreaLayerProps): JSX.Element {
  const areaPaths = useMemo(
    () => series.map(({ id, data }) => {
      const highPath = data
        .map((d) => {
          const x = d.data.x instanceof Date ? d.data.x.getTime() : d.data.x ?? '';
          const high = d.data.high ?? 0;
          return `${xScale(x)},${yScale(high)}`;
        })
        .join(' ');

      const lowPath = data
        .map((d) => {
          const x = d.data.x instanceof Date ? d.data.x.getTime() : d.data.x ?? '';
          const low = d.data.low ?? 0;
          return `${xScale(x)},${yScale(low)}`;
        })
        .reverse()
        .join(' ');

      return { id, path: `M${highPath} L${lowPath} Z` };
    }),
    [series, xScale, yScale],
  );
  return (
    <g>
      {areaPaths.map(({ id, path }) => {
        const stringId = id !== undefined ? String(id) : '';
        return (
          <path
            key={stringId}
            d={path}
            fill={getMGMTStatusBackgroundColour(stringId, true)}
            stroke="none"
          />
        );
      })}
    </g>
  );
}
