import type { MetricDefinition } from './types';

export const defaultComparisonMetrics: MetricDefinition[] = [
  {
    id: 'analysisSetId',
    label: 'Analysis set ID',
    getValue: (s) => s.analysisSetId,
  },
  {
    id: 'sequencedEvent',
    label: 'Sequenced event',
    getValue: (s) => s.analysisSet?.sequencedEvent ?? '-',
  },
  {
    id: 'diagnosisEvent',
    label: 'Diagnosis event',
    getValue: (s) => s.analysisSet?.diagnosisEvent ?? '-',
  },
  {
    id: 'analysisEvent',
    label: 'Analysis event',
    getValue: (s) => s.analysisSet?.analysisEvent ?? '-',
  },
  {
    id: 'zero2FinalDiagnosis',
    label: 'ZERO2 final diagnosis',
    getValue: (s) => s.analysisSet?.zero2FinalDiagnosis ?? '-',
  },
  {
    id: 'cohort',
    label: 'Cohort',
    getValue: (s) => s.analysisSet?.cohort ?? '-',
  },
  {
    id: 'purity',
    label: 'Purity',
    getValue: (s) => (
      typeof s.analysisSet?.purity === 'number'
        ? String(s.analysisSet.purity)
        : '-'
    ),
  },
  {
    id: 'mutBurdenMb',
    label: 'Mutational burden (Mb)',
    getValue: (s) => (
      typeof s.analysisSet?.mutBurdenMb === 'number'
        ? String(s.analysisSet.mutBurdenMb)
        : '-'
    ),
  },
];

