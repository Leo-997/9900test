/* eslint-disable no-await-in-loop */
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { knex } from 'knex';
import xlsx from 'node-xlsx';
import { v4 } from 'uuid';
import { knexConnectionConfig } from '../../../knexfile';

dayjs.extend(customParseFormat);

const FILE_NAME = `${__dirname}/../../../input_files/mtb_report_dates.xlsx`;
const SHEET_NAME = 'Sheet1';

const zdKnex = knex(knexConnectionConfig);
const parsed = xlsx.parse(FILE_NAME);

interface IReportPatient {
    reportId: string;
    patientId: string;
    analysisSetId: string;
}

async function getZeroDashMTBReports(): Promise<IReportPatient[]> {
  return zdKnex
    .distinct({
      reportId: 'report.id',
      patientId: 'analysis.patient_id',
      analysisSetId: 'report.analysis_set_id',
    })
    .from({ report: 'zcc_reports' })
    .leftJoin({ analysis: 'zcczerodashhg38.zcc_analysis_set' }, 'analysis.analysis_set_id', 'report.analysis_set_id')
    .where('report.type', 'MTB_REPORT')
    .where('status', 'approved');
}

async function getAnalysisSet(biomaterialId: string): Promise<string | null> {
  return zdKnex
    .select({
      analysisSetId: 'analysis.analysis_set_id',
    })
    .from({ analysis: 'zcczerodashhg38.zcc_analysis_set_biosample_xref' })
    .innerJoin({ biosample: 'zcczerodashhg38.zcc_biosample' }, 'analysis.biosample_id', 'biosample.biosample_id')
    .where('biosample.biomaterial_id', biomaterialId)
    .first()
    .then((resp) => resp.analysisSetId)
    .catch(() => null);
}

async function run(): Promise<void> {
  let zeroReports = await getZeroDashMTBReports();
  console.log(zeroReports.length);
  const { data: sheetReports } = parsed.find((sheet) => sheet.name === SHEET_NAME);

  for (const [patientId,,, date, biomaterialId] of sheetReports.slice(1)) {
    const analysisSetId = await getAnalysisSet(biomaterialId);
    const report = zeroReports.find((r) => r.analysisSetId === analysisSetId);
    const correctDate = dayjs(date, 'D/M/YYYY').toISOString().slice(0, 19).replace('T', ' ');
    if (!analysisSetId) {
      console.log('[ERROR] Could not find analysis set for', patientId, biomaterialId);
    }
    if (!report) {
      console.log('[ERROR] Could not find report for', patientId, biomaterialId, analysisSetId);
      // Create empty report for the cases that we don't have a report for
      await zdKnex.insert({
        id: v4(),
        type: 'MTB_REPORT',
        analysis_set_id: analysisSetId,
        status: 'approved',
        approved_at: correctDate,
        created_by: 'sysadmin',
      })
        .from('zcc_reports');
    } else {
      // Remove the found report from the list
      zeroReports = zeroReports.filter((r) => r.analysisSetId !== analysisSetId);
      // update the report date
      await zdKnex.update({ approved_at: correctDate })
        .from('zcc_reports')
        .where('id', report.reportId);

      // set case_finalised_at
      await zdKnex.update({ case_finalised_at: correctDate })
        .from('zcczerodashhg38.zcc_analysis_set')
        .where('analysis_set_id', analysisSetId)
        .where('curation_status', 'Done');
    }
  }

  // what's remaining is what we need dates for
  console.log(JSON.stringify(zeroReports));
  console.log(zeroReports.length);

  process.exit(0);
}

run();
