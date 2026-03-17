import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import {
    Grid,
} from '@mui/material';
import GridSummary from '../PatientProfile/GridSummary';
import TumourMolecularProfileSummary from '../PatientProfile/TumourMolecularProfileSummary';
import TumourImmuneProfileSummary from '../PatientProfile/TumourImmuneProfileSummary';
import QCMetricsInfo from './QCMetricsInfo';

import type { JSX } from "react";

export default function TumourProfileInfo(): JSX.Element {
  const {
    metrics, primaryBiosample, purity, analysisSet,
  } = useAnalysisSet();

  return (
    <Grid container spacing={2}>
      <GridSummary
        view="qc"
        qcStatus={
            metrics?.find(
              (metric) => metric.biosampleId === primaryBiosample?.biosampleId,
            )?.qcStatus ?? ''
          }
        aQC={
            metrics?.find(
              (metric) => metric.biosampleId === primaryBiosample?.biosampleId,
            )?.amberQC ?? ''
          }
        mutationsPerMb={analysisSet.mutBurdenMb}
        mbTargetable={analysisSet.targetable}
        contamination={
            metrics?.find(
              (metric) => metric.biosampleId === primaryBiosample?.biosampleId,
            )?.amberContaminationPct ?? -1
          }
        purity={{
          avg: purity?.purity,
          min: purity?.minPurity,
          max: purity?.maxPurity,
        }}
        ploidy={{
          avg: purity?.ploidy,
          min: purity?.minPloidy,
          max: purity?.maxPloidy,
        }}
      />
      <TumourMolecularProfileSummary />
      <TumourImmuneProfileSummary />
      <QCMetricsInfo />
    </Grid>
  );
}
