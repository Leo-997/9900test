import { IDetailedHTSDrugCombination } from '@/types/HTS.types';
import {
    Divider, Grid,
    styled,
} from '@mui/material';
import DataPanel from '../Common/DataPanel';

import type { JSX } from "react";

const Item = styled(Grid)(() => ({
  padding: '8px',
}));

interface IProps {
  combination: IDetailedHTSDrugCombination;
}

export function HTSCombinationModalContent({
  combination,
}: IProps): JSX.Element {
  return (
    <Grid container direction="row">
      <Grid container width="100%">
        <Item size={{ xs: 12, md: 6 }}>
          <DataPanel label="DRUG 1 NAME" value={combination.screen1Data?.drugName} />
        </Item>
        <Item size={{ xs: 12, md: 6 }}>
          <DataPanel label="DRUG 2 NAME" value={combination.screen2Data?.drugName} />
        </Item>
      </Grid>
      <Grid container width="100%">
        <Item size={{ xs: 12, md: 6 }}>
          <DataPanel label="DRUG 1 COMPOUND ID" value={combination.screen1Data?.internalId} />
        </Item>
        <Item size={{ xs: 12, md: 6 }}>
          <DataPanel label="DRUG 2 COMPOUND ID" value={combination.screen2Data?.internalId} />
        </Item>
      </Grid>
      <Item size={{ xs: 12 }}>
        <Divider variant="middle" orientation="horizontal" />
      </Item>
      <Grid container width="100%">
        <Item size={{ xs: 12, md: 6 }}>
          <DataPanel label="DRUG 1 % Effect at Css" value={combination.effectCssScreen1} />
        </Item>
        <Item size={{ xs: 12, md: 6 }}>
          <DataPanel label="DRUG 2 % Effect at Css" value={combination.effectCssScreen2} />
        </Item>
      </Grid>
      <Grid container width="100%">
        <Item size={{ xs: 12, md: 6 }}>
          <DataPanel label="DRUG 1 % Effect at Cmax" value={combination.effectCmaxScreen1} />
        </Item>
        <Item size={{ xs: 12, md: 6 }}>
          <DataPanel label="DRUG 2 % Effect at Cmax" value={combination.effectCmaxScreen2} />
        </Item>
      </Grid>
      <Item size={{ xs: 12 }}>
        <Divider variant="middle" orientation="horizontal" />
      </Item>
      <Grid container width="100%">
        <Item size={{ xs: 12, md: 6, lg: 4 }}>
          <DataPanel label="Combination Effect" value={combination.combinationEffect} />
        </Item>
        <Item size={{ xs: 12, md: 6, lg: 4 }}>
          <DataPanel label="Combination % Effect at Css" value={combination.effectCssCombo} />
        </Item>
        <Item size={{ xs: 12, md: 6, lg: 4 }}>
          <DataPanel label="Combination % Effect at Cmax" value={combination.effectCmaxCombo} />
        </Item>
      </Grid>
    </Grid>
  );
}
