import { useEffect, useState, type JSX } from 'react';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { QCPlots } from '@/types/Plot.types';
import { Grid } from '@mui/material';
import LoadingAnimation from '../Animations/LoadingAnimation';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import PlotCard from '../QCPlots/PlotCard';

export default function PlotsTabContent(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { primaryBiosample } = useAnalysisSet();

  const [plotData, setPlotData] = useState<QCPlots>();

  useEffect(() => {
    async function getAllPlots(): Promise<void> {
      if (primaryBiosample?.biosampleId) {
        const data = await zeroDashSdk.plots.getQCPlots(primaryBiosample.biosampleId);
        setPlotData(data);
      }
    }

    getAllPlots();
  }, [primaryBiosample?.biosampleId, zeroDashSdk.plots]);

  const data = plotData ? Object.entries(plotData).map(([key, value]) => [key, value]) : [];

  return (
    <Grid
      container
      justifyContent="center"
      spacing={2}
      marginBottom="64px"
    >
      {data.length > 0 ? (
        data.map((value, index) => {
          let newName = `${value[0].match(/[A-Z][a-z]+/g).join(' ')}`;
          if (value[0].match('purple') || value[0].match('vaf')) {
            newName = `Purple ${newName}`;
          } else if (value[0].match('rig')) {
            newName = 'RIG Plot';
          } else {
            newName = 'Copy Number Profile (WGS)';
          }

          return (
            <Grid
              size={{
                xs: 12,
                md: index === data.length - 1 || index === data.length - 2 ? 12 : 6,
                lg: index === data.length - 1 || index === data.length - 2 ? 6 : 4,
              }}
              key={value[0]}
            >
              <PlotCard
                title={newName}
                url={value[1].plotURL}
                legendTitle={newName}
                legendData={[
                  { title: '', content: value[1].legend, summary: '' },
                ]}
              />
            </Grid>
          );
        })
      ) : (
        <div
          style={{
            width: '100%', height: '100%', minHeight: '50px', marginTop: '100px',
          }}
        >
          <LoadingAnimation />
        </div>
      )}
    </Grid>
  );
}
