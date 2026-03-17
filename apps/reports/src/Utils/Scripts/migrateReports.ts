/* eslint-disable no-console */
import knex, { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import { Approval, ApprovalStatus, ReportType } from '@zero-dash/types';
import { knexConnectionConfig } from '../../../knexfile';

const reportsKnex = knex(knexConnectionConfig);
const ftKnex = knex({
  ...knexConnectionConfig,
  connection: {
    ...knexConnectionConfig.connection as Knex.MySql2ConnectionConfig,
    database: 'zcc_tracker',
  },
});
const zdKnex = knex({
  ...knexConnectionConfig,
  connection: {
    ...knexConnectionConfig.connection as Knex.MySql2ConnectionConfig,
    database: 'zcczerodashhg38',
  },
});

interface IFileTrackerReport {
  fileId: string;
  sampleId: string;
  version: string;
  type: ReportType;
  updatedAt: string;
}

interface IOldReport {
  type: ReportType;
  requestNumber: number;
  sampleId: string;
  approvalsRaw: string;
  approvals?: Approval[];
}

// get reports from file tracker database
// all of these are approved reports
async function getGeneratedReports(): Promise<IFileTrackerReport[]> {
  return ftKnex.select({
    fileId: 'datafile.file_id',
    sampleId: 'datafile.sample_id',
    version: 'report.version',
    type: 'report.report_type',
    updatedAt: 'datafile.updated_at',
  })
    .from({ datafile: 'datafiles' })
    .innerJoin({ report: 'zcc_zd_reports' }, 'datafile.file_id', 'report.file_id');
}

// get all the old reports in an aggregate
async function getOldReports(): Promise<IOldReport[]> {
  return zdKnex.select({
    type: 'type',
    sampleId: 'sample_id',
    requestNumber: 'request_number',
    approvalsRaw: zdKnex.raw(`
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', id,
          'reportId', '',
          'status', status,
          'groupId', role,
          'assigneeId', assignee,
          'approvedBy', approved_by,
          'approvedAt', approved_at,
          'createdAt', created_at,
          'createdBy', created_by,
          'updatedAt', updated_at,
          'updatedBy', updated_by
        )
      )
    `),
  })
    .from('zcc_approvals')
    .groupBy([
      'type',
      'sample_id',
      'request_number',
    ])
    .then((resp: IOldReport[]) => (
      resp.map((report) => ({
        ...report,
        approvals: JSON.parse(report.approvalsRaw),
      }))
    ));
}

function getReportStatus(approvals: Approval[]): ApprovalStatus {
  if (approvals.every((a) => a.status === 'approved')) {
    return 'approved';
  }

  if (approvals.some((a) => a.status === 'pending')) {
    return 'pending';
  }

  if (approvals.some((a) => a.status === 'cancelled')) {
    return 'cancelled';
  }

  return 'rejected';
}

function getReportApprovedAt(approvals: Approval[]): string | null {
  if (approvals.every((a) => a.status === 'approved')) {
    return approvals.sort((a, b) => (
      (new Date(a.approvedAt)).getTime() - (new Date(b.approvedAt)).getTime()
    ))[0].approvedAt || null;
  }

  return null;
}

// insert report and approvals in reports MS
async function insertNewReports(
  oldReports: IOldReport[],
  files: IFileTrackerReport[],
): Promise<void> {
  await Promise.all(
    oldReports.map((report) => (
      reportsKnex.transaction(async (trx) => {
        console.log(`[INFO] Inserting report: ${report.type} ${report.sampleId} ${report.requestNumber}`);
        const id = uuid();
        const reportStatus = report.approvals && report.approvals.length > 0
          ? getReportStatus(report.approvals)
          : null;
        const fileId = reportStatus === 'approved'
          ? files.find(
            (f) => (
              f.type === report.type
              && parseInt(f.version, 10) === report.requestNumber
              && f.sampleId === report.sampleId
            ),
          )?.fileId : null;
        if (!fileId) {
          console.log(`[WARNING] Could not file for report: ${report.type} ${report.sampleId} ${report.requestNumber}`);
        }
        await trx.insert({
          id,
          sample_id: report.sampleId,
          type: report.type,
          status: reportStatus,
          approved_at: report.approvals && report.approvals.length > 0
            ? getReportApprovedAt(report.approvals)
            : null,
          file_id: fileId,
          // first created approval time
          created_at: report.approvals?.sort((a, b) => (
            (new Date(a.createdAt)).getTime() - (new Date(b.createdAt)).getTime()
          ))[0].createdAt,
          // fist create approval user
          created_by: report.approvals?.sort((a, b) => (
            (new Date(a.createdAt)).getTime() - (new Date(b.createdAt)).getTime()
          ))[0].createdBy || 'sysadmin',
          // set to most recently updated approval time
          updated_at: report.approvals?.sort((a, b) => (
            (new Date(b.updatedAt)).getTime() - (new Date(a.updatedAt)).getTime()
          ))[0].updatedAt,
          // set to most recently updated approval user
          updated_by: report.approvals?.sort((a, b) => (
            (new Date(b.updatedAt)).getTime() - (new Date(a.updatedAt)).getTime()
          ))[0].updatedBy,
        })
          .into('zcc_reports');

        if (report.approvals) {
          await trx.insert(report.approvals.map((approval) => ({
            id: approval.id,
            report_id: id,
            status: approval.status,
            group_id: approval.groupId,
            assignee_id: approval.assigneeId,
            approved_by: approval.approvedBy,
            approved_at: approval.approvedAt,
            created_by: approval.createdBy,
            created_at: approval.createdAt,
            updated_by: approval.updatedBy,
            updated_at: approval.updatedAt,
          })))
            .into('zcc_approvals');
        }

        // update comments
        await zdKnex.update({
          entity_id: id,
        })
          .from('zcc_curation_comment_thread')
          .where('sample_id', report.sampleId)
          .where('entity_type', report.type)
          .where('entity_id', report.requestNumber.toString());

        // update evidence
        await zdKnex.update({
          variant_id: id,
        })
          .from('zcc_evidences')
          .where('sample_id', report.sampleId)
          .where('variant_type', report.type)
          .where('variant_id', report.requestNumber.toString());
      })
        .then(() => console.log(`[SUCCESS] Inserted report: ${report.type} ${report.sampleId} ${report.requestNumber}`))
        .catch((e) => console.log(`[ERROR] Could not insert report: ${report.type} ${report.sampleId} ${report.requestNumber}`, e))
    )),
  );
}

async function migrateReports(): Promise<void> {
  const oldReports = await getOldReports();
  const files = await getGeneratedReports();
  console.log(files[0], oldReports[0], files.length);
  console.log(`Found ${oldReports.length} reports to insert`);
  await insertNewReports(oldReports, files);
  process.exit(0);
}

migrateReports();
