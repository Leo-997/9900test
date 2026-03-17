import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState, type JSX } from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { MutSigPlots } from '../../types/Plot.types';
import PlotCard from '../QCPlots/PlotCard';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';

const useStyles = makeStyles(() => ({
  wrapper: {
    width: '100%',
    marginTop: '17px',
    marginBottom: '8px',
  },
}));

export default function GraphPanel(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { tumourBiosample } = useAnalysisSet();

  const [links, setLinks] = useState<MutSigPlots>();

  useEffect(() => {
    async function getPlots(): Promise<void> {
      if (tumourBiosample?.biosampleId) {
        const data = await zeroDashSdk.plots.getMutSigPlots(tumourBiosample.biosampleId);
        setLinks(data);
      }
    }

    getPlots();
  }, [tumourBiosample?.biosampleId, zeroDashSdk.plots]);

  return (
    <Grid
      container
      spacing={2}
      justifyContent="space-between"
      className={classes.wrapper}
    >
      <Grid size={4}>
        <PlotCard
          legendTitle="Mutational Signatures Fit"
          legendData={[
            {
              title: 'Mutational Signatures Fit',
              summary: '',
              content: `\u2022 weights assigned to each of the k signatures of the input signatures matrix

              \u2022 tumour -- matrix of the trinucleotide contexts for the tumour sample used as input
              
              \u2022 product -- matrix obtained when the tumour matrix is multiplied by the assigned weights
              
              \u2022 diff -- matrix representing the difference between the tumour matrix and product matrix
              
              \u2022 unknown -- numeric weight not assigned to any of the input signatures`,
            },
          ]}
          title="Mutational Signatures Fit"
          url={links?.fit.plotURL}
        />
      </Grid>
      <Grid size={4}>
        <PlotCard
          legendTitle="COSMIC Profile Matching"
          legendData={[
            {
              title: 'COSMIC Profile Matching',
              summary: '',
              content:
                'Somatic mutations are present in all cells of the human body and occur throughout life. They are the consequence of multiple mutational processes, including the intrinsic slight infidelity of the DNA replication machinery, exogenous or endogenous mutagen exposures, enzymatic modification of DNA and defective DNA repair. Different mutational processes generate unique combinations of mutation types, termed “Mutational Signatures”.',
            },
          ]}
          title="COSMIC Profile Matching"
          url={links?.matching.plotURL}
        />
      </Grid>
      <Grid size={4}>
        <PlotCard
          legendTitle="Tissue Matrix"
          legendData={[
            {
              title: 'Tissue Matrix',
              summary: '',
              content:
                'Mutational signatures across human cancer. The patient’s signature is in the last column.',
            },
          ]}
          title="Tissue Matrix"
          url={links?.matrix.plotURL}
        />
      </Grid>
    </Grid>
  );
}
