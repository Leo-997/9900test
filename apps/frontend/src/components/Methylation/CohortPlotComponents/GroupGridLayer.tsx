import { ICohortStats } from '@/types/Methylation.types';
import { CommonCustomLayerProps } from '@nivo/line';
import GroupGrid from './GroupGrid';

function GroupGridLayer(props: CommonCustomLayerProps<ICohortStats>): React.ReactNode {
  const { innerHeight, series, ...rest } = props;

  const transformedData = series.map((serie) => ({
    data: serie.data.map((datum) => ({
      x: String(datum.position.x ?? ''),
      y: String(datum.position.y ?? ''),
    })),
  }));

  return <GroupGrid {...rest} chartHeight={innerHeight} dataArray={transformedData} />;
}

export default GroupGridLayer;
