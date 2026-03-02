/* eslint-disable no-await-in-loop */
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import knex from 'knex';
import xlsx from 'node-xlsx';
import { v4 } from 'uuid';
import { ReportType } from '@zero-dash/types';
import { knexConnectionConfig } from '../../../knexfile';

dayjs.extend(customParseFormat);

const FILE_NAME = `${__dirname}/../../../input_files/odd_cases.xlsx`;
const SHEET_NAME = 'Sheet1';

const zdKnex = knex(knexConnectionConfig);
const parsed = xlsx.parse(FILE_NAME);

interface IReportPatient {
  reportId: string;
  reportType: ReportType;
  status: string;
  approvedAt?: string;
  analysisSetId: string;
}

async function getReportForAnalysis(analysisSetId: string): Promise<IReportPatient[]> {
  return zdKnex
    .select({
      reportId: 'report.id',
      analysisSetId: 'report.analysis_set_id',
      reportType: 'type',
      status: 'status',
      approvedAt: 'approved_at',
    })
    .from({ report: 'zcc_reports' })
    .where('report.analysis_set_id', analysisSetId)
    .whereIn('status', ['approved', 'pending']);
}

async function getAnalysisSet(biosampleId: string): Promise<string | null> {
  return zdKnex
    .select({
      analysisSetId: 'analysis.analysis_set_id',
    })
    .from({ analysis: 'zcczerodashhg38.zcc_analysis_set_biosample_xref' })
    .innerJoin({ biosample: 'zcczerodashhg38.zcc_biosample' }, 'analysis.biosample_id', 'biosample.biosample_id')
    .where('biosample.biosample_id', biosampleId)
    .first()
    .then((resp) => resp.analysisSetId)
    .catch(() => null);
}

async function insertOrUpdateReport(
  analysisSetId: string,
  date: string,
  reportType: ReportType,
  report?: IReportPatient,
): Promise<void> {
  if (report) {
    console.log(`[INFO] - Updating ${reportType} report for:`, analysisSetId);
    await zdKnex.update({ approved_at: date })
      .from('zcc_reports')
      .where('id', report.reportId);
  } else {
    console.log(`[INFO] - Inserting ${reportType} report for:`, analysisSetId);
    await zdKnex.insert({
      id: v4(),
      type: reportType,
      analysis_set_id: analysisSetId,
      status: 'approved',
      approved_at: date,
      created_by: 'sysadmin',
    })
      .into('zcc_reports');
  }
}

async function run(): Promise<void> {
  const { data: sheetReports } = parsed.find((sheet) => sheet.name === SHEET_NAME);

  for (
    const [
      ,
      ,
      biosampleId,
      dirtyMolReportDate,
      dirtyGermReportDate,,
      dirtyMtbReportDate,
    ] of sheetReports.slice(1)
  ) {
    const analysisSetId = await getAnalysisSet(biosampleId);
    let reports = await getReportForAnalysis(analysisSetId);
    const molReportDate = dirtyMolReportDate
      ? dayjs(dirtyMolReportDate, 'DD/DD/YYYY').toISOString().slice(0, 19).replace('T', ' ')
      : null;
    const germReportDate = dirtyGermReportDate
      ? dayjs(dirtyGermReportDate, 'DD/DD/YYYY').toISOString().slice(0, 19).replace('T', ' ')
      : null;
    const mtbReportDate = dirtyMtbReportDate
      ? dayjs(dirtyMtbReportDate, 'DD/DD/YYYY').toISOString().slice(0, 19).replace('T', ' ')
      : null;

    if (molReportDate) {
      await insertOrUpdateReport(
        analysisSetId,
        molReportDate,
        'MOLECULAR_REPORT',
        reports.find((report) => report.reportType === 'MOLECULAR_REPORT'),
      );
    }

    if (germReportDate) {
      await insertOrUpdateReport(
        analysisSetId,
        germReportDate,
        'GERMLINE_REPORT',
        reports.find((report) => report.reportType === 'GERMLINE_REPORT'),
      );
    }

    if (mtbReportDate) {
      await insertOrUpdateReport(
        analysisSetId,
        mtbReportDate,
        'MTB_REPORT',
        reports.find((report) => report.reportType === 'MTB_REPORT'),
      );
    }

    // fetch reports again after update
    reports = await getReportForAnalysis(analysisSetId);
    const latestDate = reports
      .filter((r) => r.approvedAt)
      .map((r) => r.approvedAt)
      .reduce(
        (latest, current) => (current > latest ? current : latest),
      );

    console.log(`[INFO] - Closing ${biosampleId} to ${latestDate}`);
    await zdKnex.update({ case_finalised_at: latestDate })
      .from('zcczerodashhg38.zcc_analysis_set')
      .where('analysis_set_id', analysisSetId)
      .where('curation_status', 'Done');
  }

  process.exit(0);
}

run();
