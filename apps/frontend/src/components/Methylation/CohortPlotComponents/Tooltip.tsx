import NivoTooltipWrapper from '@/components/Common/Nivo/TooltipWrapper';
import { ICohortPointData, ICohortStats } from '@/types/Methylation.types';
import { PointTooltipProps } from '@nivo/line';

import type { JSX } from "react";

export default function Tooltip({ point }: PointTooltipProps<ICohortStats>): JSX.Element | null {
  if (!point || !point.data) {
    return null;
  }

  const {
    x, y, low, high, pos,
  } = point.data as ICohortPointData;

  const renderContent = (): JSX.Element => (
    <>
      <div>
        Probe ID:
        {' '}
        {x.toString()}
      </div>
      <div>
        Mean:
        {' '}
        {y}
      </div>
      {low !== undefined && (
        <div>
          Lower bound:
          {' '}
          {low}
        </div>
      )}
      {high !== undefined && (
        <div>
          Upper bound:
          {' '}
          {high}
        </div>
      )}
      {pos !== undefined && (
        <div>
          Position in chr10:
          {' '}
          {pos}
        </div>
      )}
    </>
  );

  return (
    <NivoTooltipWrapper
      title={point.seriesId}
      renderContent={renderContent}
    />
  );
}
