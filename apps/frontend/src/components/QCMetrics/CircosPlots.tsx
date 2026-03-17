import { useEffect, useState, type JSX } from 'react';

import { Grid } from '@mui/material';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import PlotCard from '../QCPlots/PlotCard';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';

import { CIRCOS_PLOT_DATA } from '../../constants/plots';
import { CircosPlots as Circos } from '../../types/Plot.types';

export default function CircosPlots(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { primaryBiosample } = useAnalysisSet();

  const [urls, setURLs] = useState<Circos>({
    circos: undefined,
    circosRaw: undefined,
  });

  useEffect(() => {
    async function getCircosPlots(): Promise<void> {
      if (primaryBiosample?.biosampleId) {
        const data = await zeroDashSdk.plots.getCircosPlots(
          primaryBiosample.biosampleId,
        );
        if (data) {
          setURLs(data);
        }
      }
    }

    getCircosPlots();
  }, [primaryBiosample?.biosampleId, zeroDashSdk.plots]);

  return (
    <Grid container spacing={2} justifyContent="center" size={12}>
      <Grid size={{ md: 6 }}>
        <PlotCard
          title="Circos"
          url={urls.circos}
          legendTitle="Circos Info"
          legendData={CIRCOS_PLOT_DATA.CIRCOS}
        />
      </Grid>
      <Grid size={{ md: 6 }}>
        <PlotCard
          title="Raw Data Circos"
          url={urls.circosRaw}
          legendTitle="Circos Info"
          legendData={CIRCOS_PLOT_DATA.RAW_CIRCOS}
        />
      </Grid>
    </Grid>
  );
}
