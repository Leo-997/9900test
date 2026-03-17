/* eslint-disable no-console */

/*
 * This script back-fills the zcc_analysis_set.curation_finalised_at field.
 * It takes the sample's corresponding zccreports.zcc_reports.approved_at date
 * for the molecular report as an approximation of when the curation workflow
 * was finalised.
 */

import knex from 'knex';
import { IAnalysisSet } from 'Models/Analysis/AnalysisSets.model';
import { knexConnectionConfig } from '../../../knexfile';

const zdKnex = knex(knexConnectionConfig);

type RawAnalysisSet = Pick<IAnalysisSet, 'analysisSetId' | 'patientId'>;
type HydratedAnalysisSet = RawAnalysisSet & {
  curationFinalisedAt: string | null;
};

async function getFinalisedCurationCases(): Promise<RawAnalysisSet[]> {
  return zdKnex
    .select({
      analysisSetId: 'a.analysis_set_id',
      patientId: 'a.patient_id',
    })
    .from({ a: 'zcc_analysis_set' })
    .where('a.curation_status', 'Curation Done');
}

async function getReportDates(cases: RawAnalysisSet[]): Promise<HydratedAnalysisSet[]> {
  return Promise.all(cases.map(async (c) => {
    const resp = await zdKnex
      .select('approved_at')
      .from('zccreports.zcc_reports')
      .where('analysis_set_id', c.analysisSetId)
      .andWhere('type', 'MOLECULAR_REPORT')
      .andWhere('status', 'approved')
      .first();

    return {
      ...c,
      curationFinalisedAt: resp?.approved_at,
    };
  }));
}

async function loadData(cases: HydratedAnalysisSet[]): Promise<void> {
  await Promise.all(cases.filter((c) => c.curationFinalisedAt).map(async (c) => {
    console.log(`Loading date ${c.curationFinalisedAt} for patient ${c.patientId} in set ${c.analysisSetId}`);

    await zdKnex
      .update({
        curation_finalised_at: c.curationFinalisedAt,
      })
      .from('zcc_analysis_set')
      .where('analysis_set_id', c.analysisSetId)
      .andWhere('patient_id', c.patientId);
  }));
}

async function populateCurationFinalisedAt(): Promise<void> {
  console.log('Fetching case data..');
  const cases = await getFinalisedCurationCases();

  console.log('Approximating dates for curation_finalised_at..');
  const hydratedCases = await getReportDates(cases);

  await loadData(hydratedCases);

  process.exit(0);
}

populateCurationFinalisedAt();
