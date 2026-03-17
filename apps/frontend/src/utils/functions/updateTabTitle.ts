import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IClinicalSample } from '../../types/Samples/Sample.types';

export default function updateTabTitle(
  activeSample?: IAnalysisSet | IClinicalSample,
): void {
  const values: string[] = [];
  const env = import.meta.env.VITE_ENV;

  if (env && env !== 'production') {
    values.push(env[0].toUpperCase() + env.slice(1));
  }

  if (activeSample) {
    values.push(activeSample.patientId);

    if ('eventType' in activeSample) {
      values.push(activeSample.eventType);
    }

    if ('event' in activeSample) {
      values.push(activeSample.event);
    }
  }

  document.title = [...values, 'ZeroDash'].join(' - ');
}
